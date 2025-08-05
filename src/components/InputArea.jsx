import { useState } from 'react';



function InputArea(props) {
    const [inputSql, SetInputSql] = useState("");

    function handleChange(event){
        const input = event.target.value;
        SetInputSql(input);
    };

    return (
        <textarea
            name="content"
            onChange={handleChange}
            value={inputSql}
            placeholder="Input DataForm SQL for compile"
            rows="3"
            />
    );
};


export default InputArea;