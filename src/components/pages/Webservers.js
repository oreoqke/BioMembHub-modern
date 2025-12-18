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
                <h1 class="section-title">Web Servers</h1>

                {/* PPM */}
                <div class="database-item">
                    <img src={Assets.images.ppm} alt="Web Server" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.PPM}><h3>PPM (Positioning of Proteins in Membranes)</h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The PPM web server enables the calculation of translational and rotational positions of
                            transmembrane and peripheral membrane proteins in flat and curved lipid bilayers, using their
                            3D structures as input. 
                        </p>
                    </div>
                </div>

                {/* OPRLM */}
                <div class="database-item">
                    <img src={Assets.images.oprlm_server} alt="Web Server" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.OPRLM}><h3>OPRLM (Orientations of Proteins in Realistic Lipid Membranes) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The OPRLM web server integrates the PPM method with the CHARMM-GUI Membrane Builder
                            to streamline the creation of protein-lipid simulation systems and prepare input files for all-atom
                            molecular dynamics simulations. It enable the insertion of a protein structure into explicit lipid
                            bilayers corresponding to 18 types of biological membranes, as well as simple artificial
                            membranes with varying lipid compositions.
                        </p>
                    </div>
                </div>

                {/* TMPfold */}
                <div class="database-item">
                    <img src={Assets.images.tmpfold} alt="Web Server" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.TMPfold}><h3>TMPfold (TM Protein folding) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The TMPfold web tool calculates the free energy of transmembrane (TM) α-helix association in
                            proteins with known 3D structures. It can be used to analyze potential folding intermediates and
                            co-translational pathways of association of TM α-helices. The free energy components
                            considered in calculations include van der Waals interactions, hydrogen bonding, and dipole
                            interactions, side-chain conformational entropy, and solvation energy in an anisotropic lipid
                            environment.
                        </p>
                    </div>
                </div>

                {/* FMAP */}


                <div class="database-item">
                    <img src={Assets.images.fmap} alt="Web Server" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.FMAP}><h3> FMAP (Folding of Membrane-Associated Peptides) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The FMAP (Folding of Membrane-Associated Peptides) web server enables the identification
                            and modeling of α-helices in various environments. Using an amino acid sequence and
                            experimental conditions as input, FMAP predicts the existence of individually stable α-helices
                            formed by peptides in aqueous solution, micelles, and lipid bilayers. It then provides 3D models
                            of these helices, positioned within flat bilayer or spherical micelles.
                        </p>
                    </div>
                </div>

                {/* 1TMnet */}
                <div class="database-item">
                    <img src={Assets.images.tmnet_server} alt="Web Server" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.TMnet}><h3> 1TMnet </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            1TMnet offers visualization of networks involving bitopic proteins that participate in different
                            complexes and cellular pathways. For a set of user-selected proteins from the database,
                            1TMnet generates interactive tables and graphs illustrating structural and functional relationship
                            among these proteins, based on experimentally proven interactions, complexes, and
                            associations in biological pathways. 
                        </p>
                    </div>
                </div>

                <div class="database-item">
                    <img src={Assets.images.tmdock} alt="Web Server" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.TMDOCK}><h3> TMDOCK (TM helix DOCKing) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The TMDOCK web server generates 3D models of TM α-helical dimers by threading a target
                            amino acid sequence through several structural templates, followed by local energy
                            minimization. This method identifies alternative dimerization modes and ranks them based on
                            the calculated free energy of α-helix association. The free energy components considered in
                            calculations include van der Waals interactions, hydrogen bonding, and dipole interactions, side-
                            chain conformational entropy, and solvation energy in an anisotropic lipid environment. 
                        </p>
                    </div>
                </div>

                <div class="database-item">
                    <img src={Assets.images.permm_server} alt="Web Server" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.PERMM}><h3> PerMM (Permeability of Molecules across Membranes) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The PerMM web server assesses the passive permeability of small organic molecules across
                            lipid bilayers. Using the solubility-diffusion approach, it employs atomic 3D structures of solutes
                            and the anisotropic solvent model of the lipid bilayer, characterized by the predefined
                            transbilayer profiles of dielectric and hydrogen-bonding capacity parameters. PerMM calculates
                            membrane binding affinity, energy profiles along the bilayer normal, and permeability
                            coefficients of diverse molecules across different membrane types. The server can assist
                            investigators at early stages of drug discovery by helping optimize cell permeability of new
                            therapeutics derived from natural products or synthetic molecules.
                        </p>
                    </div>
                </div>
                <div class="database-item">
                    <img src={Assets.images.cellpm} alt="Web Server" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.CELLPM}><h3> CellPM </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The CellPM web server is a physics-based computational tool designed to analyze peptide-
                            membrane interactions and predict a peptide's ability to traverse a lipid bilayer via passive
                            diffusion. User can input an amino acid sequence or a predefined 3D structure of a specified
                            peptide to calculate the lowest energy translocation pathway of the peptide across the lipid
                            bilayer and the permeability coefficient. This tool provides a physically realistic depiction of the
                            transmembrane translocation, including changes in the orientation of the peptide as it moves
                            through the membrane.
                        </p>
                    </div>
                </div>

                <div class="database-item">
                    <img src={Assets.images.coffee} alt="Tool" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.AF_EVALUATE}><h3> AF Evaluate (AlphaFold Evaluation Tool) </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The AlphaFold Evaluation Tool enables comprehensive evaluation and visualization of AlphaFold
                            predicted protein structures. Upload compressed archives (.tar/.tar.gz/.tgz/.zip) for backend
                            evaluation and explore 3D structures with the Mol* viewer. The tool provides detailed metrics
                            including pLDDT scores, pTM/ipTM values, secondary structure analysis, and alignment
                            comparisons with reference PDB structures, featuring interactive cysteine residue highlighting
                            and model-to-PDB alignment visualization.
                        </p>
                    </div>
                </div>

                <div class="database-item">
                    <img src={Assets.images.coffee} alt="Tool" loading="lazy" class="database-img"/>
                    <div>
                        <a href={Webservers.AF3_JSON}><h3> AlphaFold3 JSON Viewer </h3></a>
                        <p className="database-text" style={{ fontSize: fontSize }}>
                            The AlphaFold3 JSON Viewer provides interactive visualization and analysis of AlphaFold3
                            prediction results in JSON format. This tool allows researchers to explore structural predictions,
                            confidence scores, and molecular features from AlphaFold3 outputs in an intuitive web-based
                            interface, facilitating interpretation and comparison of predicted protein structures and
                            complexes.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default WebserversPage;