import React from 'react';
import './Resources.css';
import { Webservers } from '../Links';
import Footer from '../Footer';
import { Assets } from '../Assets';

function WebserversPage() {
    const fontSize = "17px";
    return (
        <>
            <div class="page-container">
                <h1 class="section-title">Webservers</h1>

                {/* PPM */}
                <div class="database-item">
                    <img src={Assets.images.ppm} alt="Webserver" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.PPM}><h3>PPM (Positioning of Proteins in Membranes)</h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                        The PPM web server allows 
                        calculation of translational and rotational positions of transmembrane 
                        and peripheral membrane proteins in flat and curved lipid bilayers 
                        using their 3D structures as input. PPM calculates spatial positions 
                        of proteins in different artificial lipid bilayers and biomembranes 
                        characterized by specified polarity profiles, mechanical properties, 
                        and hydrophobic thicknesses. 
                        </p>
                    </div>
                </div>

                {/* OPRLM */}
                <div class="database-item">
                    <img src={Assets.images.oprlm_server} alt="Webserver" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.OPRLM}><h3>OPRLM (Orientations of Proteins in Realistic Lipid Membranes) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The OPRLM web server combines PPM with CHARMM-GUI Membrane Builder to facilitate 
                            generation of protein-lipid simulation systems and input files for 
                            all-atom molecular dynamics simulations. It allows inserting of a 
                            protein structure into explicit lipid bilayers corresponding to 18 
                            types of biological membranes and simple artificial membranes with 
                            different lipid composition.
                        </p>
                    </div>
                </div>

                {/* TMPfold */}
                <div class="database-item">
                    <img src={Assets.images.tmpfold} alt="Webserver" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.TMPfold}><h3>TMPfold (TM Protein folding) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                        The TMPfold web tool calculates the free energy 
                        of TM α-helix association in proteins with known 3D structures and 
                        can be used for analysis of possible folding intermediates and 
                        co-translational pathways of association of TM α-helices. The 
                        free energy components include van der Waals, hydrogen bonding, 
                        and dipole interactions, side-chain conformational entropy, and 
                        solvation energy in the anisotropic lipid environment. 
                        </p>
                    </div>
                </div>

                {/* FMAP */}


                <div class="database-item">
                    <img src={Assets.images.fmap} alt="Webserver" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.FMAP}><h3> FMAP (Folding of Membrane-Associated Peptides) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                        The FMAP (Folding of Membrane-Associated Peptides) web server 
                        allows identification and modeling of α-helices in different 
                        environments. Using an amino acid sequence and experimental 
                        conditions as input, FMAP predicts the existence of individually 
                        stable α-helices formed by peptides in aqueous solution, micelles, 
                        and lipid bilayers and provides their 3D models positioned with 
                        respect to the flat bilayer or spherical micelles. 
                        </p>
                    </div>
                </div>

                {/* 1TMnet */}
                <div class="database-item">
                    <img src={Assets.images.tmnet_server} alt="Webserver" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.TMnet}><h3> 1TMnet </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                        1TMnet visualizes the networks of bitopic proteins participating in 
                        different complexes and cellular pathways. For a set of user-selected 
                        proteins from the database, 1TMnet generates interactive tables and 
                        graphs that show structural and functional relations between these 
                        proteins based on experimentally proven interactions, known complexes, 
                        and associations in biological pathways. 
                        </p>
                    </div>
                </div>

                <div class="database-item">
                    <img src={Assets.images.tmdock} alt="Webserver" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.TMDOCK}><h3> TMDOCK (TM helix DOCKing) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                        The TMDOCK web server generates 3D models 
                        of TM α-helical dimers by threading a target amino acid sequence 
                        through several structural templates followed by local energy 
                        minimization. This method identifies alternative dimerization 
                        modes and ranks them based on the calculated free energy of 
                        α-helix association. The free energy components include van der Waals, 
                        hydrogen bonding, and dipole interactions, side-chain conformational 
                        entropy, and solvation energy in an anisotropic lipid environment. 
                        </p>
                    </div>
                </div>

                <div class="database-item">
                    <img src={Assets.images.permm_server} alt="Webserver" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.PERMM}><h3> PerMM (Permeability of Molecules across Membranes) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                        The PerMM web tool allows assessment of passive permeability 
                        of small organic molecules across the lipid bilayer. The 
                        underlying method is based on solubility-diffusion theory 
                        and operates with atomic 3D structures of solutes and the 
                        anisotropic solvent model of the lipid bilayer characterized 
                        by the defined transbilayer profiles of dielectric and 
                        hydrogen-bonding capacity parameters. PerMM calculates membrane 
                        binding affinity, energy profiles along the bilayer normal, and 
                        permeability coefficients of diverse molecules across different 
                        membrane types. The server can assist investigators at early 
                        stages of drug discovery to optimize cell permeability of new 
                        therapeutics derived from natural products or synthetic molecules.
                        </p>
                    </div>
                </div>
                <div class="database-item">
                    <img src={Assets.images.cellpm} alt="Webserver" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.CELLPM}><h3> CellPM </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                        The CellPM web server is a physics-based computational 
                        tool for analysis of peptide-membrane interactions and 
                        prediction of peptide’s ability to cross the lipid bilayer 
                        via an energy-independent pathway. One can use an amino 
                        acid sequence or a predefined 3D structure of a specified 
                        peptide to calculate its optimal spatial position in 
                        membrane, the energy of membrane binding, the lowest 
                        energy translocation pathway across the lipid bilayer, 
                        and the permeability coefficient. This tool produces 
                        a physically realistic description of membrane-peptide 
                        interactions, including peptide insertion into membrane, 
                        formations of α-helices, and the changes in peptide 
                        orientation during the passive translocation through membrane.  
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default WebserversPage;