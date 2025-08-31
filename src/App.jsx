import { useState, useRef } from 'react';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Transform from "./components/Transform";
import ReplaceArea from "./components/ReplaceArea";

function App() {
  // Mode toggle: false = Referenced to Compiled, true = Compiled to Referenced
  const [isReverseMode, setIsReverseMode] = useState(false);
  
  // Main content areas
  const [referencedSql, setReferencedSql] = useState('');
  const [compiledSql, setCompiledSql] = useState('');
  
  // Settings
  const [defaultProject, setDefaultProject] = useState('');
  const [replaceMapping, setReplaceMapping] = useState('');

  // Ref to trigger transformation manually
  const transformRef = useRef(null);

  const handleRun = () => {
    // Trigger transformation through ref
    if (transformRef.current) {
      transformRef.current.runTransform();
    }
  };

  return (
    <div className="bg-[var(--background-color)] text-[var(--text-primary)] min-h-screen flex flex-col">
      <Header 
        defaultProject={defaultProject}
        onDefaultProjectChange={setDefaultProject}
        isReverseMode={isReverseMode}
        onModeToggle={() => setIsReverseMode(!isReverseMode)}
        onRun={handleRun}
      />
      
      <main className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex-1 flex flex-col gap-8">
          {/* Text Replacement Area */}
          <ReplaceArea 
            value={replaceMapping}
            onChange={setReplaceMapping}
          />
          
          {/* Main Content Areas */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="input-code">
                  Referenced
                </label>
              </div>
              <div className="relative flex-1">
                <textarea 
                  className="form-textarea w-full h-full min-h-[400px] rounded-md bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4 text-sm font-mono placeholder:text-[var(--text-secondary)] resize-none"
                  id="input-code"
                  value={referencedSql}
                  onChange={(e) => setReferencedSql(e.target.value)}
                  placeholder="Enter your referenced SQL here..."
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="output-json">
                  Compiled
                </label>
              </div>
              <div className="relative flex-1">
                <textarea 
                  className="form-textarea w-full h-full min-h-[400px] rounded-md bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] p-4 text-sm font-mono placeholder:text-[var(--text-secondary)] resize-none"
                  id="output-json"
                  value={compiledSql}
                  onChange={(e) => setCompiledSql(e.target.value)}
                  placeholder="Compiled output will appear here..."
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Transform
        ref={transformRef}
        referencedSql={referencedSql}
        compiledSql={compiledSql}
        onCompiled={setCompiledSql}
        onReverted={setReferencedSql}
        defaultProject={defaultProject}
        replaceMapping={replaceMapping}
        isReverseMode={isReverseMode}
      />
      
      <Footer />
    </div>
  );
}

export default App;