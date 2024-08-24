import React from 'react';
import '../../App.css';
import './Home.css';
import Cards from '../Cards';
import HeroSection from '../HeroSection';
import Footer from '../Footer';

function Home() {
  return (
    <>
      <HeroSection />
      <Cards />
      <div className='container-info'>
        <p>The BioMembHub cyberinfrastructure is composed of 3 databases 
          (OPRLM, Membranome, and PerMM) and 8 webservers 
          (PPM, OPRLM, FMAP, TMDOCK, TMPfold, 1TMnet, PerMM, and CellPM). 
          It was developed to facilitate all-atom modeling and analysis of 
          folding, stability, spatial positions, and interactions of proteins, 
          peptides, and small molecules in implicit and explicit membranes of 
          different complexity. These web resources facilitate insights into 
          structures, energetics, and dynamics of molecules in biomembranes.</p>
      </div>
      <Footer />
    </>
  );
}

export default Home;
