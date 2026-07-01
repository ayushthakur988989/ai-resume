import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const features = [
  {
    icon: 'AI',
    title: 'AI-Powered Summaries',
    desc: 'Generate professional summaries and project descriptions with AI in one click.',
    color: '#8b5cf6',
  },
  {
    icon: 'UI',
    title: 'Beautiful Templates',
    desc: 'Choose from curated resume templates that stand out to recruiters.',
    color: '#22d3ee',
  },
  {
    icon: 'PDF',
    title: 'One-Click PDF Export',
    desc: 'Download a perfectly formatted PDF resume ready to send to employers.',
    color: '#f4b860',
  },
  {
    icon: '24/7',
    title: 'Save & Edit Anytime',
    desc: 'Your resumes are saved securely. Edit and update them whenever you need.',
    color: '#34d399',
  },
];

const steps = [
  { num: '01', label: 'Create Account', icon: 'ID' },
  { num: '02', label: 'Fill Your Info', icon: 'TXT' },
  { num: '03', label: 'Pick a Template', icon: 'UI' },
  { num: '04', label: 'Download PDF', icon: 'PDF' },
];

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationId;
    let width = 0;
    let height = 0;
    let dots = [];

    const columns = 18;
    const rows = 10;
    const makeDots = () => {
      dots = [];
      for (let row = 0; row <= rows; row += 1) {
        for (let column = 0; column <= columns; column += 1) {
          dots.push({
            baseX: (column / columns) * width,
            baseY: (row / rows) * height,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.4,
            amplitude: 7 + Math.random() * 13,
          });
        }
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      makeDots();
    };

    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { x: 0.16, y: 0.18, radius: 180, hue: 265 },
      { x: 0.84, y: 0.42, radius: 220, hue: 190 },
      { x: 0.48, y: 0.82, radius: 190, hue: 225 },
    ];

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += reduceMotion ? 0 : 0.008;

      orbs.forEach((orb, index) => {
        const x = orb.x * width + Math.sin(time * (0.6 + index * 0.1)) * 35;
        const y = orb.y * height + Math.cos(time * (0.5 + index * 0.08)) * 26;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.radius);
        gradient.addColorStop(0, `hsla(${orb.hue}, 78%, 62%, 0.14)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      const animatedDots = dots.map((dot) => ({
        x: dot.baseX + Math.sin(time * dot.speed + dot.phase) * dot.amplitude,
        y: dot.baseY + Math.cos(time * dot.speed * 0.8 + dot.phase) * dot.amplitude * 0.55,
      }));

      ctx.strokeStyle = 'rgba(148, 163, 255, 0.105)';
      ctx.lineWidth = 0.75;
      for (let row = 0; row <= rows; row += 1) {
        ctx.beginPath();
        for (let column = 0; column <= columns; column += 1) {
          const point = animatedDots[row * (columns + 1) + column];
          if (column === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }
      for (let column = 0; column <= columns; column += 1) {
        ctx.beginPath();
        for (let row = 0; row <= rows; row += 1) {
          const point = animatedDots[row * (columns + 1) + column];
          if (row === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }

      if (!reduceMotion) animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-canvas" aria-hidden="true" />;
}

function Home() {
  return (
    <div className="home-root">
      <ParticleCanvas />

      <div className="geo-shapes" aria-hidden="true">
        <div className="geo geo-1" />
        <div className="geo geo-2" />
        <div className="geo geo-3" />
        <div className="geo geo-4" />
        <div className="geo geo-5" />
        <div className="geo geo-6" />

        <div className="hero-cube-wrap">
          <div className="hero-cube">
            <span className="cube-face cube-front" />
            <span className="cube-face cube-back" />
            <span className="cube-face cube-right" />
            <span className="cube-face cube-left" />
            <span className="cube-face cube-top" />
            <span className="cube-face cube-bottom" />
          </div>
        </div>

        <div className="orbital-object">
          <span className="orbital-core" />
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="orbit orbit-three" />
        </div>
      </div>

      <Navbar />

      <section className="hero-section container">
        <div className="hero-eyebrow animate-fadeInUp">
          <span className="hero-pill">
            <span className="pill-dot" />
            <span aria-hidden="true">&#10022;</span> AI-Powered Resume Builder
          </span>
        </div>

        <h1 className="hero-title animate-fadeInUp delay-100">
          Craft a Resume That
          <br />
          <span className="hero-gradient-word">Gets You Hired</span>
        </h1>

        <p className="hero-subtitle animate-fadeInUp delay-200">
          Create a professional, ATS-friendly resume in minutes. Let AI write
          perfect summaries &amp; descriptions &mdash; and stand out from thousands of
          applicants effortlessly.
        </p>

        <div className="hero-cta animate-fadeInUp delay-300">
          <Link to="/signup" className="hero-btn-primary">
            Get Started <span aria-hidden="true">&#8599;</span>
          </Link>
          <Link to="/login" className="hero-btn-ghost">
            Sign In <span aria-hidden="true">&#8594;</span>
          </Link>
        </div>

        <div className="stats-bar animate-fadeInUp delay-400">
          <div className="stat-item"><span className="stat-num">1k+</span><span className="stat-lbl">Resumes Built</span></div>
          <div className="stat-sep" />
          <div className="stat-item"><span className="stat-num">95%</span><span className="stat-lbl">ATS Pass Rate</span></div>
          <div className="stat-sep" />
          <div className="stat-item"><span className="stat-num">3 min</span><span className="stat-lbl">Average Build Time</span></div>
          <div className="stat-sep" />
          <div className="stat-item"><span className="stat-num">Free</span><span className="stat-lbl">Always</span></div>
        </div>
      </section>

      <section className="features-section container">
        <div className="section-label animate-fadeInUp">Features</div>
        <h2 className="section-heading animate-fadeInUp delay-100">Everything You Need to Land the Job</h2>
        <p className="section-sub animate-fadeInUp delay-200">
          From AI writing to beautiful templates &mdash; we&apos;ve got you fully covered.
        </p>

        <div className="feat-grid">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`feat-card animate-fadeInUp delay-${(index + 1) * 100}`}
              style={{ '--card-accent': feature.color }}
            >
              <div className="feat-icon-wrap"><span className="feat-icon">{feature.icon}</span></div>
              <h3 className="feat-title">{feature.title}</h3>
              <p className="feat-desc">{feature.desc}</p>
              <div className="feat-line" />
            </div>
          ))}
        </div>
      </section>

      <section className="steps-section container">
        <div className="section-label animate-fadeInUp">Process</div>
        <h2 className="section-heading animate-fadeInUp delay-100">Build Your Resume in 4 Simple Steps</h2>

        <div className="steps-track animate-fadeInUp delay-200">
          {steps.map((step, index) => (
            <div key={step.num} className="step-card">
              <div className="step-bubble">{step.icon}</div>
              <div className="step-num">{step.num}</div>
              <p className="step-lbl">{step.label}</p>
              {index < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section container">
        <div className="cta-box">
          <div className="cta-inner-glow" />
          <div className="cta-ring cta-ring-1" />
          <div className="cta-ring cta-ring-2" />
          <h2 className="cta-heading">
            Ready to Build Your<span className="cta-accent"> Perfect Resume?</span>
          </h2>
          <p className="cta-body">Join thousands of job seekers who&apos;ve already landed their dream roles.</p>
          <Link to="/signup" className="hero-btn-primary cta-cta-btn">
            Start Building for Free <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
      </section>

      <footer className="home-footer container">
        <p>Designed with care by <span className="footer-brand">AI Resume Builder</span></p>
      </footer>
    </div>
  );
}

export default Home;
