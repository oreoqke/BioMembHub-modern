import React, { useEffect } from 'react';
import './Help.css';

function handleRotation() {
    const images = document.querySelectorAll('.rotating-image');

    images.forEach((image) => {
        const scrollPosition = window.scrollY;
        const rotationY = scrollPosition; // Change this value to adjust the rotation
        image.style.transform = `rotateY(${rotationY}deg)`;
    })

}

function Help() {
    useEffect(() => {
        window.addEventListener('scroll', handleRotation);

        return () => {
            window.removeEventListener('scroll', handleRotation);
        }
    }, []);

  return (
    <div className='help'>
        <h1>Help</h1>
        <img 
            src="images/Logo_BMH.png"
            alt="Logo"
            className='rotating-image'
        />
        <img 
            src="images/Logo_BMH.png"
            alt="Logo"
            className='rotating-image'
        />
        <p> Scroll down to see animation</p>
        <div className="long-content">
        </div>
    </div>
  );
}

export default Help;