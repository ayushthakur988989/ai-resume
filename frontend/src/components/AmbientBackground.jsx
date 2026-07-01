import './AmbientBackground.css';

function AmbientBackground() {
  return (
    <div className="ambient-scene no-print" aria-hidden="true">
      <div className="ambient-mesh" />
      <div className="ambient-shape ambient-diamond ambient-diamond-one" />
      <div className="ambient-shape ambient-diamond ambient-diamond-two" />
      <div className="ambient-shape ambient-ring" />

      <div className="ambient-cube-wrap">
        <div className="ambient-cube">
          <span className="ambient-face ambient-front" />
          <span className="ambient-face ambient-back" />
          <span className="ambient-face ambient-right" />
          <span className="ambient-face ambient-left" />
          <span className="ambient-face ambient-top" />
          <span className="ambient-face ambient-bottom" />
        </div>
      </div>

      <div className="ambient-orbital">
        <span className="ambient-core" />
        <span className="ambient-orbit ambient-orbit-one" />
        <span className="ambient-orbit ambient-orbit-two" />
        <span className="ambient-orbit ambient-orbit-three" />
      </div>
    </div>
  );
}

export default AmbientBackground;
