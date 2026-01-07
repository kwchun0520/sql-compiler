import { useState } from 'react';

function ReplaceArea({ 
  value = '', 
  onChange = () => {}, 
  placeholder = `{\n  "find_this_text": "replace_with_this",\n  "another_find": "another_replace"\n}`,
  label = "Text Replacement (JSON)",
  rows = 4,
  className = "",
  disabled = false
}) {
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Validate JSON if there's content
    if (newValue.trim()) {
      try {
        JSON.parse(newValue);
        setIsValid(true);
      } catch (error) {
        setIsValid(false);
      }
    } else {
      setIsValid(true); // Empty is valid
    }
    
    onChange(newValue);
  };

  const baseClasses = "form-textarea w-full rounded-md bg-[var(--surface-color)] border text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] px-3 py-2 text-sm font-mono placeholder:text-[var(--text-secondary)] resize-y transition-colors";
  
  const borderClasses = isValid 
    ? "border-[var(--border-color)]" 
    : "border-red-500 focus:border-red-500 focus:ring-red-500";

  const combinedClasses = `${baseClasses} ${borderClasses} ${className}`.trim();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label 
          className="text-sm font-medium text-[var(--text-secondary)]" 
          htmlFor="replace-input"
        >
          {label}
        </label>
        {!isValid && (
          <span className="text-xs text-red-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">error</span>
            Invalid JSON format
          </span>
        )}
      </div>
      
      <textarea 
        className={combinedClasses}
        id="replace-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        spellCheck="false"
        autoComplete="off"
      />
      
      {value.trim() && (
        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
          <span className={`material-symbols-outlined text-sm ${isValid ? 'text-green-400' : 'text-red-400'}`}>
            {isValid ? 'check_circle' : 'cancel'}
          </span>
          <span>
            {isValid ? 'Valid JSON format' : 'Please check your JSON syntax'}
          </span>
        </div>
      )}
    </div>
  );
}

export default ReplaceArea;
