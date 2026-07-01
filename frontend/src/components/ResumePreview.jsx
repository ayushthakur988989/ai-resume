import './ResumePreview.css';

function ResumePreview({ data }) {
  if (!data) return null;

  const {
    personal = {},
    education = [],
    skills = [],
    projects = [],
    experience = [],
  } = data;

  return (
    <div className="resume-preview">
      {/* Header */}
      <div className="rp-header">
        <h1 className="rp-name">{personal.fullName || 'Your Name'}</h1>
        <p className="rp-title">{personal.jobTitle || ''}</p>
        <div className="rp-contact-row">
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>📞 {personal.phone}</span>}
          {personal.location && <span>📍 {personal.location}</span>}
          {personal.linkedin && (
            <span>
              <a href={personal.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </span>
          )}
          {personal.github && (
            <span>
              <a href={personal.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <section className="rp-section">
          <h2 className="rp-section-title">Professional Summary</h2>
          <div className="rp-divider" />
          <p className="rp-text">{personal.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-title">Work Experience</h2>
          <div className="rp-divider" />
          {experience.map((exp, i) => (
            <div key={i} className="rp-item">
              <div className="rp-item-header">
                <div>
                  <h3 className="rp-item-title">{exp.position}</h3>
                  <p className="rp-item-subtitle">{exp.company}</p>
                </div>
                <span className="rp-item-date">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              {exp.description && (
                <p className="rp-text">{exp.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-title">Education</h2>
          <div className="rp-divider" />
          {education.map((edu, i) => (
            <div key={i} className="rp-item">
              <div className="rp-item-header">
                <div>
                  <h3 className="rp-item-title">{edu.degree}</h3>
                  <p className="rp-item-subtitle">
                    {edu.school} {edu.field ? `– ${edu.field}` : ''}
                  </p>
                </div>
                <span className="rp-item-date">
                  {edu.startYear} – {edu.endYear || 'Present'}
                </span>
              </div>
              {edu.gpa && <p className="rp-text">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-title">Skills</h2>
          <div className="rp-divider" />
          <div className="rp-skills-grid">
            {skills.map((skill, i) => (
              <span key={i} className="rp-skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="rp-section">
          <h2 className="rp-section-title">Projects</h2>
          <div className="rp-divider" />
          {projects.map((proj, i) => (
            <div key={i} className="rp-item">
              <div className="rp-item-header">
                <div>
                  <h3 className="rp-item-title">
                    {proj.name}
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="rp-project-link"
                      >
                        ↗
                      </a>
                    )}
                  </h3>
                  {proj.techStack && (
                    <p className="rp-item-subtitle">{proj.techStack}</p>
                  )}
                </div>
              </div>
              {proj.description && (
                <p className="rp-text">{proj.description}</p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default ResumePreview;
