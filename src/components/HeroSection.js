import React from 'react';
import '../App.css';
import './HeroSection.css';
import { Assets } from './Assets';

function HeroSection() {

  return (
    <div
      className="hero-container"
      style={{ '--hero-background': `url(${Assets.images.home_background})` }}
    >
      <h1>BioMembHub</h1>
      <p>Making Membrane Proteins Exciting Again</p>
    </div>
  );
}

export default HeroSection;
