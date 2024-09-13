import React from 'react';
import '../../App.css';
import './Home.css';
import Cards from '../Cards';
import HeroSection from '../HeroSection';
import Footer from '../Footer';
import { Databases, Webservers } from '../Links';


function Home() {
  return (
    <>
      <HeroSection />
      <div className='container-info'>
        <Intro />
      </div>
      <Cards />
      <Footer />
    </>
  );
}

export default Home;

function Intro() {
  return (
      <div>
          <p> The BioMembHub cyberinfrastructure is composed of 3 databases 
              (<a href={Databases.OPRLM}>OPRLM</a>,{' '} 
              <a href={Databases.MEMBRANOME}>Membranome</a>, and{' '}
              <a href={Databases.PERMM}>PerMM</a>){' '}
              and 8 webservers (
              <a href={Webservers.PPM}>PPM</a>,{' '}
              <a href={Webservers.OPRLM}>OPRLM</a>,{' '}
              <a href={Webservers.FMAP}>FMAP</a>,{' '}
              <a href={Webservers.TMDOCK}>TMDOCK</a>,{' '}
              <a href={Webservers.TMPfold}>TMPfold</a>,{' '}
              <a href={Webservers.TMnet}>1TMnet</a>,{' '}
              <a href={Webservers.PERMM}>PerMM</a>, and{' '}
              <a href={Webservers.CELLPM}>CellPM</a>)
              . It was developed to facilitate all-atom modeling and analysis 
              of folding, stability, spatial positions, and interactions of proteins,
              peptides, and small molecules in implicit and explicit
              membranes of different complexity. These web resources facilitate insights into
              structures, energetics, and dynamics of molecules in biomembranes. 
          </p>
      </div>
  );
}
