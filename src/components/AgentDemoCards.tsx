import React, { useRef, useState, useEffect } from 'react';
import './AgentDemoCards.css';
import realVoiceDemo from '../realvoicedemo.mp3';
import salesVoice from '../Salesvoice.mp3';
import agentBg from './agentbg2.png';
import aiCFOVideo from '../AICFO.MP4';


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
    name: 'Real Estate Agent',
    description: 'Intelligent automation for your real estate workflows with advanced AI capabilities that streamline property management and boost productivity.',
    video: '/vim2.mp4',
    color: '#A78BFA',
    features: [
      'Property listing management',
      'Automated tenant screening',
      'Maintenance request handling',
      'Real estate market analytics'
    ]
  },
  {
    id: 'agent-2',
    name: 'AI Sales Agent',
    description: 'Revolutionary AI-powered sales automation that transforms customer interactions, streamlines sales processes, and drives revenue growth through intelligent automation.',
    video: '/vim1.mp4',
    color: '#8B5CF6',
    features: [
      'Intelligent lead qualification and scoring',
      'Automated sales pipeline management',
      'Customer engagement automation',
      'Real-time sales analytics and insights'
    ]
  },
  {
    id: 'agent-3',
    name: 'HR Agent',
    description: 'Streamline your human resources operations with intelligent automation that handles recruitment, employee management, and HR workflows efficiently.',
    video: '/images/Healthcare Agent.mp4',
    color: '#C084FC',
    features: [
      'Automated recruitment processes',
      'Employee onboarding automation',
      'Performance review management',
      'HR analytics and insights'
    ]
  }
];

// AI CFO Agent content
const aiCFOContent = {
  title: 'AI CFO Agent',
  tagline: 'Transform financial operations with intelligent automation.',
  features: [
    'Automated financial reporting and analysis',
    'Budget planning and forecasting automation',
    'Expense management and approval workflows',
    'Real-time financial insights and dashboards',
    'Invoice processing and accounts payable automation',
    'Compliance monitoring and risk assessment'
  ]
};

interface TypingState {
  title: string;
  description?: string;
  tagline?: string;
  features: string[];
  currentStep: 'title' | 'description' | 'features' | 'complete';
  featureIndex: number;
  isTyping: boolean;
}

const AgentDemoCards: React.FC = () => {
  const [playingCards, setPlayingCards] = useState<{ [key: string]: boolean }>({});
  const [mutedCards, setMutedCards] = useState<{ [key: string]: boolean }>({});
  const [isVisible, setIsVisible] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<{ [key: string]: boolean }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingStates, setTypingStates] = useState<{ [key: string]: TypingState }>({});
  const typingTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout[] }>({});
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const carouselRef = useRef<HTMLDivElement>(null);
  const aiCFOVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
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
  }, []);

  // Autoplay videos when they come into view
  useEffect(() => {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const cardId = video.dataset.cardId || (video === aiCFOVideoRef.current ? 'ai-cfo-agent' : '');
          if (entry.isIntersecting) {
            // Play video when it comes into view
            video.play().catch((error) => {
              console.error('Error autoplaying video:', error);
            });
            setPlayingCards(prev => ({ ...prev, [cardId]: true }));
          } else {
            // Pause video when it goes out of view
            video.pause();
            setPlayingCards(prev => ({ ...prev, [cardId]: false }));
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe all videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        videoObserver.observe(video);
      }
    });

    // Observe AI CFO video with a slight delay to ensure ref is set
    const observeAICFOVideo = () => {
      if (aiCFOVideoRef.current) {
        videoObserver.observe(aiCFOVideoRef.current);
      } else {
        // Retry after a short delay if ref is not ready
        setTimeout(observeAICFOVideo, 100);
      }
    };
    observeAICFOVideo();

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
    // For AI Agent 1, Agent 2, and Agent 3, play audio instead of video
    if (cardId === 'agent-1' || cardId === 'agent-2' || cardId === 'agent-3') {
      const audio = audioRefs.current[cardId];
      if (audio) {
        if (audio.paused) {
          // Pause other audio if playing
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
    } else {
      // For other agents, play video as before
      const video = videoRefs.current[cardId];
      if (video) {
        if (video.paused) {
          video.play().then(() => {
            setPlayingCards(prev => ({ ...prev, [cardId]: true }));
          }).catch((error) => {
            console.error('Error playing video:', error);
          });
        } else {
          video.pause();
          setPlayingCards(prev => ({ ...prev, [cardId]: false }));
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

  const handleVideoEnd = (cardId: string) => {
    setPlayingCards(prev => ({ ...prev, [cardId]: false }));
    const video = videoRefs.current[cardId];
    if (video) {
      video.currentTime = 0;
    }
  };

  // Initialize typing states for all agents
  useEffect(() => {
    const initialStates: { [key: string]: TypingState } = {};
    // Initialize AI CFO agent
    initialStates['ai-cfo-agent'] = {
      title: aiCFOContent.title,
      tagline: aiCFOContent.tagline,
      features: aiCFOContent.features,
      currentStep: 'complete',
      featureIndex: 0,
      isTyping: false
    };
    // Initialize other agents
    agents.forEach((agent) => {
      initialStates[agent.id] = {
        title: agent.name,
        description: agent.description,
        features: agent.features,
        currentStep: 'complete',
        featureIndex: 0,
        isTyping: false
      };
    });
    setTypingStates(initialStates);
  }, []);

  // Typing animation effect for active card
  useEffect(() => {
    // Clear all timeouts when component unmounts or index changes
    Object.values(typingTimeoutsRef.current).forEach(timeouts => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    });
    typingTimeoutsRef.current = {};

    // Handle AI CFO Agent (index 0)
    if (currentIndex === 0) {
      const timeouts: NodeJS.Timeout[] = [];
      typingTimeoutsRef.current['ai-cfo-agent'] = timeouts;

      // Initialize typing state for AI CFO
      setTypingStates(prev => ({
        ...prev,
        'ai-cfo-agent': {
          title: '',
          tagline: '',
          features: aiCFOContent.features.map(() => ''),
          currentStep: 'title',
          featureIndex: 0,
          isTyping: true
        }
      }));

      // Type title
      let titleIndex = 0;
      const typeTitle = () => {
        if (titleIndex < aiCFOContent.title.length) {
          setTypingStates(prev => ({
            ...prev,
            'ai-cfo-agent': {
              ...prev['ai-cfo-agent'],
              title: aiCFOContent.title.substring(0, titleIndex + 1)
            }
          }));
          titleIndex++;
          const timeout = setTimeout(typeTitle, 50);
          timeouts.push(timeout);
        } else {
          // Move to tagline
          setTypingStates(prev => ({
            ...prev,
            'ai-cfo-agent': {
              ...prev['ai-cfo-agent'],
              currentStep: 'description'
            }
          }));
          const timeout = setTimeout(typeTagline, 300);
          timeouts.push(timeout);
        }
      };

      // Type tagline
      let taglineIndex = 0;
      const typeTagline = () => {
        if (taglineIndex < aiCFOContent.tagline.length) {
          setTypingStates(prev => ({
            ...prev,
            'ai-cfo-agent': {
              ...prev['ai-cfo-agent'],
              tagline: aiCFOContent.tagline.substring(0, taglineIndex + 1)
            }
          }));
          taglineIndex++;
          const timeout = setTimeout(typeTagline, 20);
          timeouts.push(timeout);
        } else {
          // Move to features
          setTypingStates(prev => ({
            ...prev,
            'ai-cfo-agent': {
              ...prev['ai-cfo-agent'],
              currentStep: 'features',
              featureIndex: 0
            }
          }));
          const timeout = setTimeout(typeFirstFeature, 300);
          timeouts.push(timeout);
        }
      };

      // Type features one by one
      let currentFeatureIndex = 0;
      const typeFirstFeature = () => {
        if (currentFeatureIndex < aiCFOContent.features.length) {
          let featureTextIndex = 0;
          const typeFeature = () => {
            if (featureTextIndex < aiCFOContent.features[currentFeatureIndex].length) {
              setTypingStates(prev => ({
                ...prev,
                'ai-cfo-agent': {
                  ...prev['ai-cfo-agent'],
                  features: prev['ai-cfo-agent'].features.map((f, i) =>
                    i === currentFeatureIndex
                      ? aiCFOContent.features[currentFeatureIndex].substring(0, featureTextIndex + 1)
                      : f
                  )
                }
              }));
              featureTextIndex++;
              const timeout = setTimeout(typeFeature, 25);
              timeouts.push(timeout);
            } else {
              // Move to next feature
              currentFeatureIndex++;
              if (currentFeatureIndex < aiCFOContent.features.length) {
                setTypingStates(prev => ({
                  ...prev,
                  'ai-cfo-agent': {
                    ...prev['ai-cfo-agent'],
                    featureIndex: currentFeatureIndex
                  }
                }));
                const timeout = setTimeout(typeFirstFeature, 200);
                timeouts.push(timeout);
              } else {
                // All features typed, mark as complete
                setTypingStates(prev => ({
                  ...prev,
                  'ai-cfo-agent': {
                    ...prev['ai-cfo-agent'],
                    currentStep: 'complete',
                    isTyping: false
                  }
                }));
              }
            }
          };
          typeFeature();
        }
      };

      // Start typing after a brief delay
      const startTimeout = setTimeout(() => {
        typeTitle();
      }, 100);
      timeouts.push(startTimeout);
    } else {
      // Reset AI CFO typing state for inactive
      setTypingStates(prev => ({
        ...prev,
        'ai-cfo-agent': {
          title: aiCFOContent.title,
          tagline: aiCFOContent.tagline,
          features: aiCFOContent.features,
          currentStep: 'complete',
          featureIndex: 0,
          isTyping: false
        }
      }));
    }

    // Reset all typing states first - clear content for inactive cards
    agents.forEach((agent) => {
      const cardIndex = agents.indexOf(agent) + 1;
      if (currentIndex !== cardIndex) {
        setTypingStates(prev => ({
          ...prev,
          [agent.id]: {
            title: agent.name,
            description: agent.description,
            features: agent.features,
            currentStep: 'complete',
            featureIndex: 0,
            isTyping: false
          }
        }));
      }
    });

    // Handle agent cards (index 1, 2, 3)
    agents.forEach((agent, index) => {
      const cardIndex = index + 1;
      if (currentIndex === cardIndex) {
        const timeouts: NodeJS.Timeout[] = [];
        typingTimeoutsRef.current[agent.id] = timeouts;

        // Initialize typing state for this agent
        setTypingStates(prev => ({
          ...prev,
          [agent.id]: {
            title: '',
            description: '',
            features: agent.features.map(() => ''),
            currentStep: 'title',
            featureIndex: 0,
            isTyping: true
          }
        }));

        // Type title
        let titleIndex = 0;
        const typeTitle = () => {
          if (titleIndex < agent.name.length) {
            setTypingStates(prev => {
              const current = prev[agent.id] || {
                title: '',
                description: '',
                features: agent.features.map(() => ''),
                currentStep: 'title' as const,
                featureIndex: 0,
                isTyping: true
              };
              return {
                ...prev,
                [agent.id]: {
                  ...current,
                  title: agent.name.substring(0, titleIndex + 1)
                }
              };
            });
            titleIndex++;
            const timeout = setTimeout(typeTitle, 50);
            timeouts.push(timeout);
          } else {
            // Move to description
            setTypingStates(prev => ({
              ...prev,
              [agent.id]: {
                ...prev[agent.id],
                currentStep: 'description'
              }
            }));
            const timeout = setTimeout(typeDescription, 300);
            timeouts.push(timeout);
          }
        };

        // Type description
        let descIndex = 0;
        const typeDescription = () => {
          if (descIndex < agent.description.length) {
            setTypingStates(prev => {
              const current = prev[agent.id] || {
                title: agent.name,
                description: '',
                features: agent.features.map(() => ''),
                currentStep: 'description' as const,
                featureIndex: 0,
                isTyping: true
              };
              return {
                ...prev,
                [agent.id]: {
                  ...current,
                  description: agent.description.substring(0, descIndex + 1)
                }
              };
            });
            descIndex++;
            const timeout = setTimeout(typeDescription, 20);
            timeouts.push(timeout);
          } else {
            // Move to features
            setTypingStates(prev => ({
              ...prev,
              [agent.id]: {
                ...prev[agent.id],
                currentStep: 'features',
                featureIndex: 0
              }
            }));
            const timeout = setTimeout(typeFirstFeature, 300);
            timeouts.push(timeout);
          }
        };

        // Type features one by one
        let currentFeatureIndex = 0;
        const typeFirstFeature = () => {
          if (currentFeatureIndex < agent.features.length) {
            let featureTextIndex = 0;
            const typeFeature = () => {
              if (featureTextIndex < agent.features[currentFeatureIndex].length) {
                setTypingStates(prev => ({
                  ...prev,
                  [agent.id]: {
                    ...prev[agent.id],
                    features: prev[agent.id].features.map((f, i) =>
                      i === currentFeatureIndex
                        ? agent.features[currentFeatureIndex].substring(0, featureTextIndex + 1)
                        : f
                    )
                  }
                }));
                featureTextIndex++;
                const timeout = setTimeout(typeFeature, 25);
                timeouts.push(timeout);
              } else {
                // Move to next feature
                currentFeatureIndex++;
                if (currentFeatureIndex < agent.features.length) {
                  setTypingStates(prev => ({
                    ...prev,
                    [agent.id]: {
                      ...prev[agent.id],
                      featureIndex: currentFeatureIndex
                    }
                  }));
                  const timeout = setTimeout(typeFirstFeature, 200);
                  timeouts.push(timeout);
                } else {
                  // All features typed, mark as complete
                  setTypingStates(prev => ({
                    ...prev,
                    [agent.id]: {
                      ...prev[agent.id],
                      currentStep: 'complete',
                      isTyping: false
                    }
                  }));
                }
              }
            };
            typeFeature();
          }
        };

        // Start typing after a brief delay to ensure state is set
        const startTimeout = setTimeout(() => {
          typeTitle();
        }, 100);
        timeouts.push(startTimeout);
      } else {
        // Reset typing state for inactive cards - show full content
        setTypingStates(prev => ({
          ...prev,
          [agent.id]: {
            title: agent.name,
            description: agent.description,
            features: agent.features,
            currentStep: 'complete',
            featureIndex: 0,
            isTyping: false
          }
        }));
      }
    });

    return () => {
      Object.values(typingTimeoutsRef.current).forEach(timeouts => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      });
      typingTimeoutsRef.current = {};
    };
  }, [currentIndex]);

  // Play AI CFO video when card is active
  useEffect(() => {
    const playVideo = () => {
      if (aiCFOVideoRef.current) {
        if (currentIndex === 0) {
          aiCFOVideoRef.current.play().catch((error: any) => {
            // Ignore benign AbortError from quick play/pause switches
            if (error?.name === 'AbortError') return;
            console.error('Error autoplaying AI CFO video:', error);
          });
        } else {
          // Pause when not active
          aiCFOVideoRef.current.pause();
        }
      } else {
        // Retry if video ref is not ready yet
        setTimeout(playVideo, 100);
      }
    };
    playVideo();
  }, [currentIndex]);

  // Scroll to current card, showing blurred cards on both sides with seamless loop
  useEffect(() => {
    const scrollToCard = () => {
      if (carouselRef.current) {
        const cardWidth = 1000; // Each card is 1000px wide
        const gap = 32; // 2rem gap = 32px
        const totalCardWidth = cardWidth + gap;

        // Calculate scroll position
        // Structure: [duplicate last] [AI CFO (0)] [Real Estate (1)] [Sales Agent (2)] [HR Agent (3)] [duplicate first]
        // The CSS padding centers cards, so we need to scroll to position each card correctly
        // Index 0: scroll to position of AI CFO (after duplicate)
        // Index 1: scroll to position of Real Estate
        // Index 2: scroll to position of Sales Agent
        // Index 3: scroll to position of HR Agent
        const scrollPosition = (currentIndex + 1) * totalCardWidth;

        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    };

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(scrollToCard, 50);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  // Auto-scroll carousel with infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const totalCards = 4; // AI CFO Agent + 3 agent cards
        const nextIndex = (prevIndex + 1) % totalCards;
        return nextIndex;
      });
    }, 10000); // Change card every 10 seconds (gives time for typing animation)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="agent-demo-section" ref={sectionRef}>
      <div className="agent-demo-container">
        <div className="agent-demo-header">
          <h2 className="agent-demo-title">Meet Our AI Agents</h2>
          <p className="agent-demo-subtitle">
            Experience the power of intelligent automation with our interactive agent demos
          </p>
        </div>

        {/* Cards Carousel Container */}
        <div className="agent-cards-carousel-wrapper">
          <div className="agent-cards-carousel" ref={carouselRef}>
            {/* Duplicate last agent card at the beginning for seamless loop */}
            {(() => {
              const lastAgent = agents[agents.length - 1]; // HR Agent
              const isPlaying = playingCards[lastAgent.id] || false;
              return (
                <div
                  key={`${lastAgent.id}-duplicate-start`}
                  className={`agent-card ${currentIndex === 0 ? 'blurred' : 'hidden'}`}
                  style={{
                    '--card-color': lastAgent.color,
                    '--card-index': -1
                  } as React.CSSProperties}
                >
                  <div className={`agent-card-inner`} style={{ backgroundImage: `url(${agentBg})` }}>
                    {/* Text Content Section - Left Side */}
                    <div className="agent-content-wrapper">
                      <div className="agent-content">
                        <h3 className="agent-card-name">
                          {lastAgent.name}
                        </h3>
                        <p className="agent-card-description">{lastAgent.description}</p>

                        {/* Features List */}
                        <div className="agent-features">
                          {lastAgent.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="agent-feature-item">
                              <div className="agent-feature-icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M13.5 4L6 11.5L2.5 8" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <span className="agent-feature-text">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Play Button Icon */}
                        <div className="agent-play-button-container" onClick={() => handlePlay(lastAgent.id)}>
                          <button className="agent-play-button" aria-label="Play audio">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                              <circle cx="24" cy="24" r="24" fill={lastAgent.color} />
                              {audioPlaying[lastAgent.id] ? (
                                <path
                                  d="M16 14H20V34H16V14ZM28 14H32V34H28V14Z"
                                  fill="white"
                                />
                              ) : (
                                <path
                                  d="M18 14L18 34L30 24L18 14Z"
                                  fill="white"
                                />
                              )}
                            </svg>
                          </button>
                          <div className="agent-play-text">
                            <span className="agent-play-title" style={{ color: lastAgent.color }}>Listen to Lagentry</span>
                            <span className="agent-play-subtitle">General Questions</span>
                          </div>
                        </div>

                        {/* More About Button */}
                        <button className="agent-more-about-button">
                          More About {lastAgent.name} Agent
                        </button>
                        {/* Audio element */}
                        <audio
                          ref={(el) => {
                            audioRefs.current[lastAgent.id] = el;
                          }}
                          src={salesVoice}
                          onEnded={() => setAudioPlaying(prev => ({ ...prev, [lastAgent.id]: false }))}
                          onPlay={() => setAudioPlaying(prev => ({ ...prev, [lastAgent.id]: true }))}
                          onPause={() => setAudioPlaying(prev => ({ ...prev, [lastAgent.id]: false }))}
                        />
                      </div>
                    </div>

                    {/* Visual Panel - Right Side */}
                    <div className="agent-visual-panel-wrapper">
                      <div className="agent-visual-panel">
                        <div className="agent-video-container">
                          <video
                            ref={(el) => {
                              videoRefs.current[lastAgent.id] = el;
                              if (el) {
                                el.dataset.cardId = lastAgent.id;
                              }
                            }}
                            className="agent-video"
                            src={lastAgent.video}
                            muted={mutedCards[lastAgent.id] !== undefined ? mutedCards[lastAgent.id] : true}
                            loop={true}
                            autoPlay
                            playsInline
                            preload="auto"
                            onEnded={() => handleVideoEnd(lastAgent.id)}
                            onPlay={() => setPlayingCards(prev => ({ ...prev, [lastAgent.id]: true }))}
                            onPause={() => setPlayingCards(prev => ({ ...prev, [lastAgent.id]: false }))}
                            onLoadedMetadata={(e) => {
                              const video = e.currentTarget;
                              if (video) {
                                video.style.display = 'block';
                                video.play().catch((error) => {
                                  console.error('Error autoplaying video:', error);
                                });
                              }
                            }}
                            onError={(e) => {
                              console.error('Video loading error:', e);
                            }}
                          />

                          {/* Video Overlay with Play Button */}
                          <div
                            className={`video-overlay ${isPlaying ? 'playing' : ''}`}
                            onClick={() => handlePlay(lastAgent.id)}
                          >
                            {!isPlaying && (
                              <button className="play-button" aria-label="Play video">
                                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                  <circle cx="40" cy="40" r="40" fill="rgba(255, 255, 255, 0.9)" />
                                  <path
                                    d="M32 24L32 56L56 40L32 24Z"
                                    fill="#8B5CF6"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* AI CFO Agent Section */}
            <div className={`ai-sales-gtm-section carousel-card ${currentIndex === 0 ? 'active' : (currentIndex === 1 || currentIndex === 2 || currentIndex === 3) ? 'blurred' : 'hidden'}`} style={{ backgroundImage: `url(${agentBg})` }}>
              <div className="ai-sales-gtm-content">
                <div className="ai-sales-gtm-left">
                  <h2 className="ai-sales-gtm-title">
                    {typingStates['ai-cfo-agent']?.title ?? aiCFOContent.title}
                    {typingStates['ai-cfo-agent']?.isTyping && typingStates['ai-cfo-agent'].currentStep === 'title' && (
                      <span className="typing-cursor">|</span>
                    )}
                  </h2>
                  <p className="ai-sales-gtm-tagline">
                    {typingStates['ai-cfo-agent']?.tagline ?? aiCFOContent.tagline}
                    {typingStates['ai-cfo-agent']?.isTyping && typingStates['ai-cfo-agent'].currentStep === 'description' && (
                      <span className="typing-cursor">|</span>
                    )}
                  </p>

                  <div className="ai-sales-gtm-features">
                    {aiCFOContent.features.map((feature: string, featureIndex: number) => {
                      const typedFeature = typingStates['ai-cfo-agent']?.features[featureIndex] ?? feature;
                      const isCurrentFeature = typingStates['ai-cfo-agent']?.isTyping &&
                        typingStates['ai-cfo-agent'].currentStep === 'features' &&
                        typingStates['ai-cfo-agent'].featureIndex === featureIndex;

                      return (
                        <div key={featureIndex} className="ai-sales-gtm-feature-item">
                          <div className="ai-sales-gtm-checkmark">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span>
                            {typedFeature}
                            {isCurrentFeature && typedFeature.length < feature.length && (
                              <span className="typing-cursor">|</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button className="ai-sales-gtm-button">More About AI CFO Agent</button>
                </div>

                <div className="ai-sales-gtm-right">
                  <div className="ai-sales-gtm-visual-panel">
                    <div className="agent-video-container">
                      <video
                        ref={aiCFOVideoRef}
                        className="agent-video"
                        src={aiCFOVideo}
                        muted={true}
                        loop={true}
                        autoPlay
                        playsInline
                        preload="auto"
                        onLoadedMetadata={(e) => {
                          const video = e.currentTarget;
                          if (video) {
                            video.style.display = 'block';
                            // Play video if AI CFO card is currently active
                            if (currentIndex === 0) {
                              video.play().catch((error) => {
                                console.error('Error autoplaying video:', error);
                              });
                            }
                          }
                        }}
                        onError={(e) => {
                          console.error('Video loading error:', e);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Cards */}
            {agents.map((agent, index) => {
              const isPlaying = playingCards[agent.id] || false;
              const cardIndex = index + 1; // AI CFO is 0, so agents start at 1
              const totalCards = 4; // Total number of cards
              const isActive = currentIndex === cardIndex;
              // Blurred if adjacent (previous or next), or if looping
              // When on first card (0), show last agent card (3) blurred on right
              // When on last card (3), show first card (0) is handled separately, and first agent (1) is blurred on left
              const isBlurred =
                currentIndex === cardIndex - 1 ||
                currentIndex === cardIndex + 1 ||
                (currentIndex === 0 && cardIndex === totalCards - 1); // First card shows last agent card blurred on right
              const isHidden = !isActive && !isBlurred;

              return (
                <div
                  key={agent.id}
                  className={`agent-card ${isActive ? 'active' : isBlurred ? 'blurred' : 'hidden'}`}
                  style={{
                    '--card-color': agent.color,
                    '--card-index': index
                  } as React.CSSProperties}
                >
                  <div className={`agent-card-inner ${agent.id === 'agent-1' || agent.id === 'agent-3' ? 'reversed-layout' : ''}`} style={{ backgroundImage: `url(${agentBg})` }}>
                    {/* For Real Estate (agent-1) and HR Agent (agent-3): Video on left, Content on right */}
                    {agent.id === 'agent-1' || agent.id === 'agent-3' ? (
                      <>
                        {/* Visual Panel - Left Side */}
                        <div className="agent-visual-panel-wrapper">
                          <div className="agent-visual-panel">
                            <div className="agent-video-container">
                              {agent.id === 'agent-3' ? (
                                <img
                                  className="agent-video"
                                  src={agent.video}
                                  alt={`${agent.name} demo`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <>
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
                                    preload="auto"
                                    onEnded={() => handleVideoEnd(agent.id)}
                                    onPlay={() => setPlayingCards(prev => ({ ...prev, [agent.id]: true }))}
                                    onPause={() => setPlayingCards(prev => ({ ...prev, [agent.id]: false }))}
                                    onLoadedMetadata={(e) => {
                                      const video = e.currentTarget;
                                      if (video) {
                                        video.style.display = 'block';
                                        video.play().catch((error: any) => {
                                          if (error?.name === 'AbortError') return;
                                          console.error('Error autoplaying video:', error);
                                        });
                                      }
                                    }}
                                    onError={() => {
                                      // Swallow transient load errors to avoid noisy console
                                    }}
                                  />

                                  {/* Video Overlay with Play Button */}
                                  <div
                                    className={`video-overlay ${isPlaying ? 'playing' : ''}`}
                                    onClick={() => handlePlay(agent.id)}
                                  >
                                    {!isPlaying && (
                                      <button className="play-button" aria-label="Play video">
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                          <circle cx="40" cy="40" r="40" fill="rgba(255, 255, 255, 0.9)" />
                                          <path
                                            d="M32 24L32 56L56 40L32 24Z"
                                            fill="#8B5CF6"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Text Content Section - Right Side */}
                        <div className="agent-content-wrapper">
                          <div className="agent-content">
                            <h3 className="agent-card-name">
                              {typingStates[agent.id]?.title || agent.name}
                              {typingStates[agent.id]?.isTyping && typingStates[agent.id].currentStep === 'title' && (
                                <span className="typing-cursor">|</span>
                              )}
                            </h3>
                            <p className="agent-card-description">
                              {typingStates[agent.id]?.description || agent.description}
                              {typingStates[agent.id]?.isTyping && typingStates[agent.id].currentStep === 'description' && (
                                <span className="typing-cursor">|</span>
                              )}
                            </p>

                            {/* Features List */}
                            <div className="agent-features">
                              {agent.features.map((feature, featureIndex) => {
                                const typedFeature = typingStates[agent.id]?.features[featureIndex] ?? feature;
                                const isCurrentFeature = typingStates[agent.id]?.isTyping &&
                                  typingStates[agent.id].currentStep === 'features' &&
                                  typingStates[agent.id].featureIndex === featureIndex;

                                return (
                                  <div key={featureIndex} className="agent-feature-item">
                                    <div className="agent-feature-icon">
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M13.5 4L6 11.5L2.5 8" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </div>
                                    <span className="agent-feature-text">
                                      {typedFeature}
                                      {isCurrentFeature && typedFeature.length < feature.length && (
                                        <span className="typing-cursor">|</span>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Play Button Icon */}
                            <div className="agent-play-button-container" onClick={() => handlePlay(agent.id)}>
                              <button className="agent-play-button" aria-label="Play audio">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                  <circle cx="24" cy="24" r="24" fill={agent.color} />
                                  {audioPlaying[agent.id] ? (
                                    <path
                                      d="M16 14H20V34H16V14ZM28 14H32V34H28V14Z"
                                      fill="white"
                                    />
                                  ) : (
                                    <path
                                      d="M18 14L18 34L30 24L18 14Z"
                                      fill="white"
                                    />
                                  )}
                                </svg>
                              </button>
                              <div className="agent-play-text">
                                <span className="agent-play-title" style={{ color: agent.color }}>Listen to Lagentry</span>
                                <span className="agent-play-subtitle">General Questions</span>
                              </div>
                            </div>

                            {/* More About Button */}
                            <button className="agent-more-about-button">
                              More About {agent.name} Agent
                            </button>
                            {/* Audio element for agents */}
                            <audio
                              ref={(el) => {
                                audioRefs.current[agent.id] = el;
                              }}
                              src={agent.id === 'agent-1' ? realVoiceDemo : salesVoice}
                              onEnded={() => setAudioPlaying(prev => ({ ...prev, [agent.id]: false }))}
                              onPlay={() => setAudioPlaying(prev => ({ ...prev, [agent.id]: true }))}
                              onPause={() => setAudioPlaying(prev => ({ ...prev, [agent.id]: false }))}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Text Content Section - Left Side */}
                        <div className="agent-content-wrapper">
                          <div className="agent-content">
                            <h3 className="agent-card-name">
                              {typingStates[agent.id]?.title ?? agent.name}
                              {typingStates[agent.id]?.isTyping && typingStates[agent.id].currentStep === 'title' && (
                                <span className="typing-cursor">|</span>
                              )}
                            </h3>
                            <p className="agent-card-description">
                              {typingStates[agent.id]?.description ?? agent.description}
                              {typingStates[agent.id]?.isTyping && typingStates[agent.id].currentStep === 'description' && (
                                <span className="typing-cursor">|</span>
                              )}
                            </p>

                            {/* Features List */}
                            <div className="agent-features">
                              {agent.features.map((feature, featureIndex) => {
                                const typedFeature = typingStates[agent.id]?.features[featureIndex] ?? feature;
                                const isCurrentFeature = typingStates[agent.id]?.isTyping &&
                                  typingStates[agent.id].currentStep === 'features' &&
                                  typingStates[agent.id].featureIndex === featureIndex;

                                return (
                                  <div key={featureIndex} className="agent-feature-item">
                                    <div className="agent-feature-icon">
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M13.5 4L6 11.5L2.5 8" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </div>
                                    <span className="agent-feature-text">
                                      {typedFeature}
                                      {isCurrentFeature && typedFeature.length < feature.length && (
                                        <span className="typing-cursor">|</span>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Play Button Icon */}
                            <div className="agent-play-button-container" onClick={() => handlePlay(agent.id)}>
                              <button className="agent-play-button" aria-label={(agent.id === 'agent-1' || agent.id === 'agent-2' || agent.id === 'agent-3') ? 'Play audio' : 'Play video'}>
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                  <circle cx="24" cy="24" r="24" fill={agent.color} />
                                  {(agent.id === 'agent-1' || agent.id === 'agent-2' || agent.id === 'agent-3') && audioPlaying[agent.id] ? (
                                    <path
                                      d="M16 14H20V34H16V14ZM28 14H32V34H28V14Z"
                                      fill="white"
                                    />
                                  ) : (
                                    <path
                                      d="M18 14L18 34L30 24L18 14Z"
                                      fill="white"
                                    />
                                  )}
                                </svg>
                              </button>
                              <div className="agent-play-text">
                                <span className="agent-play-title" style={{ color: agent.color }}>Listen to Lagentry</span>
                                <span className="agent-play-subtitle">General Questions</span>
                              </div>
                            </div>

                            {/* More About Button */}
                            <button className="agent-more-about-button">
                              More About {agent.name} Agent
                            </button>
                            {/* Audio element for agents */}
                            {(agent.id === 'agent-1' || agent.id === 'agent-2' || agent.id === 'agent-3') && (
                              <audio
                                ref={(el) => {
                                  audioRefs.current[agent.id] = el;
                                }}
                                src={agent.id === 'agent-1' ? realVoiceDemo : salesVoice}
                                onEnded={() => setAudioPlaying(prev => ({ ...prev, [agent.id]: false }))}
                                onPlay={() => setAudioPlaying(prev => ({ ...prev, [agent.id]: true }))}
                                onPause={() => setAudioPlaying(prev => ({ ...prev, [agent.id]: false }))}
                              />
                            )}
                          </div>
                        </div>

                        {/* Visual Panel - Right Side */}
                        <div className="agent-visual-panel-wrapper">
                          <div className="agent-visual-panel">
                            <div className="agent-video-container">
                              {agent.id === 'agent-3' ? (
                                <img
                                  className="agent-video"
                                  src={agent.video}
                                  alt={`${agent.name} demo`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <>
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
                                    preload="auto"
                                    onEnded={() => handleVideoEnd(agent.id)}
                                    onPlay={() => setPlayingCards(prev => ({ ...prev, [agent.id]: true }))}
                                    onPause={() => setPlayingCards(prev => ({ ...prev, [agent.id]: false }))}
                                    onLoadedMetadata={(e) => {
                                      const video = e.currentTarget;
                                      if (video) {
                                        video.style.display = 'block';
                                        video.play().catch((error: any) => {
                                          if (error?.name === 'AbortError') return;
                                          console.error('Error autoplaying video:', error);
                                        });
                                      }
                                    }}
                                    onError={() => {
                                      // Suppress non-critical load errors
                                    }}
                                  />

                                  {/* Video Overlay with Play Button */}
                                  <div
                                    className={`video-overlay ${isPlaying ? 'playing' : ''}`}
                                    onClick={() => handlePlay(agent.id)}
                                  >
                                    {!isPlaying && (
                                      <button className="play-button" aria-label="Play video">
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                          <circle cx="40" cy="40" r="40" fill="rgba(255, 255, 255, 0.9)" />
                                          <path
                                            d="M32 24L32 56L56 40L32 24Z"
                                            fill="#8B5CF6"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Duplicate first card at the end for seamless loop */}
            <div className={`ai-sales-gtm-section carousel-card ${currentIndex === 3 ? 'blurred' : 'hidden'}`} style={{ backgroundImage: `url(${agentBg})` }}>
              <div className="ai-sales-gtm-content">
                <div className="ai-sales-gtm-left">
                  <h2 className="ai-sales-gtm-title">
                    {typingStates['ai-cfo-agent']?.title ?? aiCFOContent.title}
                    {typingStates['ai-cfo-agent']?.isTyping && typingStates['ai-cfo-agent'].currentStep === 'title' && (
                      <span className="typing-cursor">|</span>
                    )}
                  </h2>
                  <p className="ai-sales-gtm-tagline">
                    {typingStates['ai-cfo-agent']?.tagline ?? aiCFOContent.tagline}
                    {typingStates['ai-cfo-agent']?.isTyping && typingStates['ai-cfo-agent'].currentStep === 'description' && (
                      <span className="typing-cursor">|</span>
                    )}
                  </p>

                  <div className="ai-sales-gtm-features">
                    {aiCFOContent.features.map((feature: string, featureIndex: number) => {
                      const typedFeature = typingStates['ai-cfo-agent']?.features[featureIndex] ?? feature;
                      const isCurrentFeature = typingStates['ai-cfo-agent']?.isTyping &&
                        typingStates['ai-cfo-agent'].currentStep === 'features' &&
                        typingStates['ai-cfo-agent'].featureIndex === featureIndex;

                      return (
                        <div key={featureIndex} className="ai-sales-gtm-feature-item">
                          <div className="ai-sales-gtm-checkmark">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span>
                            {typedFeature}
                            {isCurrentFeature && typedFeature.length < feature.length && (
                              <span className="typing-cursor">|</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button className="ai-sales-gtm-button">More About AI CFO Agent</button>
                </div>

                <div className="ai-sales-gtm-right">
                  <div className="ai-sales-gtm-visual-panel">
                    <div className="agent-video-container">
                      <video
                        ref={aiCFOVideoRef}
                        className="agent-video"
                        src={aiCFOVideo}
                        muted={true}
                        loop={true}
                        autoPlay
                        playsInline
                        preload="auto"
                        onLoadedMetadata={(e) => {
                          const video = e.currentTarget;
                          if (video) {
                            video.style.display = 'block';
                            // Play video if AI CFO card is currently active
                            if (currentIndex === 0) {
                              video.play().catch((error) => {
                                console.error('Error autoplaying video:', error);
                              });
                            }
                          }
                        }}
                        onError={(e) => {
                          console.error('Video loading error:', e);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDemoCards;

