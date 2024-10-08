import React, { useLayoutEffect } from 'react'; 
import './About.css';
import { Databases, Webservers } from '../../Links';
import Footer from '../../Footer';
import { useLocation} from 'react-router-dom';
import { Team } from './Team.js';
import { Contacts } from './Contacts.js';
import { Assets } from '../../Assets.js';

function Intro() {
    return (
        <div>
            <h1 className='section-title'>
                About
            </h1>
            <div class="about">
                <img src={Assets.images.BMH} loading="lazy" alt="BioMemHub"/>
                <p> The BioMemHub infrastructure is composed of three parts. 
                    The first part includes the {' '}
                    <a href={Databases.OPRLM}>OPRLM</a>{' '}
                    database, a successor to the {' '}
                    <a href={Databases.OPM}>OPM</a>{' '}
                    database, and the associated {' '}
                    <a href={Webservers.PPM}>PPM</a>,{' '}
                    <a href={Webservers.OPRLM}>OPRLM</a>, and {' '}
                    <a href={Webservers.TMPfold}> TMPfold</a>{' '}
                    web servers. The second part consists of the {' '}
                    <a href={Databases.MEMBRANOMEX}>MEMBRANOMEX</a>{' '}
                    database, a successor to the {' '}
                    <a href={Databases.MEMBRANOME}>MEMBRANOME</a>{' '}
                    database and the associated {' '}
                    <a href={Webservers.TMDOCK}>TMDOCK</a>,{' '}
                    <a href={Webservers.FMAP}>FMAP</a>, and {' '}
                    <a href={Webservers.TMnet}>1TMnet</a>{' '}
                    web tools. The third part includes the {' '}
                    <a href={Databases.PERMM}>PerMM</a>{' '}
                    database and the {' '}
                    <a href={Webservers.PERMM}>PerMM</a>{' '} and {' '}
                    <a href={Webservers.CELLPM}>CellPM</a>{' '}
                    web tools for analysis of passive membrane permeability
                    of small bioactive molecules and peptides. OPM and PPM are
                    integrated into various academic research resources like PDB,
                    PDBsum, Encompass, MOLEonline, CELLmicrocosmos, etc.
                    </p>
            </div>
        </div>
    );
}

function ToggleSize() {
    var img = document.getElementById('scalable-image');
    img.classList.toggle("scaled");
}

function About() {
    const location = useLocation();

    useLayoutEffect(() => {
        if (location.hash) {
            setTimeout(() => {
                const element = document.getElementById(location.hash.substring(1));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth'});
                }
            }, 200);
        }
    }, [location])

    return (
        <>
        <div className='page-container'>
            <ul>
                <section id="introduction">
                    <Intro />
                    <img id="scalable-image"
                         src={Assets.images.architecture}
                         alt="BioMemHub Architecture" 
                         class='scheme-img'
                         onClick={ToggleSize}/>
                </section>
                <section id="team">
                    <h1 className='section-title'>Our Team</h1>
                    <Team />
                </section>
                <section id="funding">
                    <h1 className="section-title">Funding</h1>
                    <div className="funding-section">
                        <img src={Assets.images.nsf} alt="NSF" loading="lazy" className="nsf-logo" />
                        <div className="funding-links">
                            <a href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2403583" target="_blank" rel="noopener noreferrer">NSF DBI -2403503</a>
                            {/* <p>Collaborative Research: BioMembHub Cyberinfrastructure for Modeling and Analysis of Proteins, Peptides, and Small Molecules in Biomembranes</p> */}
                            <a href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2403582" target="_blank" rel="noopener noreferrer">NSF DBI -2403502</a>
                            {/* <p>BioMembHub Cyberinfrastructure for Modeling and Analysis of Proteins, Peptides, and Small Molecules in Biomembranes</p> */}
                        </div>
                    </div>
                </section>
                <section id="acknowledgements">
                    <h1 className='section-title'>Acknowledgements</h1>
                    <p style={{ textAlign: 'center' }}> Thank you to Alexey Kovalenko and Stanislav Cherepanov for the help in creating BioMembHub.</p>               </section>
                <section id="contact">
                    <h1 className='section-title'>Contact Us</h1>
                    <Contacts />
                </section>
            </ul>
        </div>
        <Footer />
        </>

    );
}

export default About;