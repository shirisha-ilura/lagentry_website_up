import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Features.css';

const Features: React.FC = () => {
  const navigate = useNavigate();
  const [callVolume, setCallVolume] = useState(10000);
  const [callDuration, setCallDuration] = useState(8);
  const [agentCost, setAgentCost] = useState(28);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Helper to get correct video path for Netlify deployment
  // Use absolute paths starting with / for better Netlify compatibility
  const getVideoPath = (videoName: string) => {
    // On Netlify, absolute paths work better than PUBLIC_URL
    // Use /videoName.mp4 format which works in both dev and production
    return `/${videoName}`;
  };

  const videos = [
    { id: 1, video: '/v1.mp4', title: 'Customer Support' },
    { id: 2, video: '/v2.mp4', title: 'Real Estate' },
    { id: 3, video: '/v3.mp4', title: 'Sales' },
    { id: 4, video: '/v4.mp4', title: 'Marketing' }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize videos - preload them, especially for mobile
  useEffect(() => {
    const initializeVideos = () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.muted = true;
          video.loop = true;
          video.preload = "auto"; // Preload videos for mobile
          // Force load on mobile devices
          if (window.innerWidth <= 768) {
            video.load(); // Explicitly trigger loading
          }
          // Reset to beginning when loaded
          video.addEventListener('loadeddata', () => {
            video.currentTime = 0;
          });
        }
      });
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeVideos();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleVideoClick = (id: number) => {
    const video = videoRefs.current[id - 1];
    if (!video) return;

    if (playingVideo === id) {
      // Pause the video
      video.pause();
      video.muted = true;
      setPlayingVideo(null);
    } else {
      // Pause all other videos and mute them
      videoRefs.current.forEach((v, index) => {
        if (v && index !== id - 1) {
          v.pause();
          v.muted = true;
        }
      });
      // Unmute and play the clicked video
      video.muted = false;
      video.play().catch((error) => {
        console.log('Play error:', error);
      });
      setPlayingVideo(id);
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
    <div 
      className="features-page"
      style={{
        backgroundImage: 'url(/images/features.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      
      <div className="features-page-container">
        {/* Voice Agents Section */}
        <section className="voice-agents-section">
          <h1 className="voice-agents-heading">Build the Future of Work with AI</h1>
          
          {/* Video Section Heading */}
          <h2 className="video-section-heading">Human-like voice agents that speak naturally, solve queries instantly, and work 24/7 to support your business.</h2>
          
          {/* Horizontal Video Grid - Moved to Hero Section */}
          <div className="horizontal-videos-grid hero-videos">
            {videos.map((video, index) => (
              <div key={video.id} className={`horizontal-video-item ${playingVideo === video.id ? 'video-playing' : ''}`}>
                <div className="horizontal-video-wrapper">
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={video.video}
                    className="horizontal-video"
                    loop
                    muted
                    playsInline
                    preload="auto"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error(`Video ${video.id} (${video.video}) loading error:`, e);
                      const videoElement = e.currentTarget;
                      if (videoElement && videoElement.error) {
                        console.error('Video src:', videoElement.src);
                        console.error('Video error code:', videoElement.error.code);
                        console.error('Video error message:', videoElement.error.message);
                        // Try alternative paths with different cases and formats
                        const videoName = `v${video.id}`;
                        const alternatives = [
                          `/${videoName}.mp4`,  // Try absolute path first (best for Netlify)
                          `/${videoName}.MP4`,  // Try uppercase extension
                          `${window.location.origin}/${videoName}.mp4`  // Try full URL
                        ];
                        let currentIndex = 0;
                        const tryNext = () => {
                          if (currentIndex < alternatives.length && videoElement.error) {
                            const newSrc = alternatives[currentIndex];
                            // Check if src is different (handle both relative and absolute URLs)
                            const currentSrc = videoElement.src.replace(window.location.origin, '');
                            if (currentSrc !== newSrc && !videoElement.src.includes(newSrc)) {
                              console.log(`Trying alternative path: ${newSrc}`);
                              videoElement.src = newSrc;
                              videoElement.load();
                            }
                            currentIndex++;
                          } else if (videoElement.error) {
                            console.error(`All paths failed for ${videoName}.mp4. Please ensure the file exists in public folder.`);
                            console.error('Tried paths:', alternatives);
                            console.error('Current video src:', videoElement.src);
                            // Hide video on persistent error but show a placeholder
                            videoElement.style.display = 'none';
                            const wrapper = videoElement.closest('.horizontal-video-wrapper');
                            if (wrapper && !wrapper.querySelector('.video-error-placeholder')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'video-error-placeholder';
                              placeholder.textContent = 'Video unavailable';
                              placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #1a1a1a; color: #888;';
                              wrapper.appendChild(placeholder);
                            }
                          }
                        };
                        videoElement.addEventListener('error', tryNext, { once: true });
                        tryNext();
                      }
                    }}
                    onLoadedMetadata={() => {
                      const videoElement = videoRefs.current[index];
                      if (videoElement) {
                        videoElement.style.display = 'block';
                      }
                    }}
                  />
                  <div
                    className={`horizontal-video-overlay ${playingVideo === video.id ? 'playing' : ''}`}
                    onClick={() => handleVideoClick(video.id)}
                  >
                    <div className="play-pause-icon">
                      {playingVideo === video.id ? (
                        <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="18" y="12" width="6" height="36" rx="2" fill="white"/>
                          <rect x="36" y="12" width="6" height="36" rx="2" fill="white"/>
                        </svg>
                      ) : (
                        <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 12L48 30L20 48V12Z" fill="white"/>
                        </svg>
                      )}
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

