import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './styles/App.css';
import InputArea from './components/InputArea';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar"
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';

function App() {
  // const [count, setCount] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };



  return (
    <div className="App">
      <button className="open-btn" onClick={toggleSidebar}>Open Sidebar</button>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="content">
        <Header />
        <InputArea />
        <Footer />
      </div>
    </div>
  //   <>
  //     <div>
  //       <a href="https://vite.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_b
  // lank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.jsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  
  )
}

export default App;


// import React, { useState } from 'react';
// import Sidebar from './Sidebar';

// function App() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <div className="App">
//       <button className="open-btn" onClick={toggleSidebar}>Open Sidebar</button>
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="content">
//         <h1>Main Content</h1>
//         <p>This is the main content area of the application.</p>
//       </div>
//     </div>
//   );
// }

// export default App;