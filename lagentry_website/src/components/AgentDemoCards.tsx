import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentDemoCards.css';
import realVoiceDemo from '../realvoicedemo.mp3';
// Sales video path - file should be in public folder
// Use absolute path for Netlify deployment compatibility
const salesVideo = '/sales-agent-updated.mp4';
import agentBg from './agentbg2.png';
// Video paths - files should be in public folder
// Files are in: public/AICFO.MP4, public/HRvc.mp4, public/vim1.mp4, public/vim2.mp4, public/Healthcare-agent.mp4
// Note: File is AICFO.MP4 (uppercase) - Netlify is case-sensitive
// Use absolute paths for Netlify deployment compatibility
// Try both cases for compatibility
const aiCFOVideo = '/AICFO.MP4';
const hrVideo = '/HRvc.mp4';
const healthcareVideo = '/Healthcare-agent.mp4';
const realEstateVideo = '/real.mp4';

interface AgentCard {
  id: string;
  name: string;
  description: string;
  video: string;
  color: string;
  features: string[];
}

const agents: AgentCard[] = [
  {
    id: 'agent-1',
    name: 'Sales/GTM Agent',
    description: 'Your AI-powered revenue machine and intelligent meeting scheduler. The Sales & Meeting Agent not only qualifies leads, nurtures them, and drives conversions — it also books meetings, manages calendars, handles follow-ups, and ensures no lead slips through the cracks. With voice calling and dynamic scheduling, it becomes your hardest-working SDR + coordinator — all in one.',
    video: salesVideo,
    color: '#8B5CF6',
    features: [
      'Intelligent lead qualification & scoring',
      'Automated sales pipeline management',
      'Prospect research & deep profiling',
      'Customer engagement automation',
      'Meeting-Agent & calendar scheduling',
      'Real-time sales analytics & insights',
      'Voice Calling + Voice Cloning Sales & Meeting Agent'
    ]
  },
  {
    id: 'agent-2',
    name: 'HR Agent',
    description: 'The AI HR Agent streamlines HR operations from recruitment to employee lifecycle — combining administrative automation with human-like engagement. Now enhanced with an AI Interviewer — it can conduct preliminary candidate interviews, ask questions, record responses, and rank candidates based on criteria — saving time and improving hiring quality. With voice-cloning and intelligent workflows, it becomes the HR assistant every organization needs.',
    video: '/vim2.mp4',
    color: '#C084FC',
    features: [
      'Automated recruitment workflows',
      'AI Interviewer + candidate screening calls',
      'Employee onboarding automation',
      'Performance review management',
      'HR analytics & insights',
      'Policy & support assistance',
      'Voice Calling + Voice Cloning HR Agent'
    ]
  },
  {
    id: 'agent-3',
    name: 'Real Estate Agent',
    description: 'The AI Real Estate Agent reshapes everything from tenant experience to asset management. It handles listings, screenings, communications, maintenance, and market intelligence with precision. With built-in voice calling and voice-cloning, it engages tenants, owners, and vendors like a real human relationship manager — only faster and more reliable.',
    video: realEstateVideo,
    color: '#A78BFA',
    features: [
      'Property listing automation',
      'AI-powered tenant screening',
      'Smart maintenance management',
      'Market intelligence & pricing insights',
      'Owner & tenant communication automation',
      'Voice Calling + Voice Cloning Real Estate Agent'
    ]
  },
  {
    id: 'agent-4',
    name: 'AI Healthcare Agent',
    description: 'Your 24/7 AI Health Hub — Smart, Caring, Always Ready. The AI Healthcare Agent transforms your clinic or medical-service offering into a round-the-clock intelligent care center. It handles patient intake, triage, appointment scheduling, follow-ups, reminders, and basic diagnostics support — all with the empathy and efficiency of a seasoned healthcare professional, but at AI-speed and scale. With multilingual voice calling, voice cloning, secure data handling and seamless workflows, it becomes the healthcare assistant every modern practice needs.',
    video: healthcareVideo,
    color: '#9333EA',
    features: [
      'Automated patient intake & triage',
      'Appointment scheduling & calendar management',
      'Prescription & follow-up reminders',
      'Patient record management & secure data logging',
      'Basic symptom-to-advice logic (non-diagnostic)',
      'Billing & insurance pre-check workflows',
      'Analytics & patient-care insights',
      'Voice Calling + Voice Cloning Healthcare Agent',
      'Privacy-first & compliance-ready'
    ]
  }
];

// AI CFO Agent content
const aiCFOContent = {
  title: 'AI CFO Agent',
  tagline: 'The AI CFO Agent transforms your finance department into a fully automated intelligence engine. It analyses, forecasts, warns, explains, and communicates like a seasoned chief financial officer — but faster, sharper, and available 24/7. With multilingual voice calling, natural voice cloning, and deep financial reasoning, it becomes the strategic partner every business dreams of but few can afford.',
  features: [
    'Automated financial reporting & in-depth variance analysis',
    'Real-time insights that surface trends, anomalies, risks, and hidden opportunities',
    'Budget planning & cash-flow forecasting automation',
    'Approve, reject, route, and audit transactions with enterprise-grade logic',
    'AI-powered financial dashboards',
    'Live reporting that tells you why metrics changed, not just what changed'
  ]
};

const AgentDemoCards: React.FC = () => {
  const navigate = useNavigate();

  const [playingCards, setPlayingCards] = useState<{ [key: string]: boolean }>({});
  const [mutedCards, setMutedCards] = useState<{ [key: string]: boolean }>({});
  const [isVisible, setIsVisible] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<{ [key: string]: boolean }>({});
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const aiCFOVideoRef = useRef<HTMLVideoElement | null>(null);
  const aiCFORetryCountRef = useRef<number>(0);

  const handleMoreAbout = (cardType: 'cfo' | 'agent', id: string) => {
    if (cardType === 'cfo') {
      navigate('/agents/cfo-finance');
      return;
    }

    switch (id) {
      case 'agent-1':
        navigate('/agents/gtm-sales');
        break;
      case 'agent-2':
        navigate('/agents/hr-recruitment');
        break;
      case 'agent-3':
        navigate('/agents/real-estate');
        break;
      case 'agent-4':
        navigate('/agents/healthcare');
        break;
      default:
        navigate('/agents');
    }
  };

  useEffect(() => {
    // Set intro as complete immediately so all sections show
    setIsIntroComplete(true);
  }, []);

  useEffect(() => {
    // Always observe for intersection
    if (!isIntroComplete) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isIntroComplete]);

  // Autoplay videos when they come into view
  useEffect(() => {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const cardId = video.dataset.cardId || (video === aiCFOVideoRef.current ? 'ai-cfo-agent' : '');
          if (entry.isIntersecting) {
            video.play().catch((error) => {
              // Only log if it's not a common browser restriction error
              if (error.name !== 'NotAllowedError' && error.name !== 'NotSupportedError') {
                console.warn('Video autoplay prevented:', error.name);
              }
            });
            setPlayingCards(prev => ({ ...prev, [cardId]: true }));
          } else {
            video.pause();
            setPlayingCards(prev => ({ ...prev, [cardId]: false }));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        videoObserver.observe(video);
      }
    });

    if (aiCFOVideoRef.current) {
      videoObserver.observe(aiCFOVideoRef.current);
    }

    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) {
          videoObserver.unobserve(video);
        }
      });
      if (aiCFOVideoRef.current) {
        videoObserver.unobserve(aiCFOVideoRef.current);
      }
    };
  }, [isVisible]);

  const handlePlay = (cardId: string) => {
    if (cardId === 'agent-2') {
      const audio = audioRefs.current[cardId];
      if (audio) {
        if (audio.paused) {
          Object.keys(audioRefs.current).forEach((key) => {
            if (key !== cardId && audioRefs.current[key]) {
              audioRefs.current[key]?.pause();
              setAudioPlaying(prev => ({ ...prev, [key]: false }));
            }
          });
          audio.play().then(() => {
            setAudioPlaying(prev => ({ ...prev, [cardId]: true }));
          }).catch((error) => {
            console.error('Error playing audio:', error);
          });
        } else {
          audio.pause();
          setAudioPlaying(prev => ({ ...prev, [cardId]: false }));
        }
      }
    }
  };

  const handleMute = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current[cardId];
    if (video) {
      video.muted = !video.muted;
      setMutedCards(prev => ({ ...prev, [cardId]: video.muted }));
    }
  };

  // All cards array in order: Sales (1), HR (2), Real Estate (3), CFO (4), Healthcare (5)
  const allCards = [
    { type: 'agent', data: agents[0] }, // Sales/GTM
    { type: 'agent', data: agents[1] }, // HR
    { type: 'agent', data: agents[2] }, // Real Estate
    { type: 'cfo', data: aiCFOContent }, // CFO/Finance
    { type: 'agent', data: agents[3] }  // Healthcare
  ];

  return (
    <div className="agent-demo-section" ref={sectionRef}>
      <div className="agent-demo-container">
        <div className="agent-demo-header">
          <h2 className="agent-demo-title gradient-purple-text">
            Meet our AI Employees
          </h2>
          <p className="agent-demo-subtitle">
            Experience the power of intelligent automation across all domains
          </p>
        </div>

        <div className="agent-cards-stack">
          {allCards.map((card, index) => {
            // 0 = visual left, content right; 1 = content left, visual right; 2 = visual left, etc.
            const isVisualLeft = index % 2 === 0;

            if (card.type === 'cfo') {
              const isPlaying = playingCards['ai-cfo-agent'] || false;
              return (
                <div
                  key="ai-cfo-agent"
                  className="agent-card-stacked cfo-card layout-right-visual"
                  style={{ backgroundImage: `url(${agentBg})` }}
                >
                  <div className="agent-card-inner-stacked">
                    {false ? (
                      <>
                        {/* Visual on left */}
                        <div className="agent-visual-panel-stacked">
                          <div className="agent-video-container cfo-video-container">
                            <video
                              ref={aiCFOVideoRef}
                              className="agent-video cfo-video"
                              src={aiCFOVideo}
                              muted={true}
                              loop={true}
                              autoPlay
                              playsInline
                              preload="auto"
                              crossOrigin="anonymous"
                              style={{ display: 'block', opacity: 1 }}
                              onCanPlay={(e) => {
                                const video = e.currentTarget;
                                console.log('AICFO video can play - ready to play');
                                video.style.display = 'block';
                                video.style.opacity = '1';
                              }}
                              onLoadedData={(e) => {
                                const video = e.currentTarget;
                                console.log('AICFO video data loaded successfully');
                                video.style.display = 'block';
                              }}
                              onPlay={() => setPlayingCards(prev => ({ ...prev, 'ai-cfo-agent': true }))}
                              onPause={() => setPlayingCards(prev => ({ ...prev, 'ai-cfo-agent': false }))}
                              onLoadedMetadata={(e) => {
                                const video = e.currentTarget;
                                if (video) {
                                  video.style.display = 'block';
                                  video.style.opacity = '1';
                                }
                              }}
                              onError={(e) => {
                                const video = e.currentTarget;
                                if (video && video.error) {
                                  const errorCode = video.error.code;
                                  const errorMessage = video.error.message || 'Unknown error';

                                  // Check file size first - if it's too small, the file is corrupted
                                  fetch(video.src, { method: 'HEAD' })
                                    .then(response => {
                                      const contentLength = response.headers.get('Content-Length');
                                      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;

                                      console.error('AICFO Video Error Details:', {
                                        errorCode,
                                        errorMessage,
                                        videoSrc: video.src,
                                        fileSize: fileSize,
                                        fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
                                        networkState: video.networkState,
                                        readyState: video.readyState,
                                        canPlayType: video.canPlayType('video/mp4'),
                                        httpStatus: response.status,
                                        contentType: response.headers.get('Content-Type')
                                      });

                                      // If file size is suspiciously small (< 1KB), it's likely corrupted or wrong file
                                      if (fileSize < 1024) {
                                        console.error('CRITICAL: Video file is too small (' + fileSize + ' bytes). File is corrupted or not uploaded correctly.');
                                        console.error('Please verify AICFO.MP4 exists in public folder and is a valid video file.');

                                        // Try to reload the video with cache busting
                                        const cacheBuster = '?t=' + Date.now();
                                        const newSrc = video.src.split('?')[0] + cacheBuster;
                                        console.log('Attempting to reload with cache busting:', newSrc);
                                        video.src = newSrc;
                                        video.load();
                                        return;
                                      }

                                      // If file size is OK but still error, try different loading strategies
                                      if (errorCode === 4 && fileSize > 1024) {
                                        console.error('Video format issue. Attempting alternative loading methods...');

                                        // Strategy 1: Try loading as blob
                                        fetch(video.src)
                                          .then(res => {
                                            if (res.ok && res.headers.get('Content-Type')?.includes('video')) {
                                              return res.blob();
                                            }
                                            throw new Error('Invalid response');
                                          })
                                          .then(blob => {
                                            if (blob.size > 1024) {
                                              const blobUrl = URL.createObjectURL(blob);
                                              console.log('Loading video from blob URL');
                                              video.src = blobUrl;
                                              video.load();
                                            } else {
                                              throw new Error('Blob too small');
                                            }
                                          })
                                          .catch(err => {
                                            console.error('Blob loading failed:', err);
                                            // Fall back to retry with different path
                                            retryWithAlternatives(video);
                                          });
                                      } else {
                                        retryWithAlternatives(video);
                                      }
                                    })
                                    .catch(err => {
                                      console.error('Cannot check video file:', err);
                                      retryWithAlternatives(video);
                                    });

                                  const retryWithAlternatives = (videoElement: HTMLVideoElement) => {
                                    const alternatives = [
                                      '/AICFO.MP4',
                                      '/AICFO.mp4',
                                      '/AICFO.MP4?t=' + Date.now(),
                                      '/AICFO.mp4?t=' + Date.now(),
                                      `${window.location.origin}/AICFO.MP4`,
                                      `${window.location.origin}/AICFO.mp4`,
                                      `${window.location.origin}/AICFO.MP4?t=${Date.now()}`,
                                      `${window.location.origin}/AICFO.mp4?t=${Date.now()}`
                                    ];
                                    let currentIndex = 0;
                                    const maxRetries = alternatives.length;

                                    const tryNext = () => {
                                      if (currentIndex < maxRetries && videoElement.error) {
                                        const newSrc = alternatives[currentIndex];
                                        const currentSrc = videoElement.src.split('?')[0].replace(window.location.origin, '');
                                        const newSrcPath = newSrc.split('?')[0].replace(window.location.origin, '');

                                        if (currentSrc !== newSrcPath) {
                                          console.log(`Retry ${currentIndex + 1}/${maxRetries}: Trying path: ${newSrc}`);
                                          videoElement.src = newSrc;
                                          videoElement.load();
                                        }
                                        currentIndex++;

                                        // Wait a bit before next retry
                                        if (currentIndex < maxRetries) {
                                          setTimeout(() => {
                                            if (videoElement.error) {
                                              tryNext();
                                            }
                                          }, 500);
                                        }
                                      } else if (videoElement.error) {
                                        console.error('All AICFO video loading attempts failed.');
                                        console.error('Final video src:', videoElement.src);
                                        console.error('Error code:', videoElement.error.code);

                                        // Show placeholder but keep trying in background
                                        videoElement.style.display = 'none';
                                        const container = videoElement.parentElement;
                                        if (container && !container.querySelector('.video-error-placeholder')) {
                                          const placeholder = document.createElement('div');
                                          placeholder.className = 'video-error-placeholder';
                                          placeholder.textContent = 'Loading video...';
                                          placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #1a1a1a; color: #888; font-size: 14px;';
                                          container.appendChild(placeholder);

                                          // Keep trying periodically
                                          const retryInterval = setInterval(() => {
                                            if (!videoElement.error) {
                                              clearInterval(retryInterval);
                                              placeholder.remove();
                                              videoElement.style.display = 'block';
                                            } else {
                                              console.log('Retrying video load...');
                                              videoElement.src = '/AICFO.MP4?retry=' + Date.now();
                                              videoElement.load();
                                            }
                                          }, 5000);
                                        }
                                      }
                                    };

                                    videoElement.addEventListener('error', tryNext, { once: true });
                                    setTimeout(tryNext, 100);
                                  };
                                }
                              }}
                            />
                          </div>
                        </div>
                        {/* Content on right */}
                        <div className="agent-content-panel-stacked">
                          <h2 className="agent-card-name">{aiCFOContent.title}</h2>
                          <p className="agent-card-description">{aiCFOContent.tagline}</p>
                          <div className="agent-features cfo-features">
                            {aiCFOContent.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="agent-feature-item cfo-feature-item">
                                <span className="agent-feature-text cfo-feature-text">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            className="agent-more-about-button"
                            onClick={() => handleMoreAbout('cfo', 'ai-cfo')}
                          >
                            More About {aiCFOContent.title}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Content on left */}
                        <div className="agent-content-panel-stacked">
                          <h2 className="agent-card-name">{aiCFOContent.title}</h2>
                          <p className="agent-card-description">{aiCFOContent.tagline}</p>
                          <div className="agent-features cfo-features">
                            {aiCFOContent.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="agent-feature-item cfo-feature-item">
                                <span className="agent-feature-text cfo-feature-text">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            className="agent-more-about-button"
                            onClick={() => handleMoreAbout('cfo', 'ai-cfo')}
                          >
                            More About {aiCFOContent.title}
                          </button>
                        </div>
                        {/* Visual on right */}
                        <div className="agent-visual-panel-stacked">
                          <div className="agent-video-container cfo-video-container">
                            <video
                              ref={aiCFOVideoRef}
                              className="agent-video cfo-video"
                              src={aiCFOVideo}
                              muted={true}
                              loop={true}
                              autoPlay
                              playsInline
                              preload="auto"
                              crossOrigin="anonymous"
                              style={{ display: 'block', opacity: 1 }}
                              onCanPlay={(e) => {
                                const video = e.currentTarget;
                                console.log('AICFO video can play - ready to play');
                                video.style.display = 'block';
                                video.style.opacity = '1';
                              }}
                              onLoadedData={(e) => {
                                const video = e.currentTarget;
                                console.log('AICFO video data loaded successfully');
                                video.style.display = 'block';
                              }}
                              onPlay={() => setPlayingCards(prev => ({ ...prev, 'ai-cfo-agent': true }))}
                              onPause={() => setPlayingCards(prev => ({ ...prev, 'ai-cfo-agent': false }))}
                              onLoadedMetadata={(e) => {
                                const video = e.currentTarget;
                                if (video) {
                                  video.style.display = 'block';
                                  video.style.opacity = '1';
                                }
                              }}
                              onError={(e) => {
                                const video = e.currentTarget;
                                if (video && video.error) {
                                  const errorCode = video.error.code;
                                  const errorMessage = video.error.message || 'Unknown error';

                                  // Check file size first - if it's too small, the file is corrupted
                                  fetch(video.src, { method: 'HEAD' })
                                    .then(response => {
                                      const contentLength = response.headers.get('Content-Length');
                                      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;

                                      console.error('AICFO Video Error Details:', {
                                        errorCode,
                                        errorMessage,
                                        videoSrc: video.src,
                                        fileSize: fileSize,
                                        fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
                                        networkState: video.networkState,
                                        readyState: video.readyState,
                                        canPlayType: video.canPlayType('video/mp4'),
                                        httpStatus: response.status,
                                        contentType: response.headers.get('Content-Type')
                                      });

                                      // If file size is suspiciously small (< 1KB), it's likely corrupted or wrong file
                                      if (fileSize < 1024) {
                                        console.error('CRITICAL: Video file is too small (' + fileSize + ' bytes). File is corrupted or not uploaded correctly.');
                                        console.error('Please verify AICFO.MP4 exists in public folder and is a valid video file.');

                                        // Try to reload the video with cache busting
                                        const cacheBuster = '?t=' + Date.now();
                                        const newSrc = video.src.split('?')[0] + cacheBuster;
                                        console.log('Attempting to reload with cache busting:', newSrc);
                                        video.src = newSrc;
                                        video.load();
                                        return;
                                      }

                                      // If file size is OK but still error, try different loading strategies
                                      if (errorCode === 4 && fileSize > 1024) {
                                        console.error('Video format issue. Attempting alternative loading methods...');

                                        // Strategy 1: Try loading as blob
                                        fetch(video.src)
                                          .then(res => {
                                            if (res.ok && res.headers.get('Content-Type')?.includes('video')) {
                                              return res.blob();
                                            }
                                            throw new Error('Invalid response');
                                          })
                                          .then(blob => {
                                            if (blob.size > 1024) {
                                              const blobUrl = URL.createObjectURL(blob);
                                              console.log('Loading video from blob URL');
                                              video.src = blobUrl;
                                              video.load();
                                            } else {
                                              throw new Error('Blob too small');
                                            }
                                          })
                                          .catch(err => {
                                            console.error('Blob loading failed:', err);
                                            // Fall back to retry with different path
                                            retryWithAlternatives(video);
                                          });
                                      } else {
                                        retryWithAlternatives(video);
                                      }
                                    })
                                    .catch(err => {
                                      console.error('Cannot check video file:', err);
                                      retryWithAlternatives(video);
                                    });

                                  const retryWithAlternatives = (videoElement: HTMLVideoElement) => {
                                    const alternatives = [
                                      '/AICFO.MP4',
                                      '/AICFO.mp4',
                                      '/AICFO.MP4?t=' + Date.now(),
                                      '/AICFO.mp4?t=' + Date.now(),
                                      `${window.location.origin}/AICFO.MP4`,
                                      `${window.location.origin}/AICFO.mp4`,
                                      `${window.location.origin}/AICFO.MP4?t=${Date.now()}`,
                                      `${window.location.origin}/AICFO.mp4?t=${Date.now()}`
                                    ];
                                    let currentIndex = 0;
                                    const maxRetries = alternatives.length;

                                    const tryNext = () => {
                                      if (currentIndex < maxRetries && videoElement.error) {
                                        const newSrc = alternatives[currentIndex];
                                        const currentSrc = videoElement.src.split('?')[0].replace(window.location.origin, '');
                                        const newSrcPath = newSrc.split('?')[0].replace(window.location.origin, '');

                                        if (currentSrc !== newSrcPath) {
                                          console.log(`Retry ${currentIndex + 1}/${maxRetries}: Trying path: ${newSrc}`);
                                          videoElement.src = newSrc;
                                          videoElement.load();
                                        }
                                        currentIndex++;

                                        // Wait a bit before next retry
                                        if (currentIndex < maxRetries) {
                                          setTimeout(() => {
                                            if (videoElement.error) {
                                              tryNext();
                                            }
                                          }, 500);
                                        }
                                      } else if (videoElement.error) {
                                        console.error('All AICFO video loading attempts failed.');
                                        console.error('Final video src:', videoElement.src);
                                        console.error('Error code:', videoElement.error.code);

                                        // Show placeholder but keep trying in background
                                        videoElement.style.display = 'none';
                                        const container = videoElement.parentElement;
                                        if (container && !container.querySelector('.video-error-placeholder')) {
                                          const placeholder = document.createElement('div');
                                          placeholder.className = 'video-error-placeholder';
                                          placeholder.textContent = 'Loading video...';
                                          placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #1a1a1a; color: #888; font-size: 14px;';
                                          container.appendChild(placeholder);

                                          // Keep trying periodically
                                          const retryInterval = setInterval(() => {
                                            if (!videoElement.error) {
                                              clearInterval(retryInterval);
                                              placeholder.remove();
                                              videoElement.style.display = 'block';
                                            } else {
                                              console.log('Retrying video load...');
                                              videoElement.src = '/AICFO.MP4?retry=' + Date.now();
                                              videoElement.load();
                                            }
                                          }, 5000);
                                        }
                                      }
                                    };

                                    videoElement.addEventListener('error', tryNext, { once: true });
                                    setTimeout(tryNext, 100);
                                  };
                                }
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            } else {
              const agent = card.data as AgentCard;
              const isPlaying = playingCards[agent.id] || false;

              // Layout: Sales (agent-1), Real Estate (agent-3), and Healthcare (agent-4) have video on left, text on right
              // HR (agent-2) has video on right, text on left
              const isVideoRight = agent.id === 'agent-2';

              return (
                <div
                  key={agent.id}
                  className={`agent-card-stacked ${isVideoRight ? 'layout-right-visual' : 'layout-left-visual'} ${agent.id === 'agent-2' ? 'sales-card' : ''
                    }`}
                  style={{ backgroundImage: `url(${agentBg})` }}
                >
                  <div className="agent-card-inner-stacked">
                    {!isVideoRight ? (
                      <>
                        {/* Visual on left */}
                        <div className="agent-visual-panel-stacked">
                          <div className="agent-video-container">
                            <video
                              ref={(el) => {
                                videoRefs.current[agent.id] = el;
                                if (el) {
                                  el.dataset.cardId = agent.id;
                                }
                              }}
                              className={`agent-video ${agent.id === 'agent-1'
                                ? 'sales-video'
                                : agent.id === 'agent-2'
                                  ? 'hr-video'
                                  : ''
                                }`}
                              src={agent.video}
                              muted={mutedCards[agent.id] !== undefined ? mutedCards[agent.id] : true}
                              loop={true}
                              autoPlay
                              playsInline
                              preload="metadata"
                              onPlay={() => setPlayingCards(prev => ({ ...prev, [agent.id]: true }))}
                              onPause={() => setPlayingCards(prev => ({ ...prev, [agent.id]: false }))}
                              onLoadedMetadata={(e) => {
                                const video = e.currentTarget;
                                if (video) {
                                  video.style.display = 'block';
                                  video.style.opacity = '1';
                                }
                              }}
                              onCanPlay={(e) => {
                                const video = e.currentTarget;
                                video.style.display = 'block';
                                video.style.opacity = '1';
                                console.log(`Video can play for ${agent.id}:`, video.src);
                              }}
                              onError={(e) => {
                                const video = e.currentTarget;
                                console.error(`Video error for ${agent.id}:`, {
                                  src: video.src,
                                  error: video.error,
                                  networkState: video.networkState,
                                  readyState: video.readyState
                                });
                                // Try alternative paths
                                if (agent.id === 'agent-1' && video.src.includes('sales-agent-updated')) {
                                  video.src = '/sales.mp4';
                                  video.load();
                                } else if (agent.id === 'agent-3' && video.src.includes('real')) {
                                  // Try multiple alternative paths for real estate video
                                  const alternatives = [
                                    '/real.mp4',
                                    '/videos/real.mp4',
                                    '/real-estate-updated.mp4',
                                    '/videos/real-estate-updated.mp4'
                                  ];
                                  const currentSrc = video.src;
                                  const currentIndex = alternatives.findIndex(alt => currentSrc.includes(alt.split('/').pop() || ''));
                                  if (currentIndex < alternatives.length - 1) {
                                    video.src = alternatives[currentIndex + 1];
                                    video.load();
                                  } else {
                                    // Try first alternative if none matched
                                    video.src = alternatives[0];
                                    video.load();
                                  }
                                } else if (agent.id === 'agent-4' && video.src.includes('Healthcare')) {
                                  video.src = '/healthcare-agent.mp4';
                                  video.load();
                                }
                              }}
                            />
                          </div>
                        </div>
                        {/* Content on right */}
                        <div className="agent-content-panel-stacked">
                          <h3 className="agent-card-name">{agent.name}</h3>
                          <p className="agent-card-description">{agent.description}</p>
                          <div className="agent-features">
                            {agent.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="agent-feature-item">
                                <span className="agent-feature-text">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            className="agent-more-about-button"
                            onClick={() => handleMoreAbout('agent', agent.id)}
                          >
                            More About {agent.name}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Content on left */}
                        <div className="agent-content-panel-stacked">
                          <h3 className="agent-card-name">{agent.name}</h3>
                          <p className="agent-card-description">{agent.description}</p>
                          <div className="agent-features">
                            {agent.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="agent-feature-item">
                                <span className="agent-feature-text">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            className="agent-more-about-button"
                            onClick={() => handleMoreAbout('agent', agent.id)}
                          >
                            More About {agent.name}
                          </button>
                        </div>
                        {/* Visual on right */}
                        <div className="agent-visual-panel-stacked">
                          <div className="agent-video-container">
                            <video
                              ref={(el) => {
                                videoRefs.current[agent.id] = el;
                                if (el) {
                                  el.dataset.cardId = agent.id;
                                }
                              }}
                              className="agent-video"
                              src={agent.video}
                              muted={mutedCards[agent.id] !== undefined ? mutedCards[agent.id] : true}
                              loop={true}
                              autoPlay
                              playsInline
                              preload="metadata"
                              onPlay={() => setPlayingCards(prev => ({ ...prev, [agent.id]: true }))}
                              onPause={() => setPlayingCards(prev => ({ ...prev, [agent.id]: false }))}
                              onLoadedMetadata={(e) => {
                                const video = e.currentTarget;
                                if (video) {
                                  video.style.display = 'block';
                                  video.style.opacity = '1';
                                }
                              }}
                              onCanPlay={(e) => {
                                const video = e.currentTarget;
                                video.style.display = 'block';
                                video.style.opacity = '1';
                                console.log(`Video can play for ${agent.id}:`, video.src);
                              }}
                              onError={(e) => {
                                const video = e.currentTarget;
                                console.error(`Video error for ${agent.id}:`, {
                                  src: video.src,
                                  error: video.error,
                                  networkState: video.networkState,
                                  readyState: video.readyState
                                });
                                // Try alternative paths
                                if (agent.id === 'agent-1' && video.src.includes('sales-agent-updated')) {
                                  video.src = '/sales.mp4';
                                  video.load();
                                } else if (agent.id === 'agent-3' && video.src.includes('real')) {
                                  // Try multiple alternative paths for real estate video
                                  const alternatives = [
                                    '/real.mp4',
                                    '/videos/real.mp4',
                                    '/real-estate-updated.mp4',
                                    '/videos/real-estate-updated.mp4'
                                  ];
                                  const currentSrc = video.src;
                                  const currentIndex = alternatives.findIndex(alt => currentSrc.includes(alt.split('/').pop() || ''));
                                  if (currentIndex < alternatives.length - 1) {
                                    video.src = alternatives[currentIndex + 1];
                                    video.load();
                                  } else {
                                    // Try first alternative if none matched
                                    video.src = alternatives[0];
                                    video.load();
                                  }
                                } else if (agent.id === 'agent-4' && video.src.includes('Healthcare')) {
                                  video.src = '/healthcare-agent.mp4';
                                  video.load();
                                }
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default AgentDemoCards;
