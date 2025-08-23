import React from 'react';


function ReplaceArea({
  defaultProject = '',
  onDefaultProjectChange,
  revertMappingText = '',
  onRevertMappingTextChange,
  revertMappingError = '',
  showDefaultProject = true,
  showRevertMapping = true
}) {
  if (!showDefaultProject && !showRevertMapping) return null;

  return (
      <div className="three-col-grid">
        <div>
            <h2>Default Project</h2>
            <textarea
              id="default-project"
              type="text"
              value={defaultProject}
              onChange={(e) => onDefaultProjectChange?.(e.target.value)}
              placeholder="defaultproject"
              className="form-control"
            />
        </div>
        <div>
            <div></div>
            <div></div>
        </div>
        <div>
            <h2>Reverse Mapping</h2>
            <textarea
              id="revert-mapping"
              value={revertMappingText}
              onChange={(e) => onRevertMappingTextChange?.(e.target.value)}
              placeholder={`{ "database:\\\"dddd\\\", ": "", "\\\"xxxx\\\",": "ttttttt" }`}
              className="form-control font-monospace"
            />
        </div>
    </div>
    );
};

export default ReplaceArea;