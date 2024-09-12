import React from 'react';
import './Cards.css';
import CardItem from './CardItem';
import { Databases, Webservers } from './Links';

function Cards() {
  return (
    <div className='cards'>
      {/* <h1>Here is Our Databases and Webservers!</h1> */}
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='images/Logo_OPRLM_DB2.jpg'
              text='Orientations of Proteins in Realistic Lipid Membranes'
              label='Database'
              path={Databases.OPRLM}
            />
            <CardItem
              src='images/Logo_MembranomeX_DB2.jpg'
              text='Single-Pass Transmembrane Proteins from 20 Organisms'
              label='Database'
              path={Databases.MEMBRANOME}
            />
            <CardItem
              src='images/Logo_PerMM_DB2.jpg'
              text='Permeability of Molecules across Membranes'
              label='Database'
              path={Databases.PERMM}
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='images/Logo_PPM_server.jpg'
              text='Positioning of Proteins in Membranes'
              label='Webserver'
              path={Webservers.PPM}
            />
            <CardItem
              src='images/Logo_OPRLM_server.jpg'
              text='Orientations of Proteins in Realistic Lipid Membranes'
              label='Webserver'
              path={Webservers.OPRLM}
            />
            <CardItem
              src='images/Logo_FMAP_server.jpg'
              text='Folding of Membrane-Associated Peptides'
              label='Webserver'
              path={Webservers.FMAP}
            />
            <CardItem
              src='images/Logo_TMDOCK_server.jpg'
              text='TransMembrane helix Docking'
              label='Webserver'
              path={Webservers.TMDOCK}
            />
          </ul>
          <ul className='cards__items'>
          <CardItem
              src='images/Logo_TMPFOLD_server2.jpg'
              text='TransMembrane Protein Folding'
              label='Webserver'
              path={Webservers.TMPfold}
            />
            <CardItem
              src='images/Logo_PERMM_server1.jpg'
              text='Permeability of Molecules across Membranes'
              label='Webserver'
              path={Webservers.PERMM}
            />
              <CardItem
              src='images/Logo_1TMnet_server.jpg'
              text='Protein Network Analysis'
              label='Webserver'
              path={Webservers.TMnet}
            />
            <CardItem
              src='images/CELLPM-logo.jpg'
              text='Cell-Penetrating Peptide Molecules'
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
