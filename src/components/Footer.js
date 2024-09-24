import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { Links } from './Links';
import { Assets } from './Assets';

function Footer() {
  return (
    <div className='footer-container'>
      <section className='footer-subscription'>
      </section>
      <div class='footer-links'>
        <div className='footer-link-wrapper'>
          <div class='footer-link-items'>
            <h2>Affiliations</h2>
            <a href={Links.Lehigh_University}>Lehigh University</a>
            <a href={Links.Department_of_Biological_Sciences}>Department of Biological Sciences</a>
            <a href={Links.Department_of_Chemistry}>Department of Chemistry</a>
            <a href={Links.Department_of_Bioengineering}>Department of Bioengineering</a>
          </div>
          <div class='footer-link-items'>
            <h2>About</h2>
            <Link to='/about#team'>Our Team</Link>
            <Link to='/about#contact'>Contact</Link>
            <a href={Links.Lomize_Group}>Lomize Group</a>
            <a href={Links.Im_Lab}>Im Lab</a>
            <a href='/about#funding'> Funding</a>
          </div>
          <div class='footer-link-items'>
            <h2>Resources</h2>
            <Link to={Links.BitBucket}>BitBucket</Link>
            <Link to='/databases'>Databases</Link>
            <Link to='/webservers'>Webservers</Link>
            {/* <Link to='/'>Help</Link> */}
          </div>
          <div class='footer-link-items'>
            <h2>Contact Info</h2>
            <p class="contact-email" style={{color: "#fff"}}> almz@umich.edu</p>
            <p class="contact-email" style={{color: "#fff"}}> wonpil@lehigh.edu</p>
            <p class="contact-address">(610) 758-4524</p>
            <p class="contact-address"> Iacocca Hall, 111 Research Drive<br/>
             Bethlehem, PA 18015</p>
          </div>
        </div>

      </div>
      <section class='social-media'>
        <div class='social-media-wrap'>
          <div class='footer-logo'>
            <img src={Assets.images.lehigh_university} alt='Im Lab' loading="lazy" className='logo-image'/>
            <small class='website-rights'>Copyright(c) 2024-2026 by the Im Lab</small>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Footer;
