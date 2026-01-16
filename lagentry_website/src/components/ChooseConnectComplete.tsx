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
  const [stepTitles, setStepTitles] = useState<{ [key: number]: string }>({});
  const sectionRef = useRef<HTMLDivElement>(null);
  const typewriterTimeouts = useRef<{ [key: number]: NodeJS.Timeout | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Start all steps instantly - no delay
            setTimeout(() => {
              // Set all steps to active immediately
              setActiveStep(steps.length - 1); // Set to last step so all are active
            }, 100);
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
      // Clear all typewriter timeouts
      Object.values(typewriterTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Typewriter effect for step titles - start all at once
  useEffect(() => {
    if (activeStep >= steps.length - 1) {
      // Start typewriter for all steps simultaneously
      steps.forEach((step, index) => {
        // Clear any existing timeout for this step
        if (typewriterTimeouts.current[step.number]) {
          clearTimeout(typewriterTimeouts.current[step.number]!);
        }

        // Reset and start typing
        setStepTitles(prev => ({ ...prev, [step.number]: '' }));
        let currentIndex = 0;
        const typeText = () => {
          if (currentIndex < step.title.length) {
            setStepTitles(prev => ({
              ...prev,
              [step.number]: step.title.slice(0, currentIndex + 1)
            }));
            currentIndex++;
            typewriterTimeouts.current[step.number] = setTimeout(typeText, 80); // 80ms per character
          }
        };
        // Start typing immediately for all steps
        typeText();
      });
    }
  }, [activeStep]);

  return (
    <div className="choose-connect-complete-section" ref={sectionRef}>
      <div className="choose-connect-complete-container">
        <div className="section-header">
          <h2 className="section-title">
            The <span className="agent-word-underlined">Lagentry</span> Process.
          </h2>
        </div>
        <div className={`steps-container ${isVisible ? 'visible' : ''}`}>
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`step-card step-${step.number} ${activeStep >= index ? 'active' : ''} ${activeStep === index ? 'current' : ''}`}
              style={{ '--step-delay': '0s' } as React.CSSProperties}
            >
              <div className="step-number-circle">
                <span className="step-number">{step.number}</span>
              </div>
              
              <div className="step-content">
                <h3 className="step-title">
                  {activeStep >= steps.length - 1
                    ? (stepTitles[step.number] || step.title) // Show typewriter text or full title if all steps are active
                    : activeStep > index 
                      ? step.title // Show full title if step has been completed
                      : activeStep === index 
                        ? (stepTitles[step.number] || '') // Show typewriter text if currently active
                        : '' // Show nothing if step hasn't been reached yet
                  }
                  {activeStep >= steps.length - 1 && stepTitles[step.number] && stepTitles[step.number].length < step.title.length && (
                    <span className="typewriter-cursor">|</span>
                  )}
                </h3>
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

