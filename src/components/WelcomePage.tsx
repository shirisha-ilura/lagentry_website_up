import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderCanvas } from './ShaderCanvas';
import { AnimationShaderBackground } from './AnimationShaderBackground';
import './WelcomePage.css';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [shaderSize, setShaderSize] = useState(600);
  
  useEffect(() => {
    const updateShaderSize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setShaderSize(250);
      } else if (width <= 768) {
        setShaderSize(350);
      } else if (width <= 968) {
        setShaderSize(450);
      } else {
        setShaderSize(600);
      }
    };
    
    updateShaderSize();
    window.addEventListener('resize', updateShaderSize);
    return () => window.removeEventListener('resize', updateShaderSize);
  }, []);
  
  return (
    <div className="welcome-container">
      <AnimationShaderBackground />
      <div className="welcome-content">
        <div className="tagline-banner">
          <span>Backed by NVIDIA.</span>
        </div>
        
        <h1 className="main-heading">
          <span className="heading-line1">Create AI Agents</span>
        </h1>
        
        <div className="animated-text-container">
          <div className="animated-text-line">
            <span className="animated-text-item">With multi lingual support</span>
            <span className="animated-text-item">In Minutes</span>
            <span className="animated-text-item">With just prompts</span>
            <span className="animated-text-item">That scales</span>
            <span className="animated-text-item">With 100+ connectors</span>
          </div>
        </div>
        
        <p className="description-text">
          Vibe with your ideas. Just describe what you want in plain English — and watch your AI agent come to life instantly.
        </p>
        
        <div className="cta-section">
          <button className="cta-button" onClick={() => navigate('/waitlist')}>
            Join the Waitlist
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
      
              <div className="animation-space">
                {/* Shader reminder animation - Ether shader */}
                <ShaderCanvas 
                  size={shaderSize}
                  shaderId={2}
                  className="shader-reminder"
                />
              </div>
    </div>
  );
};

export default WelcomePage;