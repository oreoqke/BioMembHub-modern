import React from 'react';
import './Team.css';
import { Assets } from '../../Assets';

export function Team() {
    const teamMembers = [
        {
            name: "Wonpil Im",
            image: Assets.team.wonpil_im,
            role: "Professor of Biological Sciences",
            department: "Bioengineering and Computer Sciences and Engineering",
            university: "Lehigh University"
        },
        {
            name: "Andrei Lomize",
            image: Assets.team.andrei_lomize,
            role: "Research Scientist",
            department: "Department of Medicinal Chemistry",
            university: "University of Michigan"
        },
        {
            name: "Alexey Kovalenko",
            image: Assets.team.alexey_kovalenko,
            role: "Undergraduate Student",
            department: "College of Literature, Science, and the Arts",
            university: "University of Michigan"
        },
        {
            name: "L Ponoop Prasad Patro",
            image: Assets.team.l_ponoop_prasad_patro,
            role: "Postdoctoral Fellow",
            department: "Biological Sciences",
            university: "Lehigh University"
        },
        {
            name: "Sang-Jun Park",
            image: Assets.team.sang_jun_park,
            role: "Graduate Student",
            department: "Computer Sciences and Engineering",
            university: "Lehigh University"
        },
        {
            name: "Zigang Song",
            image: Assets.team.zigang_song,
            role: "Graduate Student",
            department: "Biological Sciences",
            university: "Lehigh University"
        },
        {
            name: "Stanislav Cherepanov",
            image: Assets.team.stanislav_cherepanov,
            role: "Graduate Student",
            department: "Biophysics Program",
            university: "University of Michigan"
        },
        {
            name: "Yongsu Baek",
            image: Assets.team.yongsu_baek,
            role: "Scientist",
            company: "MolCube Inc."
        },
        {
            name: "Jungyong Ji",
            image: Assets.team.jungyong_ji,
            role: "Junior Scientist",
            company: "MolCube Inc."
        }
    ];

    return (
        <>
            <div className='row'>
                {teamMembers.map((member, index) => (
                    <div className='column' key={index}>
                        <div className='container'>
                            <img src={member.image} alt={`Team Member ${member.name}`} loading="lazy" className="container-image" />
                            <h3>{member.name}</h3>
                            <div className="italic-text">
                                {member.role} <br />
                                {member.department && <>{member.department} <br /></>}
                                {member.university || member.company}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}