import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getResumes, deleteResume, getUser, formatDate } from '../api/api';
import Navbar from '../components/Navbar';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [resumes, setResumes] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  // getResumes – load all resumes from localStorage on mount
  useEffect(() => {
    let active = true;
    getResumes()
      .then((data) => { if (active) setResumes(data); })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, []);

  // deleteResume – remove resume and refresh list
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    setDeletingId(id);
    try {
      await deleteResume(id);
      setResumes((current) => current.filter((resume) => resume.id !== id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  };

  const completionPercent = (resume) => {
    const fields = [
      resume.personal?.fullName,
      resume.personal?.email,
      resume.personal?.summary,
      resume.education?.length > 0,
      resume.skills?.length > 0,
      resume.experience?.length > 0,
      resume.projects?.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-page container">
        {/* Header */}
        <div className="dashboard-header animate-fadeInUp">
          <div>
            <h1 className="dashboard-title">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="dashboard-subtitle">
              Manage your resumes and create new ones
            </p>
          </div>
          <Link to="/resume/new" className="btn btn-primary" id="create-resume-btn">
            + New Resume
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="dash-stats animate-fadeInUp delay-100">
          <div className="dash-stat glass-card">
            <span className="dash-stat-num gradient-text">{resumes.length}</span>
            <span className="dash-stat-label">Total Resumes</span>
          </div>
          <div className="dash-stat glass-card">
            <span className="dash-stat-num gradient-text">
              {resumes.filter((r) => completionPercent(r) === 100).length}
            </span>
            <span className="dash-stat-label">Complete</span>
          </div>
          <div className="dash-stat glass-card">
            <span className="dash-stat-num gradient-text">
              {resumes.filter((r) => completionPercent(r) < 100).length}
            </span>
            <span className="dash-stat-label">In Progress</span>
          </div>
        </div>

        {/* Resume Grid */}
        {error && <div className="alert alert-error">{error}</div>}
        {resumes.length === 0 ? (
          <div className="empty-state glass-card animate-fadeInUp delay-200">
            <div className="empty-icon">📄</div>
            <h2 className="empty-title">No Resumes Yet</h2>
            <p className="empty-desc">
              Create your first AI-powered resume and land your dream job!
            </p>
            <Link to="/resume/new" className="btn btn-primary">
              🚀 Create My First Resume
            </Link>
          </div>
        ) : (
          <div className="resume-grid">
            {resumes.map((resume, i) => {
              const pct = completionPercent(resume);
              return (
                <div
                  key={resume.id}
                  className={`resume-card glass-card animate-fadeInUp delay-${Math.min(i * 100 + 200, 500)} ${
                    deletingId === resume.id ? 'resume-card--deleting' : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className="rc-header">
                    <div className="rc-icon">📋</div>
                    <div className="rc-meta">
                      <h3 className="rc-title">
                        {resume.personal?.fullName || 'Untitled Resume'}
                      </h3>
                      <p className="rc-subtitle">
                        {resume.personal?.jobTitle || 'No title set'}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="rc-progress">
                    <div className="rc-progress-label">
                      <span>Completion</span>
                      <span className={pct === 100 ? 'text-success' : ''}>
                        {pct}%
                      </span>
                    </div>
                    <div className="rc-progress-bar">
                      <div
                        className="rc-progress-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="rc-info">
                    <span className="rc-info-item">
                      🎓 {resume.education?.length || 0} Education
                    </span>
                    <span className="rc-info-item">
                      💼 {resume.experience?.length || 0} Experience
                    </span>
                    <span className="rc-info-item">
                      🛠 {resume.skills?.length || 0} Skills
                    </span>
                  </div>

                  <p className="rc-date">
                    Updated {formatDate(resume.updatedAt)}
                  </p>

                  {/* Actions */}
                  <div className="rc-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/resume/${resume.id}`)}
                      id={`edit-${resume.id}`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/preview/${resume.id}`)}
                      id={`preview-${resume.id}`}
                    >
                      👁 Preview
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(resume.id)}
                      id={`delete-${resume.id}`}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
