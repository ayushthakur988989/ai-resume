import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const databaseName = process.env.MONGODB_DB || 'ai-resume';
const jwtSecret = process.env.JWT_SECRET;

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const resumeSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    personal: { type: mongoose.Schema.Types.Mixed, default: {} },
    education: { type: [mongoose.Schema.Types.Mixed], default: [] },
    skills: { type: [String], default: [] },
    projects: { type: [mongoose.Schema.Types.Mixed], default: [] },
    experience: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);
resumeSchema.index({ userId: 1, clientId: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Resume = mongoose.model('Resume', resumeSchema);

const publicUser = (user) => ({ id: user._id.toString(), name: user.name, email: user.email });
const publicResume = (resume) => ({
  id: resume.clientId,
  userId: resume.userId.toString(),
  personal: resume.personal,
  education: resume.education,
  skills: resume.skills,
  projects: resume.projects,
  experience: resume.experience,
  createdAt: resume.createdAt,
  updatedAt: resume.updatedAt,
});
const createToken = (user) => jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: '7d' });

const authenticate = (request, response, next) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return response.status(401).json({ message: 'Please log in.' });
  try {
    request.userId = jwt.verify(token, jwtSecret).userId;
    next();
  } catch {
    response.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
};

app.get('/api/health', (_request, response) => {
  response.json({ success: true, message: 'AI Resume backend is running', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.post('/api/auth/register', authLimiter, async (request, response, next) => {
  try {
    const { name, email, password } = request.body;
    if (!name?.trim() || !email?.trim() || !password) return response.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return response.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (await User.exists({ email: email.toLowerCase().trim() })) return response.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash: await bcrypt.hash(password, 12) });
    response.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', authLimiter, async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return response.status(401).json({ message: 'Invalid email or password.' });
    response.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

app.get('/api/resumes', authenticate, async (request, response, next) => {
  try { response.json((await Resume.find({ userId: request.userId }).sort({ updatedAt: -1 })).map(publicResume)); }
  catch (error) { next(error); }
});

app.get('/api/resumes/:id', authenticate, async (request, response, next) => {
  try {
    const resume = await Resume.findOne({ clientId: request.params.id, userId: request.userId });
    if (!resume) return response.status(404).json({ message: 'Resume not found.' });
    response.json(publicResume(resume));
  } catch (error) { next(error); }
});

app.put('/api/resumes/:id', authenticate, async (request, response, next) => {
  try {
    const { personal, education, skills, projects, experience } = request.body;
    const resume = await Resume.findOneAndUpdate(
      { clientId: request.params.id, userId: request.userId },
      { $set: { personal, education, skills, projects, experience }, $setOnInsert: { clientId: request.params.id, userId: request.userId } },
      { new: true, upsert: true, runValidators: true }
    );
    response.json(publicResume(resume));
  } catch (error) { next(error); }
});

app.delete('/api/resumes/:id', authenticate, async (request, response, next) => {
  try {
    const result = await Resume.deleteOne({ clientId: request.params.id, userId: request.userId });
    if (!result.deletedCount) return response.status(404).json({ message: 'Resume not found.' });
    response.status(204).end();
  } catch (error) { next(error); }
});

app.use('/api', (_request, response) => response.status(404).json({ message: 'API route not found.' }));

app.use((error, _request, response, _next) => {
  console.error(error);
  if (error.message === 'Origin is not allowed by CORS.') return response.status(403).json({ message: error.message });
  if (error.code === 11000) return response.status(409).json({ message: 'That record already exists.' });
  response.status(500).json({ message: 'Something went wrong on the server.' });
});

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing in backend/.env');
    if (!jwtSecret || jwtSecret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: databaseName });
    console.log(`MongoDB Atlas connected to database: ${databaseName}`);
    app.listen(port, () => console.log(`Backend running at http://localhost:${port}`));
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing database connection.`);
  await mongoose.connection.close();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
