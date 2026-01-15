import { useState, useRef } from 'react';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Transform from "./components/Transform";
import './styles/App.css';

function App() {
  // Mode toggle: false = Referenced to Compiled, true = Compiled to Referenced
  const [isReverseMode, setIsReverseMode] = useState(false);
  
  // Settings
  const [defaultProject, setDefaultProject] = useState('');
  const [inputSql, setInputSql] = useState('');
  const [outputSql, setOutputSql] = useState('');

  // Ref to trigger transformation manually
  const transformRef = useRef(null);

  const handleRun = () => {
    // Trigger transformation through ref
    if (transformRef.current) {
      transformRef.current.runTransform();
    }
  };

  return (
    <div className="app-container">
      <Header 
        defaultProject={defaultProject}
        onDefaultProjectChange={setDefaultProject}
        isReverseMode={isReverseMode}
        onModeToggle={() => setIsReverseMode(!isReverseMode)}
        onRun={handleRun}
      />
      
      <main className="app-main">
        <div className="content-wrapper">
          
          {/* Main Content Areas */}
          <div className="sql-grid">
            <div className="sql-editor-container">
              <div className="flex justify-between items-center">
                <label className="editor-label" htmlFor="input-code">
                  Input
                </label>
              </div>
              <div className="relative flex-1">
                <textarea 
                  className="sql-textarea"
                  id="input-code"
                  value={inputSql}
                  onChange={(e) => setInputSql(e.target.value)}
                  placeholder="Enter your input SQL here..."
                />
              </div>
            </div>
            
            <div className="sql-editor-container">
              <div className="flex justify-between items-center">
                <label className="editor-label" htmlFor="output-json">
                  Output
                </label>
              </div>
              <div className="relative flex-1">
                <textarea 
                  className="sql-textarea"
                  id="output-json"
                  value={outputSql}
                  onChange={(e) => setOutputSql(e.target.value)}
                  placeholder="Output SQL will appear here..."
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Transform
        ref={transformRef}
        inputSql={inputSql}
        defaultProject={defaultProject}
        isReverseMode={isReverseMode}
        onCompiled={setOutputSql}
        onReverted={setOutputSql}
      />
      
      <Footer />
    </div>
  );
}

export default App;
