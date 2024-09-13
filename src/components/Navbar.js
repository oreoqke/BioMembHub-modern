import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { Assets } from './Assets';

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  window.addEventListener('resize', showButton);

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            BioMembHub
            {/* <i class='fab fa-typo3' /> */}
            <img src={Assets.images.BMH} alt="BMH" width="50" height="50" loading="lazy"/>
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/about'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                About
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/databases'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Databases
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/webservers'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Webservers
              </Link>
            </li>
            {/* <li className='nav-item'>
              <Link
                to='/help'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                Help
              </Link>
            </li> */}
            
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
