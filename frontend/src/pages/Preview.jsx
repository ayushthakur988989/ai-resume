import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getResumeById } from '../api/api';
import Navbar from '../components/Navbar';
import ResumePreview from '../components/ResumePreview';
import './Preview.css';

function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    let active = true;
    getResumeById(id)
      .then((data) => { if (active) setResume(data); })
      .catch(() => { if (active) setNotFound(true); });
    return () => { active = false; };
  }, [id]);

  // downloadPDF – triggers browser print dialog (browser can save as PDF)
  const downloadPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    const candidateName = resume?.personal?.fullName?.trim() || 'resume';
    const filename = `${candidateName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'resume'}.pdf`;

    try {
      const { default: html2pdf } = await import('html2pdf.js');
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['.rp-item', '.rp-section-title'] },
        })
        .from(printRef.current)
        .save();
    } catch (error) {
      console.error('PDF download failed:', error);
      window.alert('Could not download the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (notFound) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="preview-not-found container">
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😕</div>
            <h2 style={{ marginBottom: '12px' }}>Resume Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              This resume doesn't exist or may have been deleted.
            </p>
            <Link to="/dashboard" className="btn btn-primary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="preview-loading">
          <span className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print">
        <Navbar />
        <div className="preview-toolbar container">
          <div className="preview-toolbar-left">
            <button className="btn btn-secondary" onClick={() => navigate(`/resume/${id}`)}>
              ← Edit Resume
            </button>
            <Link to="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
          </div>

          <div className="preview-toolbar-center">
            <h1 className="preview-toolbar-title">
              {resume.personal?.fullName || 'Resume Preview'}
            </h1>
            <span className="badge badge-primary">Live Preview</span>
          </div>

          <div className="preview-toolbar-right">
            <button
              className="btn btn-primary"
              onClick={downloadPDF}
              disabled={downloading}
              id="download-pdf-btn"
            >
              {downloading ? (
                <><span className="spinner" /> Preparing...</>
              ) : (
                '📥 Download PDF'
              )}
            </button>
          </div>
        </div>

        {/* Print tip */}
        <div className="preview-tip container no-print">
          <div className="tip-card">
            <span>💡</span>
            <p>
              Click <strong>Download PDF</strong> to save your formatted resume directly to your device.
            </p>
          </div>
        </div>
      </div>

      {/* Resume Paper */}
      <div className="preview-paper-wrapper">
        <div className="preview-paper no-print-shadow" ref={printRef}>
          <ResumePreview data={resume} />
        </div>
      </div>
    </div>
  );
}

export default Preview;
