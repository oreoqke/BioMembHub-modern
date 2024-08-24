import React from 'react';
import './About.css';

function About() {
    return (
        <div className='page-container'>
            <ul>
                <h1 className='section-title'>Introduction</h1>
                <h1 className='section-title'>Our Team</h1>
                <div>
                    <h1 className='section-title'>Acknowledgements</h1>
                    <p>Thank you to Alexey Kovalenko and Stanyslav Cherepanov for the help in creating BioMembHub.</p>
                </div>
                <h1 className='section-title'>Contact Us</h1>
            </ul>
        </div>
    );
}

export default About;