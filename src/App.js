import React from 'react';
import Navbar from './components/Navbar';
import './App.css';
import Home from './components/pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes
import About from './components/pages/about/About';

import DatabasesPage from './components/pages/Databases.js';
import WebserversPage from './components/pages/Webservers.js';
import Help from './components/pages/Help';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes> {/* Use Routes instead of Switch */}
          <Route path='/' element={<Home />} /> {/* Use element instead of component */}
          <Route path='/databases' element={<DatabasesPage />} />
          <Route path='/webservers' element={<WebserversPage />} />
          <Route path='/help' element={<Help />} />
          <Route path='/about' element={<About />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;