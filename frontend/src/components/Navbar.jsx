import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUser, removeUser } from '../api/api';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('ai-resume-theme', nextTheme);
    setTheme(nextTheme);
  };

  const logout = () => {
    removeUser();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">
            AI<span className="logo-accent">Resume</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="theme-toggle-icon" aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
            <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/resume/new"
                className={`nav-link ${isActive('/resume/new') ? 'active' : ''}`}
              >
                New Resume
              </Link>
              <div className="nav-divider" />
              <span className="nav-user">👤 {user.name}</span>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
