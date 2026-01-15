import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Features.css';

const Features: React.FC = () => {
  const navigate = useNavigate();
  const [callVolume, setCallVolume] = useState(10000);
  const [callDuration, setCallDuration] = useState(8);
  const [agentCost, setAgentCost] = useState(28);
  const [unmutedVideo, setUnmutedVideo] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const videos = [
    { id: 1, video: '/v1.mp4', title: 'Customer Support Voice Agent' },
    { id: 2, video: '/v2.mp4', title: 'Real Estate Voice Agent' },
    { id: 3, video: '/v3.mp4', title: 'Sales Voice Agent' },
    { id: 4, video: '/v4.mp4', title: 'Marketing Voice Agent' }
  ];

  // Autoplay all videos when component mounts
  useEffect(() => {
    const playVideos = () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.muted = true;
          video.loop = true;
          video.play().catch((error) => {
            console.log('Autoplay prevented:', error);
          });
        }
      });
    };

    playVideos();

    const cleanupFunctions: (() => void)[] = [];
    
    videoRefs.current.forEach((video) => {
      if (video) {
        const handleLoadedData = () => {
          if (video.paused) {
            video.muted = true;
            video.play().catch(() => {});
          }
        };
        
        const handlePause = () => {
          if (!video.ended) {
            video.play().catch(() => {});
          }
        };
        
        const handleEnded = () => {
          video.currentTime = 0;
          video.play().catch(() => {});
        };
        
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        
        cleanupFunctions.push(() => {
          video.removeEventListener('loadeddata', handleLoadedData);
          video.removeEventListener('pause', handlePause);
          video.removeEventListener('ended', handleEnded);
        });
      }
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);

  const handleVideoClick = (id: number) => {
    const video = videoRefs.current[id - 1];
    if (!video) return;

    if (unmutedVideo === id) {
      video.muted = true;
      setUnmutedVideo(null);
    } else {
      videoRefs.current.forEach((v, index) => {
        if (v && index !== id - 1) {
          v.muted = true;
          if (v.paused) {
            v.play().catch(() => {});
          }
        }
      });
      video.muted = false;
      if (video.paused) {
        video.play().catch((error) => {
          console.log('Play error:', error);
        });
      }
      setUnmutedVideo(id);
    }
  };

  const handleCallVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCallVolume(Number(e.target.value));
  };

  const handleCallDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCallDuration(Number(e.target.value));
  };

  const handleAgentCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgentCost(Number(e.target.value));
  };

  // Calculate time and cost savings for detailed calculator
  const totalHours = Math.round((callVolume * callDuration) / 60);
  const currentCost = Math.round(totalHours * agentCost);
  const hoursSaved = totalHours;
  const costReduction = Math.round(currentCost * 0.7);
  const automationPercent = 100;

  return (
    <div className="features-page">
      {/* Features Image - positioned at top behind navbar */}
      <div className="features-image-container">
        <img 
          src="/images/features.png" 
          alt="Features" 
          className="features-image"
        />
      </div>
      
      <div className="features-page-container">
        {/* Voice Agents Section */}
        <section className="voice-agents-section">
          <h1 className="voice-agents-heading">Voice Agents for your Business</h1>
          
          {/* Page Description */}
          <div className="features-description">
            <p className="features-tagline">
              Transform your customer interactions with AI-powered voice agents
            </p>
            <p className="features-subtitle">
              Intelligent, empathetic, and always available to serve your customers 24/7
            </p>
          </div>
          
          {/* Horizontal Video Grid */}
          <div className="horizontal-videos-grid">
            {videos.map((video, index) => (
              <div key={video.id} className="horizontal-video-item">
                <div className="horizontal-video-wrapper">
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={video.video}
                    className="horizontal-video"
                    loop
                    autoPlay
                    muted
                    playsInline
                  />
                  <div
                    className={`horizontal-video-overlay ${unmutedVideo === video.id ? 'playing' : ''}`}
                    onClick={() => handleVideoClick(video.id)}
                  >
                    <div className={`equalizer-bars ${unmutedVideo === video.id ? 'playing' : ''}`}>
                      <div className="equalizer-bar"></div>
                      <div className="equalizer-bar"></div>
                      <div className="equalizer-bar"></div>
                      <div className="equalizer-bar"></div>
                      <div className="equalizer-bar"></div>
                    </div>
                  </div>
                </div>
                <h3 className="horizontal-video-title">{video.title}</h3>
              </div>
            ))}
          </div>

          {/* Custom Domain Message */}
          <div className="custom-domain-message">
            <p className="custom-domain-text">Didn't find your domain? Customise your own.</p>
            <button className="get-started-button" onClick={() => navigate('/waitlist')}>Get Started</button>
          </div>
          
          {/* Detailed Time & Cost Calculator */}
          <div className="detailed-calculator-section">
            <div className="calculator-panels">
              {/* BEFORE Panel */}
              <div className="calculator-panel before-panel">
                <div className="before-panel-content">
                  <div className="input-group">
                    <label className="input-label">Monthly call volume</label>
                    <div className="input-with-value">
                      <input
                        type="range"
                        min="1000"
                        max="100000"
                        step="1000"
                        value={callVolume}
                        onChange={handleCallVolumeChange}
                        className="panel-slider"
                      />
                      <span className="input-value">{callVolume.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Average call duration (min)</label>
                    <div className="input-with-value">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={callDuration}
                        onChange={handleCallDurationChange}
                        className="panel-slider"
                      />
                      <span className="input-value">{callDuration}</span>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Fully-loaded agent cost ($/hr)</label>
                    <div className="input-with-value">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="1"
                        value={agentCost}
                        onChange={handleAgentCostChange}
                        className="panel-slider"
                      />
                      <span className="input-value">${agentCost}</span>
                    </div>
                  </div>
                  <div className="summary-text-wrapper">
                    <button className="panel-badge before-badge">BEFORE</button>
                    <div className="summary-text">
                      Your team handles <strong>{callVolume.toLocaleString()}</strong> calls averaging <strong>{callDuration} min</strong> - that's <strong>{totalHours.toLocaleString()}</strong> hours / month at <strong>${agentCost}</strong>.
                    </div>
                  </div>
                </div>
              </div>

              {/* AFTER Panel */}
              <div className="calculator-panel after-panel">
                <div className="after-panel-content">
                  <h3 className="after-title">Time & cost you'll save each month</h3>
                  <div className="savings-metrics">
                    <div className="savings-metric">
                      <div className="metric-value">{hoursSaved.toLocaleString()}</div>
                      <div className="metric-label">hours saved</div>
                    </div>
                    <div className="savings-metric">
                      <div className="metric-value">${costReduction.toLocaleString()}</div>
                      <div className="metric-label">cost reduction</div>
                    </div>
                    <div className="savings-metric">
                      <div className="metric-value">{automationPercent}%</div>
                      <div className="metric-label">automation vs. current</div>
                    </div>
                  </div>
                  <div className="summary-text-wrapper">
                    <button className="panel-badge after-badge">AFTER</button>
                    <div className="summary-text after-summary">
                      With Lagentry automating <strong>{automationPercent}%</strong> of <strong>{callVolume.toLocaleString()}</strong> calls: agents handle <strong>0</strong> hours; total costs drop by <strong>${costReduction.toLocaleString()}</strong>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default Features;

