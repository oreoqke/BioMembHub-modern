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
              src='images/Logo_OPRLM_DB1.jpg'
              text='OPRLM (Orientations of Proteins in Realistic Lipid Membranes) Database'
              label='Database'
              path={Databases.OPRLM}
            />
            <CardItem
              src='images/Logo_MembranomeX.jpg'
              text='Membranome Database'
              label='Database'
              path={Databases.MEMBRANOME}
            />
            <CardItem
              src='images/Logo_PerMM_DB.jpg'
              text='PerMM (Permeability of Molecules across Membranes) Database'
              label='Database'
              path={Databases.PERMM}
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='images/Logo_PPM_server.jpg'
              text='PPM (Positioning of Proteins in Membranes) Webserver'
              label='Webserver'
              path={Webservers.PPM}
            />
            <CardItem
              src='images/Logo_OPRLM_server.jpg'
              text='OPRLM (Orientations of Proteins in Realistic Lipid Membranes) Webserver'
              label='Webserver'
              path={Webservers.OPRLM}
            />
            <CardItem
              src='images/Logo_FMAP_server.jpg'
              text='FMAP (Folding of Membrane-Associated Peptides) Webserver'
              label='Webserver'
              path={Webservers.FMAP}
            />
            <CardItem
              src='images/Logo_TMDOCK_server.jpg'
              text='TMDOCK (TM helix Docking) Webserver'
              label='Webserver'
              path={Webservers.TMDOCK}
            />
          </ul>
          <ul className='cards__items'>
          <CardItem
              src='images/Logo_TMPfold_server2.jpg'
              text='TMPfold (TM Protein Folding) Webserver'
              label='Webserver'
              path={Webservers.TMPfold}
            />
            <CardItem
              src='images/Logo_PERMM_server1.jpg'
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
              src='images/CELLPM-logo.jpg'
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
