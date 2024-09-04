import React, { useEffect } from 'react';
import './Help.css'; // Import the CSS file

// Function to handle the scrolling logic
function handleScroll() {
  // Get all image elements by their class name
  const images = document.querySelectorAll('.background-image');
  
  // Loop through each image and apply the spin transformation
  images.forEach((image) => {
    // Get the scroll position of the page
    const scrollPosition = window.scrollY;
    
    // Apply rotation based on scroll position (spinning around Y-axis)
    const scrollRotationY = scrollPosition ; // Adjust the multiplier for spin speed
    
    // Get the initial 2D rotation from the data attribute (defined in CSS)
    const initialRotation = image.getAttribute('data-initial-rotation') || '0';

    // Combine the initial 2D rotation and the scroll-based Y-axis rotation
    image.style.transform = `rotateY(${scrollRotationY}deg) rotate(${initialRotation}deg) `;
  });
}

function Help() {
  useEffect(() => {
    // Add scroll event listener to call handleScroll for spinning images
    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="help">
      <h1>Help</h1>
      <div className="background-image top-left" data-initial-rotation="45"></div> {/* 45 degrees initial rotation */}
      <div className="background-image bottom-right" data-initial-rotation="90"></div> {/* 90 degrees initial rotation */}
      <div className="background-image top-right" data-initial-rotation="0"></div> {/* No initial rotation */}
      <p>Scroll down to see the images spin as you scroll.</p>
      <div className="long-content">
        <p>Keep scrolling down...</p>
      </div>
    </div>
  );
}

export default Help;