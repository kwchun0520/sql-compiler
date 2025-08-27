import * as React from 'react';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

function ControlSwitch({ darkMode, onToggle }) {
  return (
    <div className="control-switch">
      <FormControlLabel
        control={<Switch checked={darkMode} onChange={onToggle} />}
        label="Dark mode"
        labelPlacement="end"
      />
    </div>
  );
}

export default ControlSwitch;
