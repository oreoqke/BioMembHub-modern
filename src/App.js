import React from 'react';
import Navbar from './components/Navbar';
import './App.css';
import Home from './components/pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes
import Services from './components/pages/Services';
import Products from './components/pages/Products';
import SignUp from './components/pages/SignUp';
import About from './components/pages/about/About';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes> {/* Use Routes instead of Switch */}
          <Route path='/' element={<Home />} /> {/* Use element instead of component */}
          <Route path='/services' element={<Services />} />
          <Route path='/products' element={<Products />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/about' element={<About />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;