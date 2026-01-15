import '../styles/Header.css';

function Header({ 
  defaultProject, 
  onDefaultProjectChange, 
  isReverseMode, 
  onModeToggle, 
  onRun 
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">Compiler</h1>
        <div className="project-setting">
          <label className="project-label" htmlFor="default-project">
            Default Project:
          </label>
          <input 
            className="project-input"
            id="default-project"
            placeholder="e.g., my-project-name"
            type="text"
            value={defaultProject}
            onChange={(e) => onDefaultProjectChange?.(e.target.value)}
          />
        </div>
      </div>
      <div className="header-right">
        <div>
          <label className="direction-label" htmlFor="direction-toggle">
            Input Mode:
          </label>
        </div>
        <div className="mode-toggle">
          <span className="mode-label">Function</span>
          <label className="switch">
            <input 
              id="direction-toggle" 
              type="checkbox" 
              checked={isReverseMode}
              onChange={onModeToggle}
            />
            <span className="slider"></span>
          </label>
          <span className="mode-label">Compiled</span>
        </div>
        <button 
          className="run-btn"
          onClick={onRun}
        >
          <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="btn-text">Run</span>
        </button>
      </div>
    </header>
  );
}

export default Header;