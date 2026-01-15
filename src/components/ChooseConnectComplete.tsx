import React, { useState, useEffect, useRef } from 'react';
import './ChooseConnectComplete.css';

interface Step {
  number: number;
  title: string;
  description: string;
  tags: string[];
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Choose',
    description: 'Select from a wide variety of pre trained AI agents, didn\'t find yours? build it using natural language prompts, truly no-code.',
    tags: ['Pre-trained Agents', 'Natural Language', 'No-Code Builder', 'Custom Agents']
  },
  {
    number: 2,
    title: 'Connect',
    description: 'Connect with tools, platforms and databases without handling any APIs.',
    tags: ['Tools Integration', 'Platforms', 'Databases', 'No API Setup']
  },
  {
    number: 3,
    title: 'Complete',
    description: 'Deploy your agent in one click, chat, talk , monitor and watch your tasks getting automated in seconds!',
    tags: ['One-Click Deploy', 'Chat Interface', 'Voice Talk', 'Monitor & Automate']
  }
];

const ChooseConnectComplete: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Start step animation sequence
            setTimeout(() => {
              setActiveStep(0);
              interval = setInterval(() => {
                setActiveStep((prev) => {
                  if (prev >= steps.length - 1) {
                    if (interval) {
                      clearInterval(interval);
                    }
                    return prev;
                  }
                  return prev + 1;
                });
              }, 3000);
            }, 500);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    <div className="choose-connect-complete-section" ref={sectionRef}>
      <div className="choose-connect-complete-container">
        <div className="section-header">
          <h2 className="section-title">
            Meet Lagentry's AI, the research-first platform to choose, connect and complete AI Agents
          </h2>
        </div>
        <div className={`steps-container ${isVisible ? 'visible' : ''}`}>
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`step-card step-${step.number} ${activeStep >= index ? 'active' : ''} ${activeStep === index ? 'current' : ''}`}
              style={{ '--step-delay': `${index * 0.2}s` } as React.CSSProperties}
            >
              <div className="step-number-circle">
                <span className="step-number">{step.number}</span>
              </div>
              
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseConnectComplete;

