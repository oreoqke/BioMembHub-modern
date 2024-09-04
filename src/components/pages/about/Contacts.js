import React from 'react';
import './Contacts.css';

export function Contacts() {
    return (
        <div class='contacts'>
            <div class="contact-item">
                <p class="contact-name">Wonpil Im</p>
                <p class="contact-email"> wonpil@lehigh.edu </p>
                <p> 610-758-4524 (office) </p>
                <p> Iacocca Hall, 111 Research Drive<br/> 
                    Bethlehem, PA 18015
                </p>
            </div>
            <div class="contact-item">
                <p class="contact-name">Andrei Lomize</p>
                <p class="contact-email"> almz@umich.edu </p>
                <p> 734-819-1072</p>
                <p> 428 Church Street <br/> Ann Arbor, MI 49109-1065</p>
            </div>
        </div>
    );
}