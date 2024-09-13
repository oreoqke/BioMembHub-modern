import React from 'react';
import '../App.css';
// import { Button } from './Button';
import './HeroSection.css';
import { Assets } from './Assets';

function HeroSection() {

  return (
    <div
      className="hero-container"
      style={{ '--hero-background': `url(${Assets.images.home_background})` }}
    >
      {/* <video src='/videos/video-1.mp4' autoPlay loop muted /> */}
      <h1>BioMembHub</h1>
      <p> Making Membrane Proteins Exciting Again</p>
      {/* <div className='hero-btns'>
        <Button
          className='btns'
          buttonStyle='btn--outline'
          buttonSize='btn--large'
        >
          GET STARTED
        </Button>
        <Button
          className='btns'
          buttonStyle='btn--primary'
          buttonSize='btn--large'
          onClick={console.log('hey')}
        >
          WATCH TRAILER <i className='far fa-play-circle' />
        </Button>
      </div> */}
    </div>
  );
}

export default HeroSection;
