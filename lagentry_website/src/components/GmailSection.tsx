import React, { useState, useEffect, useRef } from 'react';
import './GmailSection.css';
import GmailVideo from '../email.mp4';

const GmailSection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleVideoClick = () => {
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result?.message || 'Failed to submit. Please try again.');
      }

      setSubmitMessage('Submitted successfully!');
      // Optionally close the form after a short delay
      setTimeout(() => {
        setShowForm(false);
        setEmail('');
        setName('');
        setSubmitMessage(null);
      }, 1200);
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setSubmitMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEmail('');
    setName('');
  };

  // Force dark background on autofill - Ultra aggressive with overlay
  useEffect(() => {
    if (showForm) {
      const nameInput = nameInputRef.current;
      const emailInput = emailInputRef.current;
      const inputs = [nameInput, emailInput].filter(Boolean) as HTMLInputElement[];

      const fixAutofillBackground = () => {
        inputs.forEach((input) => {
          // Force transparent background - wrapper div has the background
          input.style.setProperty('background-color', 'transparent', 'important');
          input.style.setProperty('background', 'transparent', 'important');
          input.style.setProperty('-webkit-box-shadow', '0 0 0px 100000px transparent inset', 'important');
          input.style.setProperty('box-shadow', '0 0 0px 100000px transparent inset', 'important');
          input.style.setProperty('border', 'none', 'important');
          input.style.setProperty('mix-blend-mode', 'normal', 'important');
          
          // Also ensure wrapper has the background
          const wrapper = input.parentElement;
          if (wrapper && wrapper.classList.contains('email-form-field-input-wrapper')) {
            const isFocused = document.activeElement === input;
            const bgColor = isFocused ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)';
            wrapper.style.setProperty('background', bgColor, 'important');
            wrapper.style.setProperty('background-color', bgColor, 'important');
            
            // Check if input has white background and force fix
            const computedStyle = window.getComputedStyle(input);
            const bg = computedStyle.backgroundColor;
            const rgbMatch = bg.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
              const r = parseInt(rgbMatch[0]);
              const g = parseInt(rgbMatch[1]);
              const b = parseInt(rgbMatch[2]);
              // If it's white or very light (RGB > 200), force transparent
              if (r > 200 && g > 200 && b > 200) {
                input.style.setProperty('background-color', 'transparent', 'important');
                input.style.setProperty('background', 'transparent', 'important');
                input.style.setProperty('-webkit-box-shadow', '0 0 0px 100000px transparent inset', 'important');
                input.style.setProperty('box-shadow', '0 0 0px 100000px transparent inset', 'important');
              }
            }
          }
        });
      };

      // Fix immediately and on very frequent intervals
      fixAutofillBackground();
      const interval = setInterval(fixAutofillBackground, 50); // Check every 50ms

      // Use MutationObserver to detect style changes
      const observers = inputs.map((input) => {
        const observer = new MutationObserver(() => {
          fixAutofillBackground();
        });
        observer.observe(input, {
          attributes: true,
          attributeFilter: ['style', 'class'],
          subtree: false,
        });
        return observer;
      });

      // Also fix on all possible events
      const handleFocus = () => {
        setTimeout(fixAutofillBackground, 0);
        setTimeout(fixAutofillBackground, 10);
        setTimeout(fixAutofillBackground, 50);
      };
      const handleBlur = () => fixAutofillBackground();
      const handleInput = () => fixAutofillBackground();
      const handleClick = () => fixAutofillBackground();
      const handleKeyDown = () => fixAutofillBackground();

      inputs.forEach((input) => {
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleBlur);
        input.addEventListener('input', handleInput);
        input.addEventListener('click', handleClick);
        input.addEventListener('keydown', handleKeyDown);
      });

      return () => {
        clearInterval(interval);
        observers.forEach((observer) => observer.disconnect());
        inputs.forEach((input) => {
          input.removeEventListener('focus', handleFocus);
          input.removeEventListener('blur', handleBlur);
          input.removeEventListener('input', handleInput);
          input.removeEventListener('click', handleClick);
          input.removeEventListener('keydown', handleKeyDown);
        });
      };
    }
  }, [showForm]);

  return (
    <section className="gmail-section">
      <div className="gmail-frame-wrap">
        <video 
          className="gmail-video" 
          src={GmailVideo} 
          autoPlay 
          muted 
          loop 
          playsInline 
          onClick={handleVideoClick}
        />
      </div>
      
      {showForm && (
        <div className="email-form-overlay">
          <div className="email-form-container">
            <button className="email-form-close" onClick={handleClose}>×</button>
            <form onSubmit={handleSubmit} className="email-form">
              <h3 className="email-form-title">Get in Touch</h3>
              <div className="email-form-field">
                <label htmlFor="name">Name</label>
                <div className="email-form-field-input-wrapper">
                  <input
                    ref={nameInputRef}
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    autoComplete="name"
                    data-lpignore="true"
                    data-form-type="other"
                    style={{
                      backgroundColor: 'transparent',
                      background: 'transparent',
                      WebkitBoxShadow: 'none',
                      boxShadow: 'none',
                    }}
                  />
                </div>
              </div>
              <div className="email-form-field">
                <label htmlFor="email">Email</label>
                <div className="email-form-field-input-wrapper">
                  <input
                    ref={emailInputRef}
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    autoComplete="email"
                    data-lpignore="true"
                    data-form-type="other"
                    style={{
                      backgroundColor: 'transparent',
                      background: 'transparent',
                      WebkitBoxShadow: 'none',
                      boxShadow: 'none',
                    }}
                  />
                </div>
              </div>
              {submitMessage && (
                <div className="email-form-message">
                  {submitMessage}
                </div>
              )}
              <button type="submit" className="email-form-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default GmailSection;


