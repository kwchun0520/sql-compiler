import { useState, useEffect } from 'react';
import './styles/App.css';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import ControlSwitch from "./components/ControlSwitch";
import ReferenceSqlArea from './components/ReferenceSqlArea';
import CompileSqlArea from './components/CompileSqlArea';
import Transform from "./components/Transform";

function App() {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Lifted state
  const [referencedSql, setReferencedSql] = useState('');
  const [compiledSql, setCompiledSql] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`App ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      {/* <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> */}
      <ControlSwitch darkMode={darkMode} onToggle={() => setDarkMode(v => !v)} />
      <div className="content">
        <Header />
        <div className="three-col-grid">
          <div>
            <ReferenceSqlArea value={referencedSql} onChange={setReferencedSql} />
          </div>
          <div>
            <Transform inputSql={referencedSql} onTransformed={setCompiledSql} />
            {/* <Transform inputSql={compiledSql} onTransformed={setCompiledSql} /> */}
          </div>
          <div>
            <CompileSqlArea value={compiledSql} />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
