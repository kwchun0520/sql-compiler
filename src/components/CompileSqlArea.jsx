import { useState } from 'react';

function CompileSqlArea({ value, onChange }) {
    const handleChange = (event) => {
        onChange?.(event.target.value);
    };

    return (
        <div>
            <h2>After Compile</h2>
            <textarea
                id="compiled-sql"
                name="content"
                value={value}
                onChange={handleChange}
                placeholder="SQL after compilation"
                rows="50"
                // cols="80"
                // rows="40"
            />
        </div>
    );
};

export default CompileSqlArea;