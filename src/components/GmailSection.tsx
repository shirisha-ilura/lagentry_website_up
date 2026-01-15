import React from 'react';
import './GmailSection.css';
import GmailVideo from '../email.mp4';

const GmailSection: React.FC = () => {
  return (
    <section className="gmail-section">
      <div className="gmail-frame-wrap">
        <video className="gmail-video" src={GmailVideo} autoPlay muted loop playsInline />
      </div>
    </section>
  );
};

export default GmailSection;


