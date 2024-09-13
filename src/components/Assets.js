import { Urls } from './Links';

const { cloud_storage_prefix } = Urls;

// Helper function to prepend cloud storage prefix to image paths
// You can comment out this function if you are not using Google Cloud Storage
const prependCloudPrefix = (paths) => {
//   const result = {};
//   for (const key in paths) {
//     result[key] = cloud_storage_prefix + paths[key];
//   }
  return paths;
};

// Define image paths without prefix
const imagePaths = {
    home_background: cloud_storage_prefix + "images/BioMembHub8.webp",
    architecture: "images/Architecture.png",
    cellpm: "images/CELLPM-logo.jpg",
    tmnet_server: "images/Logo_1TMnet_server.jpg",
    BMH: "images/Logo_BMH.png",
    FMAP_server: "images/Logo_FMAP_server.jpg",
    MEMBRANOME: "images/Logo_MembranomeX_DB2.jpg",
    oprlm_db: "images/Logo_OPRLM_DB2.jpg",
    oprlm_server: "images/Logo_OPRLM_server.jpg",
    permm_server: "images/Logo_PERMM_server1.jpg",
    permm_db: "images/Logo_PerMM_DB2.jpg",
    ppm: "images/Logo_PPM_server.jpg",
    tmdock: "images/Logo_TMDOCK_server.jpg",
    tmpfold: "images/Logo_TMPFOLD_server2.jpg",
    nsf: "images/NSF_logo.jpg",
    fmap: "images/Logo_FMAP_server.jpg",
    lehigh_university: "images/Lehigh_University.jpg",
};

const teamPaths = {
    alexey_kovalenko: "images/team/Alexey_Kovalenko.jpg",
    andrei_lomize: "images/team/Andrei_Lomize.jpg",
    jungyong_ji: "images/team/Jungyong_Ji.jpg",
    l_ponoop_prasad_patro: "images/team/L_Ponoop_Prasad_Patro.jpg",
    sang_jun_park: "images/team/Sang-Jun_Park.jpg",
    stanislav_cherepanov: "images/team/Stanislav_Cherepanov.jpg",
    wonpil_im: "images/team/Wonpil_Im.jpg",
    yongsu_baek: "images/team/Yongsu_Baek.jpg",
    zigang_song: "images/team/Zigang_Song.jpg",
};

// Apply cloud prefix to all images and team member images
export const Assets = {
  images: prependCloudPrefix(imagePaths),
  team: prependCloudPrefix(teamPaths),
};