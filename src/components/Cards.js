import React from 'react';
import './Cards.css';
import CardItem from './CardItem';
import { Databases, Webservers } from './Links';

function Cards() {
  return (
    <div className='cards'>
      <h1>Here is Our Databases and Webservers!</h1>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='images/OPRLM-logo.png'
              text='OPRLM (Orientations of Proteins in Realistic Lipid Membranes) Database'
              label='Database'
              path={Databases.OPRLM}
            />
            <CardItem
              src='images/Default.png'
              text='Membranome Database'
              label='Database'
              path={Databases.MEMBRANOME}
            />
            <CardItem
              src='images/PerMM3-logo.png'
              text='PerMM (Permeability of Molecules across Membranes) Database'
              label='Database'
              path={Databases.PERMM}
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='images/PPM-logo.jpg'
              text='PPM (Positioning of Proteins in Membranes) Webserver'
              label='Webserver'
              path={Webservers.PPM}
            />
            <CardItem
              src='images/OPRLM-logo.png'
              text='OPRLM (Orientations of Proteins in Realistic Lipid Membranes) Webserver'
              label='Webserver'
              path={Webservers.OPRLM}
            />
            <CardItem
              src='images/FMAP-logo.jpg'
              text='FMAP (Folding of Membrane-Associated Peptides) Webserver'
              label='Webserver'
              path={Webservers.FMAP}
            />
            <CardItem
              src='images/TMDOCK-logo.jpg'
              text='TMDOCK (TM helix Docking) Webserver'
              label='Webserver'
              path={Webservers.TMDOCK}
            />
          </ul>
          <ul className='cards__items'>
          <CardItem
              src='images/TMPfold-logo.jpg'
              text='TMPfold (TM Protein Folding) Webserver'
              label='Webserver'
              path={Webservers.TMPfold}
            />
            <CardItem
              src='images/PerMM3-logo.png'
              text='PerMM (Permeability of Molecules across Membranes) Webserver'
              label='Webserver'
              path={Webservers.PERMM}
            />
              <CardItem
              src='images/Default.png'
              text='1TMNet (Protein Network Analysis) Webserver'
              label='Webserver'
              path={Webservers.TMnet}
            />
            <CardItem
              src='images/CELLPM-logo.png'
              text='CellPM (Cell-Penetrating Peptides) Webserver'
              label='Webserver'
              path={Webservers.CELLPM}
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Cards;
