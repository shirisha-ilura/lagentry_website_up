import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShaderCanvas } from "./ShaderCanvas";
import "./WelcomePage.css";
import { hasIntroCompleted } from "../introState";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [shaderSize, setShaderSize] = useState(600);
  const [isIntroComplete, setIsIntroComplete] = useState(() => hasIntroCompleted());

  useEffect(() => {
    // If intro already completed (we are navigating back to home), show content immediately.
    if (hasIntroCompleted()) {
      setIsIntroComplete(true);
      return;
    }

    // First load: wait for intro animation to complete (Header ends around 5000ms)
    const timer = setTimeout(() => {
      setIsIntroComplete(true);
    }, 5500); // Slightly after header hides to allow smooth transition

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateShaderSize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setShaderSize(350); /* Increased from 280 */
      } else if (width <= 768) {
        setShaderSize(450); /* Increased from 350 */
      } else if (width <= 968) {
        setShaderSize(500); /* Increased from 400 */
      } else {
        setShaderSize(500); /* Reduced from 800 */
      }
    };

    updateShaderSize();
    window.addEventListener("resize", updateShaderSize);
    return () => window.removeEventListener("resize", updateShaderSize);
  }, []);

  // Don't render WelcomePage content during intro animation
  if (!isIntroComplete) {
    return null;
  }

  return (
    <div className="welcome-container intro-complete">
      {/* Purple shader reminder - Just below navbar */}
      <div className="top-shader-wrapper">
        <div className="shader-reminder top-shader">
          <ShaderCanvas
            size={shaderSize}
            shaderId={2}
          />
        </div>
      </div>

      <div className="welcome-content">
        <div className="tagline-banner">
          <img
            src="/images/nvidia-logo-png_seeklogo-101614.png"
            alt="NVIDIA"
            className="nvidia-logo"
          />
          <span>Backed by NVIDIA.</span>
        </div>

        <h1 className="main-heading">
          <span className="heading-line1">Launch AI Employees</span>
        </h1>

        <div className="animated-text-container">
          <div className="animated-text-line">
            <span className="animated-text-item">
              With multi lingual support
            </span>
            <span className="animated-text-item">In Minutes</span>
            <span className="animated-text-item">With just prompts</span>
            <span className="animated-text-item">That scales</span>
            <span className="animated-text-item">With 100+ connectors</span>
          </div>
        </div>

        <p className="description-text">
          Vibe with your ideas. Just describe what you want in plain English —
          and watch your AI agent come to life instantly.
        </p>

        <div className="cta-section">
          {/* Use the same visual style as the navbar "Book a Demo" button */}
          <button className="demo-button" onClick={() => navigate('/waitlist')}>
            Join the Waitlist
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;