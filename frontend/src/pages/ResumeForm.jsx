import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  saveResume,
  getResumeById,
  getUser,
  generateId,
} from '../api/api';
import Navbar from '../components/Navbar';
import './ResumeForm.css';

// ──────── Default empty state ────────
const emptyForm = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
  },
  education: [],
  skills: [],
  projects: [],
  experience: [],
};

const TABS = [
  { key: 'personal', label: '👤 Personal', icon: '👤' },
  { key: 'education', label: '🎓 Education', icon: '🎓' },
  { key: 'experience', label: '💼 Experience', icon: '💼' },
  { key: 'skills', label: '🛠 Skills', icon: '🛠' },
  { key: 'projects', label: '🚀 Projects', icon: '🚀' },
];

function ResumeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const isEdit = Boolean(id && id !== 'new');

  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState(emptyForm);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [resumeId] = useState(isEdit ? id : generateId());

  // Load existing resume in edit mode
  useEffect(() => {
    if (isEdit) {
      let active = true;
      getResumeById(id).then((resume) => {
        if (active) setFormData({
          personal: resume.personal || emptyForm.personal,
          education: resume.education || [],
          skills: resume.skills || [],
          projects: resume.projects || [],
          experience: resume.experience || [],
        });
      }).catch((requestError) => { if (active) setError(requestError.message); });
      return () => { active = false; };
    }
  }, [id, isEdit]);

  // ──────── handleInputChange – personal info ────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [name]: value },
    }));
  };

  // ──────── Education handlers ────────
  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: generateId(), degree: '', school: '', field: '', startYear: '', endYear: '', gpa: '' },
      ],
    }));
  };

  const handleEduChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [name]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // ──────── Experience handlers ────────
  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: generateId(), position: '', company: '', startDate: '', endDate: '', current: false, description: '' },
      ],
    }));
  };

  const handleExpChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [name]: type === 'checkbox' ? checked : value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // ──────── Skills handlers ────────
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || formData.skills.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  // ──────── Projects handlers ────────
  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: generateId(), name: '', techStack: '', link: '', description: '' },
      ],
    }));
  };

  const handleProjChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [name]: value };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  // ──────── saveResume / handleSubmit ────────
  const handleSubmit = (e) => {
    e.preventDefault();
    doSave(true);
  };

  const doSave = async (redirect = false) => {
    setSaving(true);
    setError('');
    const payload = {
      id: resumeId,
      userId: user?.id,
      ...formData,
    };
    try {
      await saveResume(payload);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (redirect) navigate(`/preview/${resumeId}`);
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  };

  const goToTab = (key) => {
    doSave(false); // auto-save on tab change
    setActiveTab(key);
  };

  const currentTabIndex = TABS.findIndex((t) => t.key === activeTab);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="rf-page container">
        {/* Page Header */}
        <div className="rf-header animate-fadeInUp">
          <div>
            <h1 className="rf-title">
              {isEdit ? '✏️ Edit Resume' : '✨ Build Your Resume'}
            </h1>
            <p className="rf-subtitle">
              Fill in your details — your data is saved automatically as you switch tabs.
            </p>
          </div>
          <div className="rf-header-actions">
            {saved && (
              <span className="saved-badge animate-fadeIn">✅ Saved!</span>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/preview/${resumeId}`)}
            >
              👁 Preview
            </button>
            <button
              className="btn btn-primary"
              onClick={() => doSave(true)}
              disabled={saving}
              id="save-resume-btn"
            >
              {saving ? <><span className="spinner" /> Saving...</> : '💾 Save & Preview'}
            </button>
          </div>
        </div>

        <div className="rf-layout">
          {error && <div className="alert alert-error">{error}</div>}
          {/* Sidebar Tabs */}
          <aside className="rf-sidebar glass-card">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`rf-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => goToTab(tab.key)}
                id={`tab-${tab.key}`}
              >
                <span className="rf-tab-icon">{tab.icon}</span>
                <span>{tab.label.split(' ').slice(1).join(' ')}</span>
                {activeTab === tab.key && <span className="rf-tab-active-dot" />}
              </button>
            ))}

            <div className="rf-sidebar-footer">
              <p className="rf-progress-label">
                Section {currentTabIndex + 1} of {TABS.length}
              </p>
              <div className="rf-progress-bar">
                <div
                  className="rf-progress-fill"
                  style={{ width: `${((currentTabIndex + 1) / TABS.length) * 100}%` }}
                />
              </div>
            </div>
          </aside>

          {/* Form Content */}
          <main className="rf-content glass-card">
            <form onSubmit={handleSubmit}>

              {/* ── PERSONAL INFO ── */}
              {activeTab === 'personal' && (
                <div className="rf-section animate-fadeIn">
                  <h2 className="rf-section-title">Personal Information</h2>
                  <p className="rf-section-desc">Your basic contact details</p>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input className="form-input" name="fullName" placeholder="John Doe"
                        value={formData.personal.fullName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input className="form-input" name="jobTitle" placeholder="Software Engineer"
                        value={formData.personal.jobTitle} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input className="form-input" type="email" name="email" placeholder="john@example.com"
                        value={formData.personal.email} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" name="phone" placeholder="+91 9876543210"
                        value={formData.personal.phone} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" name="location" placeholder="Mumbai, India"
                        value={formData.personal.location} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">LinkedIn URL</label>
                      <input className="form-input" name="linkedin" placeholder="linkedin.com/in/john"
                        value={formData.personal.linkedin} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GitHub URL</label>
                      <input className="form-input" name="github" placeholder="github.com/john"
                        value={formData.personal.github} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Portfolio / Website</label>
                      <input className="form-input" name="website" placeholder="johndoe.dev"
                        value={formData.personal.website} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Professional Summary</label>
                    <textarea
                      className="form-textarea"
                      name="summary"
                      rows={5}
                      placeholder="Write a brief summary about yourself, your skills, and career goals..."
                      value={formData.personal.summary}
                      onChange={handleInputChange}
                    />
                    <p className="form-hint">
                      💡 AI summary generation coming soon!
                    </p>
                  </div>
                </div>
              )}

              {/* ── EDUCATION ── */}
              {activeTab === 'education' && (
                <div className="rf-section animate-fadeIn">
                  <h2 className="rf-section-title">Education</h2>
                  <p className="rf-section-desc">Add your academic background</p>

                  {formData.education.map((edu, i) => (
                    <div key={edu.id || i} className="rf-entry-card">
                      <div className="rf-entry-header">
                        <h3 className="rf-entry-title">Education #{i + 1}</h3>
                        <button type="button" className="btn btn-danger btn-sm"
                          onClick={() => removeEducation(i)}>Remove</button>
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Degree *</label>
                          <input className="form-input" name="degree" placeholder="B.Tech / BSc / MBA"
                            value={edu.degree} onChange={(e) => handleEduChange(i, e)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">School / University *</label>
                          <input className="form-input" name="school" placeholder="IIT Bombay"
                            value={edu.school} onChange={(e) => handleEduChange(i, e)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Field of Study</label>
                          <input className="form-input" name="field" placeholder="Computer Science"
                            value={edu.field} onChange={(e) => handleEduChange(i, e)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">GPA / Percentage</label>
                          <input className="form-input" name="gpa" placeholder="8.5 / 10"
                            value={edu.gpa} onChange={(e) => handleEduChange(i, e)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Start Year</label>
                          <input className="form-input" name="startYear" placeholder="2020"
                            value={edu.startYear} onChange={(e) => handleEduChange(i, e)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">End Year</label>
                          <input className="form-input" name="endYear" placeholder="2024 (or Present)"
                            value={edu.endYear} onChange={(e) => handleEduChange(i, e)} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="btn btn-secondary" onClick={addEducation} id="add-education-btn">
                    + Add Education
                  </button>
                </div>
              )}

              {/* ── EXPERIENCE ── */}
              {activeTab === 'experience' && (
                <div className="rf-section animate-fadeIn">
                  <h2 className="rf-section-title">Work Experience</h2>
                  <p className="rf-section-desc">Add internships, jobs, or freelance work</p>

                  {formData.experience.map((exp, i) => (
                    <div key={exp.id || i} className="rf-entry-card">
                      <div className="rf-entry-header">
                        <h3 className="rf-entry-title">Experience #{i + 1}</h3>
                        <button type="button" className="btn btn-danger btn-sm"
                          onClick={() => removeExperience(i)}>Remove</button>
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Job Title *</label>
                          <input className="form-input" name="position" placeholder="Software Engineer"
                            value={exp.position} onChange={(e) => handleExpChange(i, e)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Company *</label>
                          <input className="form-input" name="company" placeholder="Google"
                            value={exp.company} onChange={(e) => handleExpChange(i, e)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Start Date</label>
                          <input className="form-input" name="startDate" placeholder="Jan 2023"
                            value={exp.startDate} onChange={(e) => handleExpChange(i, e)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">End Date</label>
                          <input className="form-input" name="endDate" placeholder="Dec 2023"
                            value={exp.endDate} onChange={(e) => handleExpChange(i, e)}
                            disabled={exp.current} />
                        </div>
                      </div>
                      <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                          <input type="checkbox" name="current" checked={exp.current}
                            onChange={(e) => handleExpChange(i, e)} />
                          Currently working here
                        </label>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" name="description" rows={4}
                          placeholder="• Developed REST APIs using Node.js&#10;• Improved performance by 40%..."
                          value={exp.description} onChange={(e) => handleExpChange(i, e)} />
                      </div>
                    </div>
                  ))}

                  <button type="button" className="btn btn-secondary" onClick={addExperience} id="add-experience-btn">
                    + Add Experience
                  </button>
                </div>
              )}

              {/* ── SKILLS ── */}
              {activeTab === 'skills' && (
                <div className="rf-section animate-fadeIn">
                  <h2 className="rf-section-title">Skills</h2>
                  <p className="rf-section-desc">
                    Type a skill and press <kbd>Enter</kbd> or <kbd>,</kbd> to add it
                  </p>

                  <div className="form-group">
                    <div className="skill-input-row">
                      <input
                        className="form-input"
                        placeholder="e.g. React, Node.js, Python..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        id="skill-input"
                      />
                      <button type="button" className="btn btn-primary" onClick={addSkill} id="add-skill-btn">
                        Add
                      </button>
                    </div>
                  </div>

                  {formData.skills.length > 0 && (
                    <div className="tags-container">
                      {formData.skills.map((skill) => (
                        <span key={skill} className="tag">
                          {skill}
                          <button
                            type="button"
                            className="tag-remove"
                            onClick={() => removeSkill(skill)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {formData.skills.length === 0 && (
                    <div className="rf-empty-hint">
                      <p>No skills added yet. Add technologies you know!</p>
                    </div>
                  )}

                  <div className="skill-suggestions">
                    <p className="form-hint">Quick Add:</p>
                    <div className="tags-container">
                      {['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'TypeScript', 'MongoDB', 'AWS', 'Docker'].map(
                        (s) =>
                          !formData.skills.includes(s) && (
                            <button
                              key={s}
                              type="button"
                              className="tag"
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  skills: [...prev.skills, s],
                                }))
                              }
                            >
                              + {s}
                            </button>
                          )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── PROJECTS ── */}
              {activeTab === 'projects' && (
                <div className="rf-section animate-fadeIn">
                  <h2 className="rf-section-title">Projects</h2>
                  <p className="rf-section-desc">Showcase your best work</p>

                  {formData.projects.map((proj, i) => (
                    <div key={proj.id || i} className="rf-entry-card">
                      <div className="rf-entry-header">
                        <h3 className="rf-entry-title">Project #{i + 1}</h3>
                        <button type="button" className="btn btn-danger btn-sm"
                          onClick={() => removeProject(i)}>Remove</button>
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Project Name *</label>
                          <input className="form-input" name="name" placeholder="AI Resume Builder"
                            value={proj.name} onChange={(e) => handleProjChange(i, e)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tech Stack</label>
                          <input className="form-input" name="techStack" placeholder="React, Node.js, MongoDB"
                            value={proj.techStack} onChange={(e) => handleProjChange(i, e)} />
                        </div>
                        <div className="form-group span-2">
                          <label className="form-label">Project Link</label>
                          <input className="form-input" name="link" placeholder="https://github.com/..."
                            value={proj.link} onChange={(e) => handleProjChange(i, e)} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" name="description" rows={4}
                          placeholder="What does this project do? What problem does it solve?"
                          value={proj.description} onChange={(e) => handleProjChange(i, e)} />
                        <p className="form-hint">💡 AI description improvement coming soon!</p>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="btn btn-secondary" onClick={addProject} id="add-project-btn">
                    + Add Project
                  </button>
                </div>
              )}

              {/* Bottom navigation */}
              <div className="rf-nav-btns">
                {currentTabIndex > 0 && (
                  <button type="button" className="btn btn-secondary"
                    onClick={() => goToTab(TABS[currentTabIndex - 1].key)}>
                    ← Previous
                  </button>
                )}
                <div style={{ flex: 1 }} />
                {currentTabIndex < TABS.length - 1 ? (
                  <button type="button" className="btn btn-primary"
                    onClick={() => goToTab(TABS[currentTabIndex + 1].key)}>
                    Next →
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" id="final-save-btn">
                    {saving ? <><span className="spinner" /> Saving...</> : '💾 Save & Preview →'}
                  </button>
                )}
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ResumeForm;
