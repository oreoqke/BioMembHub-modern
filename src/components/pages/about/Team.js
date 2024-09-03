import React from 'react';
import './Team.css';

export function Team() {
    const teamMembers = [
        {
            name: "Wonpil Im",
            image: "images/team/Wonpil_Im.jpg",
            role: "Professor of Biological Sciences",
            department: "Bioengineering and Computer Sciences and Engineering",
            university: "Lehigh University"
        },
        {
            name: "Andrei Lomize",
            image: "images/team/Andrei_Lomize.jpg",
            role: "Research Scientist",
            department: "Department of Medicinal Chemistry",
            university: "University of Michigan"
        },
        {
            name: "Alexey Kovalenko",
            image: "images/team/Alexey_Kovalenko.jpg",
            role: "Undergraduate Student",
            department: "College of Literature, Science, and the Arts",
            university: "University of Michigan"
        },
        {
            name: "L Ponoop Prasad Patro",
            image: "images/team/L_Ponoop_Prasad_Patro.jpg",
            role: "Postdoctoral Fellow",
            department: "Biological Sciences",
            university: "Lehigh University"
        },
        {
            name: "Sang-Jun Park",
            image: "images/team/Sang-Jun_Park.jpg",
            role: "Graduate Student",
            department: "Computer Sciences and Engineering",
            university: "Lehigh University"
        },
        {
            name: "Zigang Song",
            image: "images/team/Zigang_Song.jpg",
            role: "Graduate Student",
            department: "Biological Sciences",
            university: "Lehigh University"
        },
        {
            name: "Stanislav Cherepanov",
            image: "images/team/Stanislav_Cherepanov.jpg",
            role: "Graduate Student",
            department: "Biophysics Program",
            university: "University of Michigan"
        },
        {
            name: "Yongsu Back",
            image: "images/team/Yongsu_Back.jpg",
            role: "Scientist",
            company: "MolCube Inc."
        },
        {
            name: "Jungyong Ji",
            image: "images/team/Jungyong_Ji.jpg",
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
                            <img src={member.image} alt={`Team Member ${member.name}`} className="container-image" />
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