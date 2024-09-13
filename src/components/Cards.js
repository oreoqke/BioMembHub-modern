import React from 'react';
import './Cards.css';
import CardItem from './CardItem';
import { Databases, Webservers } from './Links';
import { Assets } from './Assets';

function Cards() {
  return (
    <div className='cards'>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src={Assets.images.oprlm_db}
              text='Orientations of Proteins in Realistic Lipid Membranes'
              label='Database'
              path={Databases.OPRLM}
            />
            <CardItem
              src={Assets.images.MEMBRANOME}
              text='Single-Pass Transmembrane Proteins from 20 Organisms'
              label='Database'
              path={Databases.MEMBRANOME}
            />
            <CardItem
              src={Assets.images.permm_db}
              text='Permeability of Molecules across Membranes'
              label='Database'
              path={Databases.PERMM}
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src={Assets.images.ppm}
              text='Positioning of Proteins in Membranes'
              label='Webserver'
              path={Webservers.PPM}
            />
            <CardItem
              src={Assets.images.oprlm_server}
              text='Orientations of Proteins in Realistic Lipid Membranes'
              label='Webserver'
              path={Webservers.OPRLM}
            />
            <CardItem
              src={Assets.images.fmap}
              text='Folding of Membrane-Associated Peptides'
              label='Webserver'
              path={Webservers.FMAP}
            />
            <CardItem
              src={Assets.images.tmdock}
              text='TransMembrane helix Docking'
              label='Webserver'
              path={Webservers.TMDOCK}
            />
          </ul>
          <ul className='cards__items'>
          <CardItem
              src={Assets.images.tmpfold}
              text='TransMembrane Protein Folding'
              label='Webserver'
              path={Webservers.TMPfold}
            />
            <CardItem
              src={Assets.images.permm_server}
              text='Permeability of Molecules across Membranes'
              label='Webserver'
              path={Webservers.PERMM}
            />
              <CardItem
              src={Assets.images.tmnet_server}
              text='Protein Network Analysis'
              label='Webserver'
              path={Webservers.TMnet}
            />
            <CardItem
              src={Assets.images.cellpm}
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
