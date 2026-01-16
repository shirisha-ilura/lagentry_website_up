import React from 'react';
import VoiceAgentsPreview from './VoiceAgentsPreview';
import './WhyChooseLagentry.css';

const WhyChooseLagentry: React.FC = () => {
    return (
        <section className="why-choose-section">
            <div className="container">
                <div className="section-header">
                    <h2>Why Choose Lagentry?</h2>
                    <p className="subtitle">Automation + AI: The Ultimate Advantage</p>
                </div>

                {/* Voice Agents Preview Component */}
                <div className="voice-agents-preview-section">
                    <VoiceAgentsPreview />
                </div>

                {/* Meeting Assistant Feature */}
                <div className="feature-block">
                    <div className="feature-content">
                        <h3>Meeting Assistant for Sales Reps</h3>
                        <p className="feature-subtitle">The ultimate cheat code for sales reps.</p>
                        <p className="feature-description">
                            Never miss a detail. Our assistant joins your meetings, researches prospects in real-time, and provides live pitch guidance.
                        </p>
                        <ul className="feature-list">
                            <li>Joins sales meetings (without anyone knowing!)</li>
                            <li>DeepResearches customer instantly</li>
                            <li>Gives pitch guidance live</li>
                            <li>Works in EN + AR</li>
                        </ul>
                        <p className="tagline">Sell with Confidence.</p>
                    </div>
                    <div className="feature-media">
                        <div className="video-placeholder">
                            <video
                                className="feature-video"
                                src="/sal.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="none"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    const video = e.currentTarget;
                                    // Only log detailed errors in development
                                    if (process.env.NODE_ENV === 'development') {
                                        console.error('sal video error:', e);
                                        console.error('Video src:', video.src);
                                        console.error('Video error code:', video.error?.code);
                                        console.error('Video error message:', video.error?.message);
                                    } else {
                                        // In production, just log a warning
                                        console.warn('Video failed to load:', video.src);
                                    }
                                    // Try alternative paths
                                    const alternatives = [
                                        '/sal.mp4',
                                        '/sal.mp4',
                                        `${window.location.origin}/sal.mp4`
                                    ];
                                    let currentIndex = 0;
                                    const tryNext = () => {
                                        if (currentIndex < alternatives.length && video.error) {
                                            const newSrc = alternatives[currentIndex];
                                            const currentSrc = video.src.replace(window.location.origin, '');
                                            if (currentSrc !== newSrc && !video.src.includes(newSrc)) {
                                                console.log(`Trying alternative path: ${newSrc}`);
                                                video.src = newSrc;
                                                video.load();
                                            }
                                            currentIndex++;
                                        } else if (video.error) {
                                            console.error('sal.mp4 video not found. Please ensure the file exists in public folder.');
                                            console.error('Current video src:', video.src);
                                            video.style.display = 'none';
                                        }
                                    };
                                    video.addEventListener('error', tryNext, { once: true });
                                    tryNext();
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Voice Cloning Feature */}
                <div className="feature-block reverse">
                    <div className="feature-content">
                        <h3>Voice Cloning Feature</h3>
                        <p className="feature-description">
                            Clone your voice in less than 2 minutes! Create a digital twin that sounds exactly like you for consistent, scalable communication.
                        </p>
                        <ul className="feature-list">
                            <li>Voice can be used for phone or web agents</li>
                            <li>Your AI Agent uses emotions for a more natural feel</li>
                            <li>No one knows it's AI, and not you!</li>
                        </ul>
                    </div>
                    <div className="feature-media">
                        <div className="video-placeholder">
                            <video
                                className="feature-video"
                                src="/clone.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="none"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    const video = e.currentTarget;
                                    if (video && video.error) {
                                        // Only log detailed errors in development
                                        if (process.env.NODE_ENV === 'development') {
                                            console.error('clone video error:', e);
                                            console.error('Video src:', video.src);
                                            console.error('Video error code:', video.error.code);
                                            console.error('Video error message:', video.error.message);
                                        } else {
                                            // In production, just log a warning
                                            console.warn('Video failed to load:', video.src);
                                        }
                                        // Try alternative paths/formats as fallback (mp4 only - no MOV)
                                        const alternatives = [
                                            '/clone.mp4',
                                            '/clone.MP4',
                                            `${window.location.origin}/clone.mp4`
                                        ];
                                        let currentIndex = 0;
                                        const tryNext = () => {
                                            if (currentIndex < alternatives.length && video.error) {
                                                const newSrc = alternatives[currentIndex];
                                                // Check if src is different (handle both relative and absolute URLs)
                                                const currentSrc = video.src.replace(window.location.origin, '');
                                                if (currentSrc !== newSrc && !video.src.includes(newSrc)) {
                                                    console.log(`Trying alternative path: ${newSrc}`);
                                                    video.src = newSrc;
                                                    video.load();
                                                }
                                                currentIndex++;
                                            } else if (video.error) {
                                                console.error('clone.mp4 video not found. Please ensure clone.mp4 exists in public folder.');
                                                console.error('Current video src:', video.src);
                                                // Hide video on persistent error
                                                video.style.display = 'none';
                                            }
                                        };
                                        video.addEventListener('error', tryNext, { once: true });
                                        tryNext();
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* What We Replace Section */}
                <div className="comparison-section">
                    <h3>What We Replace</h3>
                    <p className="subtitle">One Platform to Rule Them All</p>

                    <div className="pes-section agent-matrix">
                        <div className="pes-grid">
                            {/* Prospect column */}
                            <div className="pes-column">
                                <h3>Automate</h3>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">GTM / Sales Agent</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/one1.webp" alt="ZoomInfo" />
                                            <img src="/images/one2.webp" alt="Seamless.ai" />
                                            <img src="/images/one3.webp" alt="Clay" />
                                            <img src="/images/one4.webp" alt="Outreach" />
                                            <img src="/images/one5.webp" alt="Salesloft" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$2,500</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">CFO / Finance Agent</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/two1.webp" alt="QuickBooks" />
                                            <img src="/images/two2.webp" alt="Xero" />
                                            <img src="/images/two3.webp" alt="FreshBooks" />
                                            <img src="/images/two4.webp" alt="Zoho Books" />
                                            <img src="/images/two5.webp" alt="Bill.com" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$1,200</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">HR / Recruitment Agent</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/three1.webp" alt="Greenhouse" />
                                            <img src="/images/three2.webp" alt="BambooHR" />
                                            <img src="/images/three3.webp" alt="Lever" />
                                            <img src="/images/three4.webp" alt="Ashby" />
                                            <img src="/images/three5.webp" alt="Rippling" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$1,000</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">Real Estate Agent</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/four1.webp" alt="Zillow" />
                                            <img src="/images/four2.webp" alt="Propertyware" />
                                            <img src="/images/four3.webp" alt="Buildium" />
                                            <img src="/images/four4.webp" alt="AppFolio" />
                                            <img src="/images/four5.webp" alt="Yardi" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$1,500</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>
                            </div>

                            {/* Engage column */}
                            <div className="pes-column">
                                <h3>Activate</h3>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">Customer Support Agent</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/five1.webp" alt="Zendesk" />
                                            <img src="/images/five2.webp" alt="Intercom" />
                                            <img src="/images/five3.webp" alt="Freshdesk" />
                                            <img src="/images/five4.webp" alt="HelpScout" />
                                            <img src="/images/five5.webp" alt="Crisp" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$1,000</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">Voice Calling Agents</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/six1.webp" alt="Retell AI" />
                                            <img src="/images/six2.webp" alt="Twilio Voice" />
                                            <img src="/images/six3.webp" alt="AirCall" />
                                            <img src="/images/six4.webp" alt="JustCall" />
                                            <img src="/images/six5.webp" alt="VAPI" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$800</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">Voice Cloning Platforms</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/seven1.webp" alt="ElevenLabs" />
                                            <img src="/images/seven2.webp" alt="Play.ht" />
                                            <img src="/images/seven3.webp" alt="Resemble AI" />
                                            <img src="/images/seven4.webp" alt="Vocaloid" />
                                            <img src="/images/seven5.webp" alt="Speechify Voices" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$300</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">Healthcare Agent</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/eight1.webp" alt="Zocdoc" />
                                            <img src="/images/eight2.webp" alt="AthenaHealth" />
                                            <img src="/images/eight3.webp" alt="Kareo" />
                                            <img src="/images/eight4.webp" alt="DrChrono" />
                                            <img src="/images/eight5.webp" alt="Mend Telehealth" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$600</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>
                            </div>

                            {/* Signals column */}
                            <div className="pes-column">
                                <h3>Accelerate</h3>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">Car Dealer Agent</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/nine1.webp" alt="AutoRaptor" />
                                            <img src="/images/nine2.webp" alt="DealerCenter" />
                                            <img src="/images/nine3.webp" alt="VinSolutions" />
                                            <img src="/images/nine4.webp" alt="DealerSocket" />
                                            <img src="/images/nine5.webp" alt="Cars.com Dealer Solutions" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$600</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">Debt Collection Agent</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/ten1.webp" alt="TrueAccord" />
                                            <img src="/images/ten2.webp" alt="Chaser" />
                                            <img src="/images/ten3.webp" alt="Dunning from Chargebee" />
                                            <img src="/images/ten4.webp" alt="Upflow Collections" />
                                            <img src="/images/ten5.webp" alt="CollectAI" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$50</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">Invoice Agent</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/eleven1.webp" alt="Chaser" />
                                            <img src="/images/eleven2.webp" alt="Invoice Ninja" />
                                            <img src="/images/eleven3.webp" alt="Zoho Invoice" />
                                            <img src="/images/eleven4.webp" alt="FreshBooks" />
                                            <img src="/images/eleven5.webp" alt="QuickBooks Invoicing" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$500</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>

                                <div className="pes-row">
                                    <div className="pes-row-main">
                                        <span className="pes-row-title">Custom AI Agent Builder</span>
                                        <div className="pes-row-logos">
                                            <img src="/images/twelve1.webp" alt="Zapier AI" />
                                            <img src="/images/twelve2.webp" alt="Make" />
                                            <img src="/images/twelve3.webp" alt="N8N" />
                                            <img src="/images/twelve4.webp" alt="Taskade Agents" />
                                            <img src="/images/twelve5.webp" alt="AgentGPT" />
                                        </div>
                                    </div>
                                    <div className="pes-row-price">
                                        <span>$100</span>
                                        <span className="pes-row-price-muted">/month</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual connectors from the three columns down to the summary card */}
                    <div className="matrix-footer">
                        <div className="matrix-connectors">
                            <span className="connector-line" />
                            <span className="connector-line" />
                            <span className="connector-line" />
                        </div>

                        <div className="cost-card">
                            <div className="cost-card-header">
                                <span className="cost-card-title">The cost of it all</span>
                                <span className="cost-card-old">$10,000+</span>
                            </div>
                            <div className="cost-card-body">
                                <span className="cost-card-with">
                                    With
                                    <img
                                        src="/images/lagentry-Logo.png"
                                        alt="Lagentry logo"
                                        className="cost-card-logo"
                                        onError={(e) => {
                                          const target = e.currentTarget;
                                          if (!target.src.includes('lagentry-logo.png')) {
                                            target.src = "/images/lagentry-logo.png";
                                          } else {
                                            target.src = "/images/logo.png";
                                          }
                                        }}
                                    />
                                    Lagentry
                                </span>
                                <span className="cost-card-new">$20</span>
                                <span className="cost-card-period">/month</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseLagentry;
