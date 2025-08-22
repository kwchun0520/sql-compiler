import { useState, useEffect } from 'react';
import './styles/App.css';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import ControlSwitch from "./components/ControlSwitch";
import ReferenceSqlArea from './components/ReferenceSqlArea';
import CompileSqlArea from './components/CompileSqlArea';
import Transform from "./components/Transform";
import ReplaceArea from "./components/ReplaceArea";

function App() {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Lifted state
  const [referencedSql, setReferencedSql] = useState('');
  const [compiledSql, setCompiledSql] = useState('');

  // ReplaceArea state (lifted to App)
  const [defaultProject, setDefaultProject] = useState('defaultproject');
  const [revertMappingText, setRevertMappingText] = useState('');
  const [revertMappingError, setRevertMappingError] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`App ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      {/* <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> */}
      <div className="content">
        <Header />
        <ControlSwitch darkMode={darkMode} onToggle={() => setDarkMode(v => !v)} />

        {/* ReplaceArea on top of the grid */}
        <ReplaceArea
          defaultProject={defaultProject}
          onDefaultProjectChange={setDefaultProject}
          revertMappingText={revertMappingText}
          onRevertMappingTextChange={setRevertMappingText}
          revertMappingError={revertMappingError}
          showDefaultProject={true}
          showRevertMapping={true}
        />

        <div className="three-col-grid">
          <div>
            <ReferenceSqlArea value={referencedSql} onChange={setReferencedSql} />
          </div>
          <div>
            {/* Pass compiledSql in, and a handler to push reverted SQL back to the left */}
            <Transform
              referencedSql={referencedSql}
              compiledSql={compiledSql}
              onCompiled={setCompiledSql}
              onReverted={setReferencedSql}
              // pass ReplaceArea state down
              defaultProject={defaultProject}
              revertMappingText={revertMappingText}
              setRevertMappingError={setRevertMappingError}
            />
          </div>
          <div>
            <CompileSqlArea value={compiledSql} onChange={setCompiledSql} />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;