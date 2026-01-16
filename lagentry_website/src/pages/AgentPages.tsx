import React, { useState, useEffect, useRef } from 'react';
import './AgentPages.css';
import Footer from '../components/Footer';

// Animation hook for counting numbers
const useCountUp = (end: number, duration: number = 2500, startOnMount: boolean = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnMount);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Smooth ease-out function for consistent animation with progress bars
      const smoothProgress = 1 - Math.pow(1 - progress, 2);
      
      setCount(end * smoothProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return { count, elementRef };
};

// Animation hook for progress bars
const useProgressAnimation = (targetWidth: number, duration: number = 4000) => {
  const [width, setWidth] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // Very smooth ease-in-out for gradual movement
      const smoothProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setWidth(targetWidth * smoothProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setWidth(targetWidth);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, targetWidth, duration]);

  return { width, elementRef };
};

// Animated bar component for charts
const AnimatedBar: React.FC<{ height: number; delay: number }> = ({ height, delay }) => {
  const [animatedHeight, setAnimatedHeight] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            setHasStarted(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    const duration = 4000;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // Very smooth ease-in-out for gradual movement
      const smoothProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setAnimatedHeight(height * smoothProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedHeight(height);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, height]);

  return <div className="sales-area-bar" ref={elementRef} style={{ height: `${animatedHeight}%` }}></div>;
};

type Feature = {
  icon: string;
  title: string;
  description: string;
};

type AgentConfig = {
  id: string;
  title: string;
  eyebrow: string;
  overview: string;
  videoSrc: string;
  features: Feature[];
};

interface AgentPageProps {
  config: AgentConfig;
}

// Animated Number Component
const AnimatedNumber: React.FC<{ value: number | string; suffix?: string; prefix?: string; duration?: number }> = ({ 
  value, 
  suffix = '', 
  prefix = '', 
  duration = 2000 
}) => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  const { count, elementRef } = useCountUp(numValue, duration);
  
  const formatValue = () => {
    if (typeof value === 'string' && value.includes('%')) {
      return `${Math.round(count)}%`;
    }
    if (typeof value === 'string' && value.includes(',')) {
      return Math.round(count).toLocaleString();
    }
    if (prefix === '$' && numValue >= 1000) {
      return `${prefix}${(count / 1000).toFixed(1)}M`;
    }
    return `${prefix}${Math.round(count)}${suffix}`;
  };

  return <span ref={elementRef}>{formatValue()}</span>;
};

// Animated Progress Bar Component
const AnimatedProgressBar: React.FC<{ 
  targetWidth: number; 
  duration?: number; 
  className?: string; 
  showValue?: boolean;
  valueClassName?: string;
  barClassName?: string;
}> = ({ 
  targetWidth, 
  duration = 2500,
  className = '',
  showValue = true,
  valueClassName = 'hr-chart-value',
  barClassName = 'hr-chart-bar'
}) => {
  const { width, elementRef } = useProgressAnimation(targetWidth, duration);
  
  return (
    <>
      <div className={`${barClassName} ${className}`} ref={elementRef} style={{ width: `${width}%` }}></div>
      {showValue && <span className={valueClassName}>{Math.round(width)}%</span>}
    </>
  );
};

// Animated Progress Fill Component (for bars that need just the fill, not the container)
const AnimatedProgressFill: React.FC<{ 
  targetWidth: number; 
  duration?: number; 
  className?: string;
}> = ({ 
  targetWidth, 
  duration = 4000,
  className = ''
}) => {
  const { width, elementRef } = useProgressAnimation(targetWidth, duration);
  
  return (
    <div className={className} ref={elementRef} style={{ width: `${width}%` }}></div>
  );
};

// Enhanced HR Card Component with interactive elements
interface EnhancedHRCardProps {
  title: string;
  subtitle: string;
  type: 'screening' | 'outreach' | 'interviewing' | 'questioning' | 'shortlisting' | 'summaries';
}

const EnhancedHRCard: React.FC<EnhancedHRCardProps> = ({ title, subtitle, type }) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderCardContent = () => {
    switch (type) {
      case 'screening':
        return (
          <>
            <div className="hr-screening-stats">
              <div className="hr-stat-large">
                <div className="hr-stat-number"><AnimatedNumber value={847} /></div>
                <div className="hr-stat-desc">CVs Processed</div>
              </div>
              <div className="hr-stat-large">
                <div className="hr-stat-number"><AnimatedNumber value={92} suffix="%" /></div>
                <div className="hr-stat-desc">Accuracy Rate</div>
              </div>
            </div>
            <div className="hr-screening-chart">
              <div className="hr-chart-item">
                <div className="hr-chart-label">Matched Skills</div>
                <div className="hr-chart-bar-container">
                  <AnimatedProgressBar targetWidth={85} />
                </div>
              </div>
              <div className="hr-chart-item">
                <div className="hr-chart-label">Experience Match</div>
                <div className="hr-chart-bar-container">
                  <AnimatedProgressBar targetWidth={78} />
                </div>
              </div>
              <div className="hr-chart-item">
                <div className="hr-chart-label">Education Match</div>
                <div className="hr-chart-bar-container">
                  <AnimatedProgressBar targetWidth={92} />
                </div>
              </div>
            </div>
            <div className="hr-trend-indicator">
              <span className="hr-trend-arrow">↑</span>
              <span className="hr-trend-text">Processing speed increased by 35%</span>
            </div>
          </>
        );

      case 'outreach':
        return (
          <>
            <div className="hr-outreach-metrics">
              <div className="hr-metric-box">
                <div className="hr-metric-icon"></div>
                <div className="hr-metric-info">
                  <div className="hr-metric-number"><AnimatedNumber value={1247} /></div>
                  <div className="hr-metric-label">Calls Made</div>
                </div>
              </div>
              <div className="hr-metric-box">
                <div className="hr-metric-icon"></div>
                <div className="hr-metric-info">
                  <div className="hr-metric-number"><AnimatedNumber value={89} /></div>
                  <div className="hr-metric-label">Interviews Scheduled</div>
                </div>
              </div>
            </div>
            <div className="hr-outreach-timeline">
              <div className="hr-timeline-item">
                <div className="hr-timeline-dot"></div>
                <div className="hr-timeline-content">
                  <div className="hr-timeline-title">Initial Contact</div>
                  <AnimatedProgressFill targetWidth={100} className="hr-timeline-bar" />
                </div>
              </div>
              <div className="hr-timeline-item">
                <div className="hr-timeline-dot"></div>
                <div className="hr-timeline-content">
                  <div className="hr-timeline-title">Details Collected</div>
                  <AnimatedProgressFill targetWidth={75} className="hr-timeline-bar" />
                </div>
              </div>
              <div className="hr-timeline-item">
                <div className="hr-timeline-dot"></div>
                <div className="hr-timeline-content">
                  <div className="hr-timeline-title">Interview Scheduled</div>
                  <AnimatedProgressFill targetWidth={60} className="hr-timeline-bar" />
                </div>
              </div>
            </div>
            <div className="hr-trend-indicator positive">
              <span className="hr-trend-arrow">↑</span>
              <span className="hr-trend-text">Response rate up 28% this month</span>
            </div>
          </>
        );

      case 'interviewing':
        return (
          <>
            <div className="hr-interview-stats">
              <div className="hr-stat-card">
                <div className="hr-stat-value"><AnimatedNumber value={156} /></div>
                <div className="hr-stat-label">Interviews Conducted</div>
              </div>
              <div className="hr-stat-card">
                <div className="hr-stat-value">4.2/5</div>
                <div className="hr-stat-label">Avg. Quality Score</div>
              </div>
            </div>
            <div className="hr-interview-progress">
              <div className="hr-progress-item">
                <div className="hr-progress-label">JD Understanding</div>
                <div className="hr-progress-track">
                  <AnimatedProgressFill targetWidth={88} className="hr-progress-fill" />
                </div>
                <span className="hr-progress-percent">88%</span>
              </div>
              <div className="hr-progress-item">
                <div className="hr-progress-label">Resume Analysis</div>
                <div className="hr-progress-track">
                  <AnimatedProgressFill targetWidth={92} className="hr-progress-fill" />
                </div>
                <span className="hr-progress-percent">92%</span>
              </div>
              <div className="hr-progress-item">
                <div className="hr-progress-label">Natural Conversation</div>
                <div className="hr-progress-track">
                  <AnimatedProgressFill targetWidth={85} className="hr-progress-fill" />
                </div>
                <span className="hr-progress-percent">85%</span>
              </div>
            </div>
            <div className="hr-trend-indicator">
              <span className="hr-trend-arrow">↑</span>
              <span className="hr-trend-text">Interview quality improved by 22%</span>
            </div>
          </>
        );

      case 'questioning':
        return (
          <>
            <div className="hr-questioning-metrics">
              <div className="hr-metric-display">
                <div className="hr-metric-main">94%</div>
                <div className="hr-metric-sub">Competence Accuracy</div>
              </div>
            </div>
            <div className="hr-questioning-breakdown">
              <div className="hr-breakdown-item">
                <div className="hr-breakdown-label">Technical Skills</div>
                <div className="hr-breakdown-bar">
                  <div className="hr-breakdown-fill" style={{ width: '91%' }}></div>
                </div>
                <span className="hr-breakdown-value">91%</span>
              </div>
              <div className="hr-breakdown-item">
                <div className="hr-breakdown-label">Problem Solving</div>
                <div className="hr-breakdown-bar">
                  <div className="hr-breakdown-fill" style={{ width: '87%' }}></div>
                </div>
                <span className="hr-breakdown-value">87%</span>
              </div>
              <div className="hr-breakdown-item">
                <div className="hr-breakdown-label">Communication</div>
                <div className="hr-breakdown-bar">
                  <div className="hr-breakdown-fill" style={{ width: '89%' }}></div>
                </div>
                <span className="hr-breakdown-value">89%</span>
              </div>
              <div className="hr-breakdown-item">
                <div className="hr-breakdown-label">Follow-up Questions</div>
                <div className="hr-breakdown-bar">
                  <div className="hr-breakdown-fill" style={{ width: '96%' }}></div>
                </div>
                <span className="hr-breakdown-value">96%</span>
              </div>
            </div>
            <div className="hr-trend-indicator positive">
              <span className="hr-trend-arrow">↑</span>
              <span className="hr-trend-text">Question accuracy increased by 18%</span>
            </div>
          </>
        );

      case 'shortlisting':
        return (
          <>
            <div className="hr-shortlisting-overview">
              <div className="hr-overview-item">
                <div className="hr-overview-number"><AnimatedNumber value={247} /></div>
                <div className="hr-overview-label">Candidates Ranked</div>
              </div>
              <div className="hr-overview-item">
                <div className="hr-overview-number"><AnimatedNumber value={23} /></div>
                <div className="hr-overview-label">Top Candidates Selected</div>
              </div>
            </div>
            <div className="hr-shortlisting-scores">
              <div className="hr-score-item">
                <div className="hr-score-label">Top 10% Score</div>
                <div className="hr-score-bar">
                  <AnimatedProgressFill targetWidth={95} className="hr-score-fill" />
                </div>
                <span className="hr-score-value">95/100</span>
              </div>
              <div className="hr-score-item">
                <div className="hr-score-label">Average Score</div>
                <div className="hr-score-bar">
                  <AnimatedProgressFill targetWidth={78} className="hr-score-fill" />
                </div>
                <span className="hr-score-value">78/100</span>
              </div>
              <div className="hr-score-item">
                <div className="hr-score-label">Minimum Threshold</div>
                <div className="hr-score-bar">
                  <AnimatedProgressFill targetWidth={65} className="hr-score-fill" />
                </div>
                <span className="hr-score-value">65/100</span>
              </div>
            </div>
            <div className="hr-shortlisting-distribution">
              <div className="hr-dist-item">
                <div className="hr-dist-bar" style={{ height: '20px' }}></div>
                <span>Top 10%</span>
              </div>
              <div className="hr-dist-item">
                <div className="hr-dist-bar" style={{ height: '45px' }}></div>
                <span>Top 25%</span>
              </div>
              <div className="hr-dist-item">
                <div className="hr-dist-bar" style={{ height: '70px' }}></div>
                <span>Top 50%</span>
              </div>
              <div className="hr-dist-item">
                <div className="hr-dist-bar" style={{ height: '100px' }}></div>
                <span>All Candidates</span>
              </div>
            </div>
            <div className="hr-trend-indicator">
              <span className="hr-trend-arrow">↑</span>
              <span className="hr-trend-text">Selection accuracy improved by 31%</span>
            </div>
          </>
        );

      case 'summaries':
        return (
          <>
            <div className="hr-summaries-stats">
              <div className="hr-stat-box">
                <div className="hr-stat-icon"></div>
                <div className="hr-stat-details">
                  <div className="hr-stat-big">189</div>
                  <div className="hr-stat-small">Transcripts Generated</div>
                </div>
              </div>
              <div className="hr-stat-box">
                <div className="hr-stat-icon"></div>
                <div className="hr-stat-details">
                  <div className="hr-stat-big">94%</div>
                  <div className="hr-stat-small">Insight Accuracy</div>
                </div>
              </div>
            </div>
            <div className="hr-summaries-features">
              <div className="hr-feature-tag">Transcripts</div>
              <div className="hr-feature-tag">Insights</div>
              <div className="hr-feature-tag">Recommendations</div>
            </div>
            <div className="hr-summaries-breakdown">
              <div className="hr-breakdown-row">
                <span className="hr-breakdown-name">Key Insights</span>
                <div className="hr-breakdown-line">
                  <AnimatedProgressFill targetWidth={92} className="hr-breakdown-progress" />
                </div>
                <span className="hr-breakdown-percent"><AnimatedNumber value={92} suffix="%" /></span>
              </div>
              <div className="hr-breakdown-row">
                <span className="hr-breakdown-name">Hiring Recommendations</span>
                <div className="hr-breakdown-line">
                  <AnimatedProgressFill targetWidth={88} className="hr-breakdown-progress" />
                </div>
                <span className="hr-breakdown-percent"><AnimatedNumber value={88} suffix="%" /></span>
              </div>
              <div className="hr-breakdown-row">
                <span className="hr-breakdown-name">Transcript Quality</span>
                <div className="hr-breakdown-line">
                  <AnimatedProgressFill targetWidth={96} className="hr-breakdown-progress" />
                </div>
                <span className="hr-breakdown-percent"><AnimatedNumber value={96} suffix="%" /></span>
              </div>
            </div>
            <div className="hr-trend-indicator positive">
              <span className="hr-trend-arrow">↑</span>
              <span className="hr-trend-text">Summary quality improved by 27%</span>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <article
      className="agent-feature-card hr-dashboard-style"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="agent-feature-title">{title}</h3>
      <p className="agent-feature-subtitle">{subtitle}</p>
      <div className="hr-card-content-wrapper">
        {renderCardContent()}
      </div>
    </article>
  );
};

// Enhanced GTM Sales Card Component
interface EnhancedGTMSalesCardProps {
  title: string;
  subtitle: string;
  type: 'lead-gen' | 'lead-enrich' | 'voice-calling' | 'campaign' | 'followups' | 'meeting-assistant' | 'analytics';
}

const EnhancedGTMSalesCard: React.FC<EnhancedGTMSalesCardProps> = ({ title, subtitle, type }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation hooks - only use for analytics type
  const pipelineValue = type === 'analytics' ? useCountUp(2.4, 2000) : { count: 2.4, elementRef: { current: null } };
  const winRate = type === 'analytics' ? useCountUp(34, 2000) : { count: 34, elementRef: { current: null } };
  const dealsClosed = type === 'analytics' ? useProgressAnimation(82, 2000) : { width: 82, elementRef: { current: null } };
  const avgDealSize = type === 'analytics' ? useProgressAnimation(75, 2000) : { width: 75, elementRef: { current: null } };
  const salesCycle = type === 'analytics' ? useProgressAnimation(68, 2000) : { width: 68, elementRef: { current: null } };

  const renderCardContent = () => {
    switch (type) {
      case 'lead-gen':
        return (
          <>
            <div className="sales-lead-stats">
              <div className="sales-stat-large">
                <div className="sales-stat-number"><AnimatedNumber value={2847} /></div>
                <div className="sales-stat-desc">Leads Generated</div>
              </div>
              <div className="sales-stat-large">
                <div className="sales-stat-number"><AnimatedNumber value={68} suffix="%" /></div>
                <div className="sales-stat-desc">Qualification Rate</div>
              </div>
            </div>
            {/* Line Graph for Lead Generation Trend */}
            <div className="sales-line-graph">
              <div className="sales-graph-title">Weekly Lead Generation</div>
              <div className="sales-graph-container">
                <svg className="sales-graph-svg" viewBox="0 0 200 100">
                  <polyline
                    points="10,80 30,65 50,55 70,45 90,40 110,35 130,30 150,28 170,25 190,22"
                    fill="none"
                    stroke="rgba(224, 128, 255, 0.8)"
                    strokeWidth="2"
                  />
                  <circle cx="10" cy="80" r="3" fill="rgba(224, 128, 255, 1)" />
                  <circle cx="50" cy="55" r="3" fill="rgba(224, 128, 255, 1)" />
                  <circle cx="110" cy="35" r="3" fill="rgba(224, 128, 255, 1)" />
                  <circle cx="190" cy="22" r="3" fill="rgba(224, 128, 255, 1)" />
                </svg>
              </div>
            </div>
            <div className="sales-lead-chart">
              <div className="sales-chart-item">
                <div className="sales-chart-label">High Intent</div>
                <div className="sales-chart-bar-container">
                  <AnimatedProgressBar targetWidth={72} barClassName="sales-chart-bar" valueClassName="sales-chart-value" />
                </div>
              </div>
              <div className="sales-chart-item">
                <div className="sales-chart-label">Medium Intent</div>
                <div className="sales-chart-bar-container">
                  <AnimatedProgressBar targetWidth={58} barClassName="sales-chart-bar" valueClassName="sales-chart-value" />
                </div>
              </div>
              <div className="sales-chart-item">
                <div className="sales-chart-label">Low Intent</div>
                <div className="sales-chart-bar-container">
                  <AnimatedProgressBar targetWidth={35} barClassName="sales-chart-bar" valueClassName="sales-chart-value" />
                </div>
              </div>
            </div>
            {/* Pie Chart Visual */}
            <div className="sales-pie-chart">
              <div className="sales-pie-title">Lead Distribution</div>
              <div className="sales-pie-visual">
                <div className="sales-pie-segment" style={{ background: 'conic-gradient(rgba(224, 128, 255, 0.8) 0deg 259deg, rgba(255, 255, 255, 0.1) 259deg 360deg)' }}></div>
              </div>
            </div>
            <div className="sales-trend-indicator">
              <span className="sales-trend-arrow">↑</span>
              <span className="sales-trend-text">Lead quality improved by 42%</span>
            </div>
          </>
        );
      case 'lead-enrich':
        return (
          <>
            <div className="sales-enrich-metrics">
              <div className="sales-metric-box">
                <div className="sales-metric-icon"></div>
                <div className="sales-metric-info">
                  <div className="sales-metric-number">1,892</div>
                  <div className="sales-metric-label">Companies Enriched</div>
                </div>
              </div>
              <div className="sales-metric-box">
                <div className="sales-metric-icon"></div>
                <div className="sales-metric-info">
                  <div className="sales-metric-number">94%</div>
                  <div className="sales-metric-label">Data Accuracy</div>
                </div>
              </div>
            </div>
            <div className="sales-enrich-breakdown">
              <div className="sales-breakdown-item">
                <div className="sales-breakdown-label">Company Insights</div>
                <div className="sales-breakdown-bar">
                  <div className="sales-breakdown-fill" style={{ width: '89%' }}></div>
                </div>
                <span className="sales-breakdown-value">89%</span>
              </div>
              <div className="sales-breakdown-item">
                <div className="sales-breakdown-label">Contact Details</div>
                <div className="sales-breakdown-bar">
                  <div className="sales-breakdown-fill" style={{ width: '92%' }}></div>
                </div>
                <span className="sales-breakdown-value">92%</span>
              </div>
              <div className="sales-breakdown-item">
                <div className="sales-breakdown-label">Tech Stack</div>
                <div className="sales-breakdown-bar">
                  <div className="sales-breakdown-fill" style={{ width: '85%' }}></div>
                </div>
                <span className="sales-breakdown-value">85%</span>
              </div>
            </div>
            <div className="sales-trend-indicator positive">
              <span className="sales-trend-arrow">↑</span>
              <span className="sales-trend-text">Enrichment speed up 38%</span>
            </div>
          </>
        );
      case 'voice-calling':
        return (
          <>
            <div className="sales-call-stats">
              <div className="sales-stat-card">
                <div className="sales-stat-value">3,247</div>
                <div className="sales-stat-label">Calls Made</div>
              </div>
              <div className="sales-stat-card">
                <div className="sales-stat-value">4.6/5</div>
                <div className="sales-stat-label">Avg. Call Quality</div>
              </div>
            </div>
            <div className="sales-call-progress">
              <div className="sales-progress-item">
                <div className="sales-progress-label">Connection Rate</div>
                <div className="sales-progress-track">
                  <div className="sales-progress-fill" style={{ width: '76%' }}></div>
                </div>
                <span className="sales-progress-percent">76%</span>
              </div>
              <div className="sales-progress-item">
                <div className="sales-progress-label">Engagement Rate</div>
                <div className="sales-progress-track">
                  <div className="sales-progress-fill" style={{ width: '68%' }}></div>
                </div>
                <span className="sales-progress-percent">68%</span>
              </div>
              <div className="sales-progress-item">
                <div className="sales-progress-label">Conversion Rate</div>
                <div className="sales-progress-track">
                  <div className="sales-progress-fill" style={{ width: '52%' }}></div>
                </div>
                <span className="sales-progress-percent">52%</span>
              </div>
            </div>
            <div className="sales-trend-indicator">
              <span className="sales-trend-arrow">↑</span>
              <span className="sales-trend-text">Call success rate increased by 29%</span>
            </div>
          </>
        );
      case 'campaign':
        return (
          <>
            <div className="sales-campaign-stats">
              <div className="sales-stat-box">
                <div className="sales-stat-icon"></div>
                <div className="sales-stat-details">
                  <div className="sales-stat-big"><AnimatedNumber value={12} /></div>
                  <div className="sales-stat-small">Active Campaigns</div>
                </div>
              </div>
              <div className="sales-stat-box">
                <div className="sales-stat-icon"></div>
                <div className="sales-stat-details">
                  <div className="sales-stat-big"><AnimatedNumber value={87} suffix="%" /></div>
                  <div className="sales-stat-small">Automation Rate</div>
                </div>
              </div>
            </div>
            <div className="sales-campaign-features">
              <div className="sales-feature-tag">Email</div>
              <div className="sales-feature-tag">SMS</div>
              <div className="sales-feature-tag">LinkedIn</div>
            </div>
            <div className="sales-campaign-breakdown">
              <div className="sales-breakdown-row">
                <span className="sales-breakdown-name">Open Rate</span>
                <div className="sales-breakdown-line">
                  <AnimatedProgressFill targetWidth={78} className="sales-breakdown-progress" />
                </div>
                <span className="sales-breakdown-percent"><AnimatedNumber value={78} suffix="%" /></span>
              </div>
              <div className="sales-breakdown-row">
                <span className="sales-breakdown-name">Click Rate</span>
                <div className="sales-breakdown-line">
                  <AnimatedProgressFill targetWidth={65} className="sales-breakdown-progress" />
                </div>
                <span className="sales-breakdown-percent"><AnimatedNumber value={65} suffix="%" /></span>
              </div>
              <div className="sales-breakdown-row">
                <span className="sales-breakdown-name">Response Rate</span>
                <div className="sales-breakdown-line">
                  <AnimatedProgressFill targetWidth={54} className="sales-breakdown-progress" />
                </div>
                <span className="sales-breakdown-percent"><AnimatedNumber value={54} suffix="%" /></span>
              </div>
            </div>
            <div className="sales-trend-indicator positive">
              <span className="sales-trend-arrow">↑</span>
              <span className="sales-trend-text">Campaign performance up 33%</span>
            </div>
          </>
        );
      case 'followups':
        return (
          <>
            <div className="sales-followup-stats">
              <div className="sales-overview-item">
                <div className="sales-overview-number"><AnimatedNumber value={1456} /></div>
                <div className="sales-overview-label">Follow-ups Sent</div>
              </div>
              <div className="sales-overview-item">
                <div className="sales-overview-number"><AnimatedNumber value={892} /></div>
                <div className="sales-overview-label">Responses Received</div>
              </div>
            </div>
            <div className="sales-followup-scores">
              <div className="sales-score-item">
                <div className="sales-score-label">Response Rate</div>
                <div className="sales-score-bar">
                  <AnimatedProgressFill targetWidth={61} className="sales-score-fill" />
                </div>
                <span className="sales-score-value"><AnimatedNumber value={61} suffix="%" /></span>
              </div>
              <div className="sales-score-item">
                <div className="sales-score-label">Follow-up Frequency</div>
                <div className="sales-score-bar">
                  <AnimatedProgressFill targetWidth={84} className="sales-score-fill" />
                </div>
                <span className="sales-score-value"><AnimatedNumber value={84} suffix="%" /></span>
              </div>
              <div className="sales-score-item">
                <div className="sales-score-label">Conversion Rate</div>
                <div className="sales-score-bar">
                  <AnimatedProgressFill targetWidth={48} className="sales-score-fill" />
                </div>
                <span className="sales-score-value"><AnimatedNumber value={48} suffix="%" /></span>
              </div>
            </div>
            <div className="sales-trend-indicator">
              <span className="sales-trend-arrow">↑</span>
              <span className="sales-trend-text">Follow-up effectiveness up 26%</span>
            </div>
          </>
        );
      case 'meeting-assistant':
        return (
          <>
            <div className="sales-meeting-stats">
              <div className="sales-stat-box">
                <div className="sales-stat-icon"></div>
                <div className="sales-stat-details">
                  <div className="sales-stat-big"><AnimatedNumber value={247} /></div>
                  <div className="sales-stat-small">Meetings Analyzed</div>
                </div>
              </div>
              <div className="sales-stat-box">
                <div className="sales-stat-icon"></div>
                <div className="sales-stat-details">
                  <div className="sales-stat-big"><AnimatedNumber value={96} suffix="%" /></div>
                  <div className="sales-stat-small">Insight Accuracy</div>
                </div>
              </div>
            </div>
            <div className="sales-meeting-features">
              <div className="sales-feature-tag">Transcripts</div>
              <div className="sales-feature-tag">Action Items</div>
              <div className="sales-feature-tag">Sentiment Analysis</div>
            </div>
            <div className="sales-meeting-breakdown">
              <div className="sales-breakdown-row">
                <span className="sales-breakdown-name">Key Insights</span>
                <div className="sales-breakdown-line">
                  <AnimatedProgressFill targetWidth={91} className="sales-breakdown-progress" />
                </div>
                <span className="sales-breakdown-percent"><AnimatedNumber value={91} suffix="%" /></span>
              </div>
              <div className="sales-breakdown-row">
                <span className="sales-breakdown-name">Action Items</span>
                <div className="sales-breakdown-line">
                  <AnimatedProgressFill targetWidth={88} className="sales-breakdown-progress" />
                </div>
                <span className="sales-breakdown-percent"><AnimatedNumber value={88} suffix="%" /></span>
              </div>
              <div className="sales-breakdown-row">
                <span className="sales-breakdown-name">Sentiment Score</span>
                <div className="sales-breakdown-line">
                  <AnimatedProgressFill targetWidth={85} className="sales-breakdown-progress" />
                </div>
                <span className="sales-breakdown-percent"><AnimatedNumber value={85} suffix="%" /></span>
              </div>
            </div>
            <div className="sales-trend-indicator positive">
              <span className="sales-trend-arrow">↑</span>
              <span className="sales-trend-text">Meeting insights quality up 31%</span>
            </div>
          </>
        );
      case 'analytics':
        return (
          <>
            <div className="sales-analytics-stats" ref={pipelineValue.elementRef} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div className="sales-stat-large" style={{ flex: 1, padding: '0.5rem' }}>
                <div className="sales-stat-number" style={{ fontSize: '1.5rem' }}>${pipelineValue.count.toFixed(1)}M</div>
                <div className="sales-stat-desc" style={{ fontSize: '0.75rem' }}>Pipeline Value</div>
              </div>
            </div>
            {/* Area Chart for Sales Performance */}
            <div className="sales-area-chart">
              <div className="sales-area-title">Monthly Sales Performance</div>
              <div className="sales-area-container">
                <AnimatedBar height={45} delay={0} />
                <AnimatedBar height={62} delay={100} />
                <AnimatedBar height={58} delay={200} />
                <AnimatedBar height={75} delay={300} />
                <AnimatedBar height={82} delay={400} />
                <AnimatedBar height={90} delay={500} />
              </div>
            </div>
            <div className="sales-analytics-chart">
              <div className="sales-chart-item">
                <div className="sales-chart-label">Deals Closed</div>
                <div className="sales-chart-bar-container" ref={dealsClosed.elementRef}>
                  <div className="sales-chart-bar" style={{ width: `${dealsClosed.width}%` }}></div>
                  <span className="sales-chart-value">{Math.round(dealsClosed.width)}%</span>
                </div>
              </div>
              <div className="sales-chart-item">
                <div className="sales-chart-label">Avg. Deal Size</div>
                <div className="sales-chart-bar-container" ref={avgDealSize.elementRef}>
                  <div className="sales-chart-bar" style={{ width: `${avgDealSize.width}%` }}></div>
                  <span className="sales-chart-value">{Math.round(avgDealSize.width)}%</span>
                </div>
              </div>
              <div className="sales-chart-item">
                <div className="sales-chart-label">Sales Cycle</div>
                <div className="sales-chart-bar-container" ref={salesCycle.elementRef}>
                  <div className="sales-chart-bar" style={{ width: `${salesCycle.width}%` }}></div>
                  <span className="sales-chart-value">{Math.round(salesCycle.width)}%</span>
                </div>
              </div>
            </div>
            <div className="sales-trend-indicator">
              <span className="sales-trend-arrow">↑</span>
              <span className="sales-trend-text">Revenue increased by 45%</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className={`agent-feature-card hr-dashboard-style ${type === 'analytics' ? 'sales-analytics-card' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="agent-feature-title">{title}</h3>
      <p className="agent-feature-subtitle">{subtitle}</p>
      <div className="hr-card-content-wrapper">
        {renderCardContent()}
      </div>
    </article>
  );
};

// Enhanced CFO Finance Card Component
interface EnhancedCFOCardProps {
  title: string;
  subtitle: string;
  type: 'automation' | 'cashflow' | 'expense' | 'revenue' | 'compliance' | 'reports';
}

const EnhancedCFOCard: React.FC<EnhancedCFOCardProps> = ({ title, subtitle, type }) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderCardContent = () => {
    switch (type) {
      case 'automation':
        return (
          <>
            <div className="cfo-automation-stats">
              <div className="cfo-stat-large">
                <div className="cfo-stat-number"><AnimatedNumber value={1247} /></div>
                <div className="cfo-stat-desc">Transactions Processed</div>
              </div>
              <div className="cfo-stat-large">
                <div className="cfo-stat-number"><AnimatedNumber value={98} suffix="%" /></div>
                <div className="cfo-stat-desc">Automation Rate</div>
              </div>
            </div>
            <div className="cfo-automation-chart">
              <div className="cfo-chart-item">
                <div className="cfo-chart-label">AP Automation</div>
                <div className="cfo-chart-bar-container">
                  <AnimatedProgressBar targetWidth={95} barClassName="cfo-chart-bar" valueClassName="cfo-chart-value" />
                </div>
              </div>
              <div className="cfo-chart-item">
                <div className="cfo-chart-label">AR Processing</div>
                <div className="cfo-chart-bar-container">
                  <AnimatedProgressBar targetWidth={92} barClassName="cfo-chart-bar" valueClassName="cfo-chart-value" />
                </div>
              </div>
              <div className="cfo-chart-item">
                <div className="cfo-chart-label">Reconciliation</div>
                <div className="cfo-chart-bar-container">
                  <AnimatedProgressBar targetWidth={88} barClassName="cfo-chart-bar" valueClassName="cfo-chart-value" />
                </div>
              </div>
            </div>
            <div className="cfo-trend-indicator">
              <span className="cfo-trend-arrow">↑</span>
              <span className="cfo-trend-text">Processing time reduced by 67%</span>
            </div>
          </>
        );
      case 'cashflow':
        return (
          <>
            <div className="cfo-cashflow-metrics">
              <div className="cfo-metric-box">
                <div className="cfo-metric-icon"></div>
                <div className="cfo-metric-info">
                  <div className="cfo-metric-number">$2.4M</div>
                  <div className="cfo-metric-label">Cash Balance</div>
                </div>
              </div>
              <div className="cfo-metric-box">
                <div className="cfo-metric-icon"></div>
                <div className="cfo-metric-info">
                  <div className="cfo-metric-number">18</div>
                  <div className="cfo-metric-label">Months Runway</div>
                </div>
              </div>
            </div>
            <div className="cfo-cashflow-breakdown">
              <div className="cfo-breakdown-item">
                <div className="cfo-breakdown-label">Burn Rate</div>
                <div className="cfo-breakdown-bar">
                  <div className="cfo-breakdown-fill" style={{ width: '72%' }}></div>
                </div>
                <span className="cfo-breakdown-value">-$125K/mo</span>
              </div>
              <div className="cfo-breakdown-item">
                <div className="cfo-breakdown-label">Revenue Growth</div>
                <div className="cfo-breakdown-bar">
                  <div className="cfo-breakdown-fill" style={{ width: '85%' }}></div>
                </div>
                <span className="cfo-breakdown-value">+28%</span>
              </div>
              <div className="cfo-breakdown-item">
                <div className="cfo-breakdown-label">Cash Flow Health</div>
                <div className="cfo-breakdown-bar">
                  <div className="cfo-breakdown-fill" style={{ width: '91%' }}></div>
                </div>
                <span className="cfo-breakdown-value">91%</span>
              </div>
            </div>
            <div className="cfo-trend-indicator positive">
              <span className="cfo-trend-arrow">↑</span>
              <span className="cfo-trend-text">Runway extended by 4 months</span>
            </div>
          </>
        );
      case 'expense':
        return (
          <>
            <div className="cfo-expense-stats">
              <div className="cfo-stat-card">
                <div className="cfo-stat-value">$892K</div>
                <div className="cfo-stat-label">Total Expenses</div>
              </div>
              <div className="cfo-stat-card">
                <div className="cfo-stat-value">$156K</div>
                <div className="cfo-stat-label">Cost Saved</div>
              </div>
            </div>
            <div className="cfo-expense-progress">
              <div className="cfo-progress-item">
                <div className="cfo-progress-label">Anomaly Detection</div>
                <div className="cfo-progress-track">
                  <div className="cfo-progress-fill" style={{ width: '94%' }}></div>
                </div>
                <span className="cfo-progress-percent">94%</span>
              </div>
              <div className="cfo-progress-item">
                <div className="cfo-progress-label">Category Tracking</div>
                <div className="cfo-progress-track">
                  <div className="cfo-progress-fill" style={{ width: '89%' }}></div>
                </div>
                <span className="cfo-progress-percent">89%</span>
              </div>
              <div className="cfo-progress-item">
                <div className="cfo-progress-label">Budget Compliance</div>
                <div className="cfo-progress-track">
                  <div className="cfo-progress-fill" style={{ width: '87%' }}></div>
                </div>
                <span className="cfo-progress-percent">87%</span>
              </div>
            </div>
            <div className="cfo-trend-indicator">
              <span className="cfo-trend-arrow">↑</span>
              <span className="cfo-trend-text">Cost savings increased by 23%</span>
            </div>
          </>
        );
      case 'revenue':
        return (
          <>
            <div className="cfo-revenue-stats">
              <div className="cfo-stat-box">
                <div className="cfo-stat-icon"></div>
                <div className="cfo-stat-details">
                  <div className="cfo-stat-big">$4.2M</div>
                  <div className="cfo-stat-small">Total Revenue</div>
                </div>
              </div>
              <div className="cfo-stat-box">
                <div className="cfo-stat-icon"></div>
                <div className="cfo-stat-details">
                  <div className="cfo-stat-big">+32%</div>
                  <div className="cfo-stat-small">Growth Rate</div>
                </div>
              </div>
            </div>
            <div className="cfo-revenue-features">
              <div className="cfo-feature-tag">P&L Reports</div>
              <div className="cfo-feature-tag">Balance Sheets</div>
              <div className="cfo-feature-tag">Forecasts</div>
            </div>
            <div className="cfo-revenue-breakdown">
              <div className="cfo-breakdown-row">
                <span className="cfo-breakdown-name">Revenue Accuracy</span>
                <div className="cfo-breakdown-line">
                  <AnimatedProgressFill targetWidth={96} className="cfo-breakdown-progress" />
                </div>
                <span className="cfo-breakdown-percent"><AnimatedNumber value={96} suffix="%" /></span>
              </div>
              <div className="cfo-breakdown-row">
                <span className="cfo-breakdown-name">Forecast Precision</span>
                <div className="cfo-breakdown-line">
                  <AnimatedProgressFill targetWidth={89} className="cfo-breakdown-progress" />
                </div>
                <span className="cfo-breakdown-percent"><AnimatedNumber value={89} suffix="%" /></span>
              </div>
              <div className="cfo-breakdown-row">
                <span className="cfo-breakdown-name">Report Generation</span>
                <div className="cfo-breakdown-line">
                  <AnimatedProgressFill targetWidth={93} className="cfo-breakdown-progress" />
                </div>
                <span className="cfo-breakdown-percent"><AnimatedNumber value={93} suffix="%" /></span>
              </div>
            </div>
            <div className="cfo-trend-indicator positive">
              <span className="cfo-trend-arrow">↑</span>
              <span className="cfo-trend-text">Revenue insights improved by 41%</span>
            </div>
          </>
        );
      case 'compliance':
        return (
          <>
            <div className="cfo-compliance-stats">
              <div className="cfo-overview-item">
                <div className="cfo-overview-number">100%</div>
                <div className="cfo-overview-label">Compliance Rate</div>
              </div>
              <div className="cfo-overview-item">
                <div className="cfo-overview-number">0</div>
                <div className="cfo-overview-label">Violations</div>
              </div>
            </div>
            <div className="cfo-compliance-scores">
              <div className="cfo-score-item">
                <div className="cfo-score-label">PDPL Compliance</div>
                <div className="cfo-score-bar">
                  <AnimatedProgressFill targetWidth={100} className="cfo-score-fill" />
                </div>
                <span className="cfo-score-value"><AnimatedNumber value={100} suffix="%" /></span>
              </div>
              <div className="cfo-score-item">
                <div className="cfo-score-label">NCA Alignment</div>
                <div className="cfo-score-bar">
                  <AnimatedProgressFill targetWidth={98} className="cfo-score-fill" />
                </div>
                <span className="cfo-score-value"><AnimatedNumber value={98} suffix="%" /></span>
              </div>
              <div className="cfo-score-item">
                <div className="cfo-score-label">HIPAA Compliance</div>
                <div className="cfo-score-bar">
                  <AnimatedProgressFill targetWidth={97} className="cfo-score-fill" />
                </div>
                <span className="cfo-score-value"><AnimatedNumber value={97} suffix="%" /></span>
              </div>
            </div>
            <div className="cfo-trend-indicator">
              <span className="cfo-trend-arrow">↑</span>
              <span className="cfo-trend-text">All compliance checks passed</span>
            </div>
          </>
        );
      case 'reports':
        return (
          <>
            <div className="cfo-reports-stats">
              <div className="cfo-stat-box">
                <div className="cfo-stat-icon"></div>
                <div className="cfo-stat-details">
                  <div className="cfo-stat-big">156</div>
                  <div className="cfo-stat-small">Reports Generated</div>
                </div>
              </div>
              <div className="cfo-stat-box">
                <div className="cfo-stat-icon"></div>
                <div className="cfo-stat-details">
                  <div className="cfo-stat-big">98%</div>
                  <div className="cfo-stat-small">Investor Ready</div>
                </div>
              </div>
            </div>
            <div className="cfo-reports-features">
              <div className="cfo-feature-tag">Financial Summaries</div>
              <div className="cfo-feature-tag">Investor Reports</div>
              <div className="cfo-feature-tag">Executive Dashboards</div>
            </div>
            <div className="cfo-reports-breakdown">
              <div className="cfo-breakdown-row">
                <span className="cfo-breakdown-name">Report Quality</span>
                <div className="cfo-breakdown-line">
                  <div className="cfo-breakdown-progress" style={{ width: '97%' }}></div>
                </div>
                <span className="cfo-breakdown-percent">97%</span>
              </div>
              <div className="cfo-breakdown-row">
                <span className="cfo-breakdown-name">Data Accuracy</span>
                <div className="cfo-breakdown-line">
                  <div className="cfo-breakdown-progress" style={{ width: '99%' }}></div>
                </div>
                <span className="cfo-breakdown-percent">99%</span>
              </div>
              <div className="cfo-breakdown-row">
                <span className="cfo-breakdown-name">Generation Speed</span>
                <div className="cfo-breakdown-line">
                  <div className="cfo-breakdown-progress" style={{ width: '94%' }}></div>
                </div>
                <span className="cfo-breakdown-percent">94%</span>
              </div>
            </div>
            <div className="cfo-trend-indicator positive">
              <span className="cfo-trend-arrow">↑</span>
              <span className="cfo-trend-text">Report generation speed up 52%</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className="agent-feature-card hr-dashboard-style"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="agent-feature-title">{title}</h3>
      <p className="agent-feature-subtitle">{subtitle}</p>
      <div className="hr-card-content-wrapper">
        {renderCardContent()}
      </div>
    </article>
  );
};

// Enhanced Customer Support Card Component
interface EnhancedSupportCardProps {
  title: string;
  subtitle: string;
  type: 'multichannel' | 'availability' | 'tickets' | 'knowledge' | 'voice' | 'analytics';
}

const EnhancedSupportCard: React.FC<EnhancedSupportCardProps> = ({ title, subtitle, type }) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderCardContent = () => {
    switch (type) {
      case 'multichannel':
        return (
          <>
            <div className="support-channel-stats">
              <div className="support-stat-large">
                <div className="support-stat-number"><AnimatedNumber value={8247} /></div>
                <div className="support-stat-desc">Queries Resolved</div>
              </div>
              <div className="support-stat-large">
                <div className="support-stat-number"><AnimatedNumber value={94} suffix="%" /></div>
                <div className="support-stat-desc">Resolution Rate</div>
              </div>
            </div>
            <div className="support-channel-chart">
              <div className="support-chart-item">
                <div className="support-chart-label">Chat</div>
                <div className="support-chart-bar-container">
                  <AnimatedProgressBar targetWidth={78} barClassName="support-chart-bar" valueClassName="support-chart-value" />
                </div>
              </div>
              <div className="support-chart-item">
                <div className="support-chart-label">Email</div>
                <div className="support-chart-bar-container">
                  <AnimatedProgressBar targetWidth={85} barClassName="support-chart-bar" valueClassName="support-chart-value" />
                </div>
              </div>
              <div className="support-chart-item">
                <div className="support-chart-label">Voice</div>
                <div className="support-chart-bar-container">
                  <AnimatedProgressBar targetWidth={72} barClassName="support-chart-bar" valueClassName="support-chart-value" />
                </div>
              </div>
            </div>
            {/* Visual Icon */}
            <div className="support-trend-indicator">
              <span className="support-trend-arrow">↑</span>
              <span className="support-trend-text">Multi-channel efficiency up 38%</span>
            </div>
          </>
        );
      case 'availability':
        return (
          <>
            <div className="support-availability-metrics">
              <div className="support-metric-box">
                <div className="support-metric-icon"></div>
                <div className="support-metric-info">
                  <div className="support-metric-number">24/7</div>
                  <div className="support-metric-label">Availability</div>
                </div>
              </div>
              <div className="support-metric-box">
                <div className="support-metric-icon"></div>
                <div className="support-metric-info">
                  <div className="support-metric-number">1.2s</div>
                  <div className="support-metric-label">Avg Response Time</div>
                </div>
              </div>
            </div>
            <div className="support-availability-breakdown">
              <div className="support-breakdown-item">
                <div className="support-breakdown-label">Uptime</div>
                <div className="support-breakdown-bar">
                  <div className="support-breakdown-fill" style={{ width: '99.9%' }}></div>
                </div>
                <span className="support-breakdown-value">99.9%</span>
              </div>
              <div className="support-breakdown-item">
                <div className="support-breakdown-label">Response Speed</div>
                <div className="support-breakdown-bar">
                  <div className="support-breakdown-fill" style={{ width: '96%' }}></div>
                </div>
                <span className="support-breakdown-value">96%</span>
              </div>
              <div className="support-breakdown-item">
                <div className="support-breakdown-label">Accuracy</div>
                <div className="support-breakdown-bar">
                  <div className="support-breakdown-fill" style={{ width: '93%' }}></div>
                </div>
                <span className="support-breakdown-value">93%</span>
              </div>
            </div>
            <div className="support-trend-indicator positive">
              <span className="support-trend-arrow">↑</span>
              <span className="support-trend-text">Response time improved by 45%</span>
            </div>
          </>
        );
      case 'tickets':
        return (
          <>
            <div className="support-ticket-stats">
              <div className="support-stat-card">
                <div className="support-stat-value">3,456</div>
                <div className="support-stat-label">Tickets Created</div>
              </div>
              <div className="support-stat-card">
                <div className="support-stat-value">89%</div>
                <div className="support-stat-label">Auto-Resolved</div>
              </div>
            </div>
            <div className="support-ticket-progress">
              <div className="support-progress-item">
                <div className="support-progress-label">Auto-Assignment</div>
                <div className="support-progress-track">
                  <div className="support-progress-fill" style={{ width: '92%' }}></div>
                </div>
                <span className="support-progress-percent">92%</span>
              </div>
              <div className="support-progress-item">
                <div className="support-progress-label">Priority Routing</div>
                <div className="support-progress-track">
                  <div className="support-progress-fill" style={{ width: '88%' }}></div>
                </div>
                <span className="support-progress-percent">88%</span>
              </div>
              <div className="support-progress-item">
                <div className="support-progress-label">Resolution Tracking</div>
                <div className="support-progress-track">
                  <div className="support-progress-fill" style={{ width: '95%' }}></div>
                </div>
                <span className="support-progress-percent">95%</span>
              </div>
            </div>
            <div className="support-trend-indicator">
              <span className="support-trend-arrow">↑</span>
              <span className="support-trend-text">Ticket resolution up 41%</span>
            </div>
          </>
        );
      case 'knowledge':
        return (
          <>
            <div className="support-knowledge-stats">
              <div className="support-stat-box">
                <div className="support-stat-icon"></div>
                <div className="support-stat-details">
                  <div className="support-stat-big">1,247</div>
                  <div className="support-stat-small">Articles Learned</div>
                </div>
              </div>
              <div className="support-stat-box">
                <div className="support-stat-icon"></div>
                <div className="support-stat-details">
                  <div className="support-stat-big">87%</div>
                  <div className="support-stat-small">Auto-Updated</div>
                </div>
              </div>
            </div>
            <div className="support-knowledge-features">
              <div className="support-feature-tag">Doc Learning</div>
              <div className="support-feature-tag">FAQ Updates</div>
              <div className="support-feature-tag">Context Understanding</div>
            </div>
            <div className="support-knowledge-breakdown">
              <div className="support-breakdown-row">
                <span className="support-breakdown-name">Knowledge Accuracy</span>
                <div className="support-breakdown-line">
                  <div className="support-breakdown-progress" style={{ width: '94%' }}></div>
                </div>
                <span className="support-breakdown-percent">94%</span>
              </div>
              <div className="support-breakdown-row">
                <span className="support-breakdown-name">Update Frequency</span>
                <div className="support-breakdown-line">
                  <div className="support-breakdown-progress" style={{ width: '91%' }}></div>
                </div>
                <span className="support-breakdown-percent">91%</span>
              </div>
              <div className="support-breakdown-row">
                <span className="support-breakdown-name">Relevance Score</span>
                <div className="support-breakdown-line">
                  <div className="support-breakdown-progress" style={{ width: '89%' }}></div>
                </div>
                <span className="support-breakdown-percent">89%</span>
              </div>
            </div>
            <div className="support-trend-indicator positive">
              <span className="support-trend-arrow">↑</span>
              <span className="support-trend-text">Knowledge base quality up 36%</span>
            </div>
          </>
        );
      case 'voice':
        return (
          <>
            <div className="support-voice-stats">
              <div className="support-overview-item">
                <div className="support-overview-number">2,156</div>
                <div className="support-overview-label">Voice Calls Handled</div>
              </div>
              <div className="support-overview-item">
                <div className="support-overview-number">4.8/5</div>
                <div className="support-overview-label">Call Quality Score</div>
              </div>
            </div>
            <div className="support-voice-scores">
              <div className="support-score-item">
                <div className="support-score-label">Verification Rate</div>
                <div className="support-score-bar">
                  <AnimatedProgressFill targetWidth={96} className="support-score-fill" />
                </div>
                <span className="support-score-value"><AnimatedNumber value={96} suffix="%" /></span>
              </div>
              <div className="support-score-item">
                <div className="support-score-label">Callback Success</div>
                <div className="support-score-bar">
                  <AnimatedProgressFill targetWidth={89} className="support-score-fill" />
                </div>
                <span className="support-score-value"><AnimatedNumber value={89} suffix="%" /></span>
              </div>
              <div className="support-score-item">
                <div className="support-score-label">Status Updates</div>
                <div className="support-score-bar">
                  <AnimatedProgressFill targetWidth={92} className="support-score-fill" />
                </div>
                <span className="support-score-value"><AnimatedNumber value={92} suffix="%" /></span>
              </div>
            </div>
            <div className="support-trend-indicator">
              <span className="support-trend-arrow">↑</span>
              <span className="support-trend-text">Voice support quality up 28%</span>
            </div>
          </>
        );
      case 'analytics':
        return (
          <>
            <div className="support-analytics-stats">
              <div className="support-stat-box">
                <div className="support-stat-icon"></div>
                <div className="support-stat-details">
                  <div className="support-stat-big">4.7/5</div>
                  <div className="support-stat-small">CSAT Score</div>
                </div>
              </div>
              <div className="support-stat-box">
                <div className="support-stat-icon">⚡</div>
                <div className="support-stat-details">
                  <div className="support-stat-big">1.8s</div>
                  <div className="support-stat-small">Avg Response</div>
                </div>
              </div>
            </div>
            <div className="support-analytics-features">
              <div className="support-feature-tag">Response Time</div>
              <div className="support-feature-tag">CSAT Tracking</div>
              <div className="support-feature-tag">Volume Trends</div>
            </div>
            <div className="support-analytics-breakdown">
              <div className="support-breakdown-row">
                <span className="support-breakdown-name">Response Time</span>
                <div className="support-breakdown-line">
                  <div className="support-breakdown-progress" style={{ width: '91%' }}></div>
                </div>
                <span className="support-breakdown-percent">91%</span>
              </div>
              <div className="support-breakdown-row">
                <span className="support-breakdown-name">Customer Satisfaction</span>
                <div className="support-breakdown-line">
                  <div className="support-breakdown-progress" style={{ width: '94%' }}></div>
                </div>
                <span className="support-breakdown-percent">94%</span>
              </div>
              <div className="support-breakdown-row">
                <span className="support-breakdown-name">Volume Management</span>
                <div className="support-breakdown-line">
                  <div className="support-breakdown-progress" style={{ width: '87%' }}></div>
                </div>
                <span className="support-breakdown-percent">87%</span>
              </div>
            </div>
            <div className="support-trend-indicator positive">
              <span className="support-trend-arrow">↑</span>
              <span className="support-trend-text">Support metrics improved by 33%</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className="agent-feature-card hr-dashboard-style"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="agent-feature-title">{title}</h3>
      <p className="agent-feature-subtitle">{subtitle}</p>
      <div className="hr-card-content-wrapper">
        {renderCardContent()}
      </div>
    </article>
  );
};

// Enhanced Real Estate Card Component
interface EnhancedRealEstateCardProps {
  title: string;
  subtitle: string;
  type: 'matching' | 'calling' | 'scheduling' | 'issues' | 'maintenance' | 'renewals';
}

const EnhancedRealEstateCard: React.FC<EnhancedRealEstateCardProps> = ({ title, subtitle, type }) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderCardContent = () => {
    switch (type) {
      case 'matching':
        return (
          <>
            <div className="re-matching-stats">
              <div className="re-stat-large">
                <div className="re-stat-number"><AnimatedNumber value={1847} /></div>
                <div className="re-stat-desc">Properties Matched</div>
              </div>
              <div className="re-stat-large">
                <div className="re-stat-number"><AnimatedNumber value={89} suffix="%" /></div>
                <div className="re-stat-desc">Match Accuracy</div>
              </div>
            </div>
            <div className="re-matching-chart">
              <div className="re-chart-item">
                <div className="re-chart-label">Perfect Match</div>
                <div className="re-chart-bar-container">
                  <AnimatedProgressBar targetWidth={82} barClassName="re-chart-bar" valueClassName="re-chart-value" />
                </div>
              </div>
              <div className="re-chart-item">
                <div className="re-chart-label">Good Match</div>
                <div className="re-chart-bar-container">
                  <AnimatedProgressBar targetWidth={75} barClassName="re-chart-bar" valueClassName="re-chart-value" />
                </div>
              </div>
              <div className="re-chart-item">
                <div className="re-chart-label">Partial Match</div>
                <div className="re-chart-bar-container">
                  <AnimatedProgressBar targetWidth={68} barClassName="re-chart-bar" valueClassName="re-chart-value" />
                </div>
              </div>
            </div>
            <div className="re-trend-indicator">
              <span className="re-trend-arrow">↑</span>
              <span className="re-trend-text">Matching accuracy improved by 31%</span>
            </div>
          </>
        );
      case 'calling':
        return (
          <>
            <div className="re-calling-metrics">
              <div className="re-metric-box">
                <div className="re-metric-icon"></div>
                <div className="re-metric-info">
                  <div className="re-metric-number">2,456</div>
                  <div className="re-metric-label">Calls Made</div>
                </div>
              </div>
              <div className="re-metric-box">
                <div className="re-metric-icon"></div>
                <div className="re-metric-info">
                  <div className="re-metric-number">12</div>
                  <div className="re-metric-label">Languages</div>
                </div>
              </div>
            </div>
            <div className="re-calling-breakdown">
              <div className="re-breakdown-item">
                <div className="re-breakdown-label">Qualification Rate</div>
                <div className="re-breakdown-bar">
                  <div className="re-breakdown-fill" style={{ width: '76%' }}></div>
                </div>
                <span className="re-breakdown-value">76%</span>
              </div>
              <div className="re-breakdown-item">
                <div className="re-breakdown-label">Conversion Rate</div>
                <div className="re-breakdown-bar">
                  <div className="re-breakdown-fill" style={{ width: '64%' }}></div>
                </div>
                <span className="re-breakdown-value">64%</span>
              </div>
              <div className="re-breakdown-item">
                <div className="re-breakdown-label">Engagement Rate</div>
                <div className="re-breakdown-bar">
                  <div className="re-breakdown-fill" style={{ width: '71%' }}></div>
                </div>
                <span className="re-breakdown-value">71%</span>
              </div>
            </div>
            <div className="re-trend-indicator positive">
              <span className="re-trend-arrow">↑</span>
              <span className="re-trend-text">Lead quality improved by 27%</span>
            </div>
          </>
        );
      case 'scheduling':
        return (
          <>
            <div className="re-scheduling-stats">
              <div className="re-stat-card">
                <div className="re-stat-value">892</div>
                <div className="re-stat-label">Viewings Scheduled</div>
              </div>
              <div className="re-stat-card">
                <div className="re-stat-value">94%</div>
                <div className="re-stat-label">Confirmation Rate</div>
              </div>
            </div>
            <div className="re-scheduling-progress">
              <div className="re-progress-item">
                <div className="re-progress-label">Booking Efficiency</div>
                <div className="re-progress-track">
                  <div className="re-progress-fill" style={{ width: '88%' }}></div>
                </div>
                <span className="re-progress-percent">88%</span>
              </div>
              <div className="re-progress-item">
                <div className="re-progress-label">Confirmation Rate</div>
                <div className="re-progress-track">
                  <div className="re-progress-fill" style={{ width: '94%' }}></div>
                </div>
                <span className="re-progress-percent">94%</span>
              </div>
              <div className="re-progress-item">
                <div className="re-progress-label">No-Show Rate</div>
                <div className="re-progress-track">
                  <div className="re-progress-fill" style={{ width: '12%' }}></div>
                </div>
                <span className="re-progress-percent">12%</span>
              </div>
            </div>
            <div className="re-trend-indicator">
              <span className="re-trend-arrow">↑</span>
              <span className="re-trend-text">Scheduling efficiency up 35%</span>
            </div>
          </>
        );
      case 'issues':
        return (
          <>
            <div className="re-issues-stats">
              <div className="re-stat-box">
                <div className="re-stat-icon"></div>
                <div className="re-stat-details">
                  <div className="re-stat-big">456</div>
                  <div className="re-stat-small">Issues Resolved</div>
                </div>
              </div>
              <div className="re-stat-box">
                <div className="re-stat-icon"></div>
                <div className="re-stat-details">
                  <div className="re-stat-big">2.4h</div>
                  <div className="re-stat-small">Avg Resolution</div>
                </div>
              </div>
            </div>
            <div className="re-issues-features">
              <div className="re-feature-tag">Issue Diagnosis</div>
              <div className="re-feature-tag">Ticket Creation</div>
              <div className="re-feature-tag">Priority Routing</div>
            </div>
            <div className="re-issues-breakdown">
              <div className="re-breakdown-row">
                <span className="re-breakdown-name">Diagnosis Accuracy</span>
                <div className="re-breakdown-line">
                  <div className="re-breakdown-progress" style={{ width: '91%' }}></div>
                </div>
                <span className="re-breakdown-percent">91%</span>
              </div>
              <div className="re-breakdown-row">
                <span className="re-breakdown-name">Response Time</span>
                <div className="re-breakdown-line">
                  <div className="re-breakdown-progress" style={{ width: '87%' }}></div>
                </div>
                <span className="re-breakdown-percent">87%</span>
              </div>
              <div className="re-breakdown-row">
                <span className="re-breakdown-name">Resolution Rate</span>
                <div className="re-breakdown-line">
                  <div className="re-breakdown-progress" style={{ width: '89%' }}></div>
                </div>
                <span className="re-breakdown-percent">89%</span>
              </div>
            </div>
            <div className="re-trend-indicator positive">
              <span className="re-trend-arrow">↑</span>
              <span className="re-trend-text">Issue resolution up 29%</span>
            </div>
          </>
        );
      case 'maintenance':
        return (
          <>
            <div className="re-maintenance-stats">
              <div className="re-overview-item">
                <div className="re-overview-number">1,247</div>
                <div className="re-overview-label">Tasks Assigned</div>
              </div>
              <div className="re-overview-item">
                <div className="re-overview-number">96%</div>
                <div className="re-overview-label">Completion Rate</div>
              </div>
            </div>
            <div className="re-maintenance-scores">
              <div className="re-score-item">
                <div className="re-score-label">Auto-Assignment</div>
                <div className="re-score-bar">
                  <div className="re-score-fill" style={{ width: '93%' }}></div>
                </div>
                <span className="re-score-value">93%</span>
              </div>
              <div className="re-score-item">
                <div className="re-score-label">Task Tracking</div>
                <div className="re-score-bar">
                  <div className="re-score-fill" style={{ width: '97%' }}></div>
                </div>
                <span className="re-score-value">97%</span>
              </div>
              <div className="re-score-item">
                <div className="re-score-label">Completion Rate</div>
                <div className="re-score-bar">
                  <div className="re-score-fill" style={{ width: '96%' }}></div>
                </div>
                <span className="re-score-value">96%</span>
              </div>
            </div>
            <div className="re-trend-indicator">
              <span className="re-trend-arrow">↑</span>
              <span className="re-trend-text">Maintenance efficiency up 41%</span>
            </div>
          </>
        );
      case 'renewals':
        return (
          <>
            <div className="re-renewals-stats">
              <div className="re-stat-box">
                <div className="re-stat-icon"></div>
                <div className="re-stat-details">
                  <div className="re-stat-big">347</div>
                  <div className="re-stat-small">Renewals Processed</div>
                </div>
              </div>
              <div className="re-stat-box">
                <div className="re-stat-icon"></div>
                <div className="re-stat-details">
                  <div className="re-stat-big">78%</div>
                  <div className="re-stat-small">Retention Rate</div>
                </div>
              </div>
            </div>
            <div className="re-renewals-features">
              <div className="re-feature-tag">Auto-Renewals</div>
              <div className="re-feature-tag">Offer Generation</div>
              <div className="re-feature-tag">Client Nurturing</div>
            </div>
            <div className="re-renewals-breakdown">
              <div className="re-breakdown-row">
                <span className="re-breakdown-name">Renewal Rate</span>
                <div className="re-breakdown-line">
                  <div className="re-breakdown-progress" style={{ width: '78%' }}></div>
                </div>
                <span className="re-breakdown-percent">78%</span>
              </div>
              <div className="re-breakdown-row">
                <span className="re-breakdown-name">Offer Acceptance</span>
                <div className="re-breakdown-line">
                  <div className="re-breakdown-progress" style={{ width: '72%' }}></div>
                </div>
                <span className="re-breakdown-percent">72%</span>
              </div>
              <div className="re-breakdown-row">
                <span className="re-breakdown-name">Client Satisfaction</span>
                <div className="re-breakdown-line">
                  <div className="re-breakdown-progress" style={{ width: '85%' }}></div>
                </div>
                <span className="re-breakdown-percent">85%</span>
              </div>
            </div>
            <div className="re-trend-indicator positive">
              <span className="re-trend-arrow">↑</span>
              <span className="re-trend-text">Retention rate improved by 24%</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className="agent-feature-card hr-dashboard-style"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="agent-feature-title">{title}</h3>
      <p className="agent-feature-subtitle">{subtitle}</p>
      <div className="hr-card-content-wrapper">
        {renderCardContent()}
      </div>
    </article>
  );
};

// Enhanced Healthcare Card Component
interface EnhancedHealthcareCardProps {
  title: string;
  subtitle: string;
  type: 'intake' | 'triage' | 'scheduling' | 'lab' | 'wellness' | 'coordination';
}

const EnhancedHealthcareCard: React.FC<EnhancedHealthcareCardProps> = ({ title, subtitle, type }) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderCardContent = () => {
    switch (type) {
      case 'intake':
        return (
          <>
            <div className="health-intake-stats">
              <div className="health-stat-large">
                <div className="health-stat-number"><AnimatedNumber value={3247} /></div>
                <div className="health-stat-desc">Patients Intake</div>
              </div>
              <div className="health-stat-large">
                <div className="health-stat-number"><AnimatedNumber value={96} suffix="%" /></div>
                <div className="health-stat-desc">Data Accuracy</div>
              </div>
            </div>
            {/* Area Chart for Patient Intake */}
            <div className="health-area-chart">
              <div className="health-area-title">Daily Patient Intake</div>
              <div className="health-area-container">
                <AnimatedBar height={55} delay={0} />
                <AnimatedBar height={68} delay={100} />
                <AnimatedBar height={72} delay={200} />
                <AnimatedBar height={65} delay={300} />
                <AnimatedBar height={80} delay={400} />
                <AnimatedBar height={88} delay={500} />
                <AnimatedBar height={92} delay={600} />
              </div>
            </div>
            <div className="health-intake-chart">
              <div className="health-chart-item">
                <div className="health-chart-label">Symptom Collection</div>
                <div className="health-chart-bar-container">
                  <AnimatedProgressBar targetWidth={94} barClassName="health-chart-bar" valueClassName="health-chart-value" />
                </div>
              </div>
              <div className="health-chart-item">
                <div className="health-chart-label">Context Gathering</div>
                <div className="health-chart-bar-container">
                  <AnimatedProgressBar targetWidth={91} barClassName="health-chart-bar" valueClassName="health-chart-value" />
                </div>
              </div>
              <div className="health-chart-item">
                <div className="health-chart-label">Medical History</div>
                <div className="health-chart-bar-container">
                  <AnimatedProgressBar targetWidth={88} barClassName="health-chart-bar" valueClassName="health-chart-value" />
                </div>
              </div>
            </div>
            {/* Visual Icon */}
            <div className="health-trend-indicator">
              <span className="health-trend-arrow">↑</span>
              <span className="health-trend-text">Intake quality improved by 38%</span>
            </div>
          </>
        );
      case 'triage':
        return (
          <>
            <div className="health-triage-metrics">
              <div className="health-metric-box">
                <div className="health-metric-icon"></div>
                <div className="health-metric-info">
                  <div className="health-metric-number">2,156</div>
                  <div className="health-metric-label">Cases Routed</div>
                </div>
              </div>
              <div className="health-metric-box">
                <div className="health-metric-icon"></div>
                <div className="health-metric-info">
                  <div className="health-metric-number">100%</div>
                  <div className="health-metric-label">Safety Rate</div>
                </div>
              </div>
            </div>
            <div className="health-triage-breakdown">
              <div className="health-breakdown-item">
                <div className="health-breakdown-label">Routing Accuracy</div>
                <div className="health-breakdown-bar">
                  <div className="health-breakdown-fill" style={{ width: '97%' }}></div>
                </div>
                <span className="health-breakdown-value">97%</span>
              </div>
              <div className="health-breakdown-item">
                <div className="health-breakdown-label">Safety Compliance</div>
                <div className="health-breakdown-bar">
                  <div className="health-breakdown-fill" style={{ width: '100%' }}></div>
                </div>
                <span className="health-breakdown-value">100%</span>
              </div>
              <div className="health-breakdown-item">
                <div className="health-breakdown-label">Response Time</div>
                <div className="health-breakdown-bar">
                  <div className="health-breakdown-fill" style={{ width: '92%' }}></div>
                </div>
                <span className="health-breakdown-value">92%</span>
              </div>
            </div>
            <div className="health-trend-indicator positive">
              <span className="health-trend-arrow">↑</span>
              <span className="health-trend-text">All cases routed safely</span>
            </div>
          </>
        );
      case 'scheduling':
        return (
          <>
            <div className="health-scheduling-stats">
              <div className="health-stat-card">
                <div className="health-stat-value">4,892</div>
                <div className="health-stat-label">Appointments Booked</div>
              </div>
              <div className="health-stat-card">
                <div className="health-stat-value">91%</div>
                <div className="health-stat-label">Confirmation Rate</div>
              </div>
            </div>
            <div className="health-scheduling-progress">
              <div className="health-progress-item">
                <div className="health-progress-label">Booking Efficiency</div>
                <div className="health-progress-track">
                  <div className="health-progress-fill" style={{ width: '95%' }}></div>
                </div>
                <span className="health-progress-percent">95%</span>
              </div>
              <div className="health-progress-item">
                <div className="health-progress-label">Reminder Delivery</div>
                <div className="health-progress-track">
                  <div className="health-progress-fill" style={{ width: '98%' }}></div>
                </div>
                <span className="health-progress-percent">98%</span>
              </div>
              <div className="health-progress-item">
                <div className="health-progress-label">Follow-up Scheduling</div>
                <div className="health-progress-track">
                  <div className="health-progress-fill" style={{ width: '89%' }}></div>
                </div>
                <span className="health-progress-percent">89%</span>
              </div>
            </div>
            <div className="health-trend-indicator">
              <span className="health-trend-arrow">↑</span>
              <span className="health-trend-text">Scheduling efficiency up 42%</span>
            </div>
          </>
        );
      case 'lab':
        return (
          <>
            <div className="health-lab-stats">
              <div className="health-stat-box">
                <div className="health-stat-icon"></div>
                <div className="health-stat-details">
                  <div className="health-stat-big">1,456</div>
                  <div className="health-stat-small">Results Explained</div>
                </div>
              </div>
              <div className="health-stat-box">
                <div className="health-stat-icon"></div>
                <div className="health-stat-details">
                  <div className="health-stat-big">93%</div>
                  <div className="health-stat-small">Understanding Rate</div>
                </div>
              </div>
            </div>
            <div className="health-lab-features">
              <div className="health-feature-tag">Simple Language</div>
              <div className="health-feature-tag">Patient-Friendly</div>
              <div className="health-feature-tag">Clear Explanations</div>
            </div>
            <div className="health-lab-breakdown">
              <div className="health-breakdown-row">
                <span className="health-breakdown-name">Clarity Score</span>
                <div className="health-breakdown-line">
                  <div className="health-breakdown-progress" style={{ width: '93%' }}></div>
                </div>
                <span className="health-breakdown-percent">93%</span>
              </div>
              <div className="health-breakdown-row">
                <span className="health-breakdown-name">Comprehension Rate</span>
                <div className="health-breakdown-line">
                  <div className="health-breakdown-progress" style={{ width: '91%' }}></div>
                </div>
                <span className="health-breakdown-percent">91%</span>
              </div>
              <div className="health-breakdown-row">
                <span className="health-breakdown-name">Patient Satisfaction</span>
                <div className="health-breakdown-line">
                  <div className="health-breakdown-progress" style={{ width: '89%' }}></div>
                </div>
                <span className="health-breakdown-percent">89%</span>
              </div>
            </div>
            <div className="health-trend-indicator positive">
              <span className="health-trend-arrow">↑</span>
              <span className="health-trend-text">Patient understanding up 34%</span>
            </div>
          </>
        );
      case 'wellness':
        return (
          <>
            <div className="health-wellness-stats">
              <div className="health-overview-item">
                <div className="health-overview-number">2,347</div>
                <div className="health-overview-label">Plans Generated</div>
              </div>
              <div className="health-overview-item">
                <div className="health-overview-number">87%</div>
                <div className="health-overview-label">Adherence Rate</div>
              </div>
            </div>
            <div className="health-wellness-scores">
              <div className="health-score-item">
                <div className="health-score-label">Personalization</div>
                <div className="health-score-bar">
                  <div className="health-score-fill" style={{ width: '92%' }}></div>
                </div>
                <span className="health-score-value">92%</span>
              </div>
              <div className="health-score-item">
                <div className="health-score-label">Adherence Tracking</div>
                <div className="health-score-bar">
                  <div className="health-score-fill" style={{ width: '87%' }}></div>
                </div>
                <span className="health-score-value">87%</span>
              </div>
              <div className="health-score-item">
                <div className="health-score-label">Outcome Improvement</div>
                <div className="health-score-bar">
                  <div className="health-score-fill" style={{ width: '84%' }}></div>
                </div>
                <span className="health-score-value">84%</span>
              </div>
            </div>
            <div className="health-trend-indicator">
              <span className="health-trend-arrow">↑</span>
              <span className="health-trend-text">Wellness outcomes improved by 29%</span>
            </div>
          </>
        );
      case 'coordination':
        return (
          <>
            <div className="health-coordination-stats">
              <div className="health-stat-box">
                <div className="health-stat-icon"></div>
                <div className="health-stat-details">
                  <div className="health-stat-big">1,892</div>
                  <div className="health-stat-small">Cases Coordinated</div>
                </div>
              </div>
              <div className="health-stat-box">
                <div className="health-stat-icon"></div>
                <div className="health-stat-details">
                  <div className="health-stat-big">96%</div>
                  <div className="health-stat-small">Communication Rate</div>
                </div>
              </div>
            </div>
            <div className="health-coordination-features">
              <div className="health-feature-tag">Care Summaries</div>
              <div className="health-feature-tag">Insurance Info</div>
              <div className="health-feature-tag">Team Communication</div>
            </div>
            <div className="health-coordination-breakdown">
              <div className="health-breakdown-row">
                <span className="health-breakdown-name">Summary Quality</span>
                <div className="health-breakdown-line">
                  <div className="health-breakdown-progress" style={{ width: '95%' }}></div>
                </div>
                <span className="health-breakdown-percent">95%</span>
              </div>
              <div className="health-breakdown-row">
                <span className="health-breakdown-name">Information Accuracy</span>
                <div className="health-breakdown-line">
                  <div className="health-breakdown-progress" style={{ width: '98%' }}></div>
                </div>
                <span className="health-breakdown-percent">98%</span>
              </div>
              <div className="health-breakdown-row">
                <span className="health-breakdown-name">Coordination Efficiency</span>
                <div className="health-breakdown-line">
                  <div className="health-breakdown-progress" style={{ width: '91%' }}></div>
                </div>
                <span className="health-breakdown-percent">91%</span>
              </div>
            </div>
            <div className="health-trend-indicator positive">
              <span className="health-trend-arrow">↑</span>
              <span className="health-trend-text">Care coordination improved by 36%</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className="agent-feature-card hr-dashboard-style"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="agent-feature-title">{title}</h3>
      <p className="agent-feature-subtitle">{subtitle}</p>
      <div className="hr-card-content-wrapper">
        {renderCardContent()}
      </div>
    </article>
  );
};

const AgentPageTemplate: React.FC<AgentPageProps> = ({ config }) => {
  // Check agent page type
  const isHRRecruitmentPage = config.id === 'hr-recruitment';
  const isGTMSalesPage = config.id === 'gtm-sales';
  const isCFOFinancePage = config.id === 'cfo-finance';
  const isCustomerSupportPage = config.id === 'customer-support';
  const isRealEstatePage = config.id === 'real-estate';
  const isHealthcarePage = config.id === 'healthcare';
  
  // Get page-specific class name
  const pageClassName = isHRRecruitmentPage ? 'hr-recruitment-page' :
    isGTMSalesPage ? 'gtm-sales-page' :
    isCFOFinancePage ? 'cfo-finance-page' :
    isCustomerSupportPage ? 'customer-support-page' :
    isRealEstatePage ? 'real-estate-page' :
    isHealthcarePage ? 'healthcare-page' : '';
  
  // Debug logging
  useEffect(() => {
    console.log('AgentPageTemplate rendered with config.id:', config.id);
  }, [config.id]);

  return (
    <div className={`agent-page ${pageClassName}`}>
      {/* Video/Image */}
      <section className="agent-video-section">
        <div className="agent-video-frame">
          {/* Single video element - only one video for all agent pages */}
          <video
            className={`agent-video-element ${pageClassName}-video`}
            src="/aicfohero.mp4"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            preload="auto"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            key={`aicfohero-video-${config.id}`}
            id={`agent-video-${config.id}`}
          />
          {/* Image overlay on video - for all agent pages */}
          <div className="agent-image-overlay">
            <img 
              src={
                isGTMSalesPage ? "/images/GTM-dashboard.jpeg" : 
                isCFOFinancePage ? "/images/CFO-dashboard.png" : 
                isCustomerSupportPage ? "/images/Customer-dashboard.png" : 
                isRealEstatePage ? "/images/Property-dashboard.png" : 
                isHealthcarePage ? "/images/Healthcare-dashboard.png" : 
                isHRRecruitmentPage ? "/images/HR-dashboard.png" : 
                "/images/HR-dashboard.png"
              } 
              alt={`${config.title}`} 
              className="agent-overlay-image"
            />
          </div>
          {/* Hero text overlay on video */}
          <section className="agent-hero">
            <div className="agent-hero-inner">
              {/* Removed eyebrow pill with agent name to avoid boxed name at the top on all agent pages */}
              <h1 className="agent-hero-title">{config.title}</h1>
              <p className="agent-hero-overview">{config.overview}</p>
            </div>
          </section>
        </div>
      </section>

      {/* Features */}
      <section className="agent-features-section">
        <div className="agent-features-header">
          <h2>What this agent can do</h2>
        </div>
        <div className="agent-features-grid">
          {isHRRecruitmentPage ? (
            // Enhanced HR Recruitment Cards with interactive elements
            <>
              <EnhancedHRCard
                title="Resume Screening"
                subtitle="Filter hundreds of CVs instantly with skill‑accurate matching."
                type="screening"
              />
              <EnhancedHRCard
                title="Candidate Outreach"
                subtitle="Call candidates, collect details, and schedule interviews automatically."
                type="outreach"
              />
              <EnhancedHRCard
                title="AI Interviewing"
                subtitle="Conducts natural interviews based on JD + resume understanding."
                type="interviewing"
              />
              <EnhancedHRCard
                title="Cross‑Questioning"
                subtitle="Tests real competence with smart follow-up questions."
                type="questioning"
              />
              <EnhancedHRCard
                title="Shortlisting"
                subtitle="Ranks and selects top candidates with clean scorecards."
                type="shortlisting"
              />
              <EnhancedHRCard
                title="Interview Summaries"
                subtitle="Delivers transcripts, insights, and hiring recommendations."
                type="summaries"
              />
            </>
          ) : isGTMSalesPage ? (
            // Enhanced GTM Sales Cards
            <>
              <EnhancedGTMSalesCard
                title="Lead Generation"
                subtitle="Find and qualify high-intent leads with precision in seconds."
                type="lead-gen"
              />
              <EnhancedGTMSalesCard
                title="Lead Enrichment"
                subtitle="Surface deep company insights automatically before outreach."
                type="lead-enrich"
              />
              <EnhancedGTMSalesCard
                title="Voice Calling"
                subtitle="Call prospects in any language—or with your cloned voice."
                type="voice-calling"
              />
              <EnhancedGTMSalesCard
                title="Campaign Automation"
                subtitle="Launch multi‑channel sequences that run on autopilot."
                type="campaign"
              />
              <EnhancedGTMSalesCard
                title="Follow‑Ups"
                subtitle="Never miss a follow-up; the agent chases prospects relentlessly."
                type="followups"
              />
              <EnhancedGTMSalesCard
                title="AI Meeting Assistant"
                subtitle="Joins your calls silently and turns every word into actionable intelligence."
                type="meeting-assistant"
              />
              <EnhancedGTMSalesCard
                title="Sales Analytics"
                subtitle="Crystal‑clear pipeline insights, call logs, and performance reports."
                type="analytics"
              />
            </>
          ) : isCFOFinancePage ? (
            // Enhanced CFO Finance Cards
            <>
              <EnhancedCFOCard
                title="Financial Automation"
                subtitle="Automate AP, AR, reconciliation, and monthly closes."
                type="automation"
              />
              <EnhancedCFOCard
                title="Cashflow Intelligence"
                subtitle="Predict burn, runway, and financial health instantly."
                type="cashflow"
              />
              <EnhancedCFOCard
                title="Expense Tracking"
                subtitle="Spot anomalies and overspending in real time."
                type="expense"
              />
              <EnhancedCFOCard
                title="Revenue Insights"
                subtitle="Get instant P&L, balance sheets, and forecasts."
                type="revenue"
              />
              <EnhancedCFOCard
                title="Compliance‑Ready"
                subtitle="Built for PDPL, NCA, HIPAA‑aligned data governance."
                type="compliance"
              />
              <EnhancedCFOCard
                title="CFO Reports"
                subtitle="Receive clean, investor‑ready summaries on demand."
                type="reports"
              />
            </>
          ) : isCustomerSupportPage ? (
            // Enhanced Customer Support Cards
            <>
              <EnhancedSupportCard
                title="Multi‑Channel Support"
                subtitle="Resolve queries across chat, WhatsApp, email, and voice."
                type="multichannel"
              />
              <EnhancedSupportCard
                title="24/7 Availability"
                subtitle="Instant, accurate responses at any hour."
                type="availability"
              />
              <EnhancedSupportCard
                title="Ticket Automation"
                subtitle="Creates, assigns, and tracks tickets without human input."
                type="tickets"
              />
              <EnhancedSupportCard
                title="Knowledge Learning"
                subtitle="Learns from your docs and updates FAQs automatically."
                type="knowledge"
              />
              <EnhancedSupportCard
                title="Voice Support"
                subtitle="Handles verification, callbacks, and status updates."
                type="voice"
              />
              <EnhancedSupportCard
                title="Support Analytics"
                subtitle="Monitor response time, CSAT, volume, and trends."
                type="analytics"
              />
            </>
          ) : isRealEstatePage ? (
            // Enhanced Real Estate Cards
            <>
              <EnhancedRealEstateCard
                title="Property Matching"
                subtitle="Suggest perfect units based on client needs instantly."
                type="matching"
              />
              <EnhancedRealEstateCard
                title="Lead Calling"
                subtitle="Qualify buyers and tenants using multilingual AI voice."
                type="calling"
              />
              <EnhancedRealEstateCard
                title="Viewings Scheduling"
                subtitle="Book, confirm, and manage property viewings effortlessly."
                type="scheduling"
              />
              <EnhancedRealEstateCard
                title="Tenant Issue Handling"
                subtitle="Call tenants, diagnose issues, and create maintenance tickets."
                type="issues"
              />
              <EnhancedRealEstateCard
                title="Maintenance Automation"
                subtitle="Assign technicians and track task completion automatically."
                type="maintenance"
              />
              <EnhancedRealEstateCard
                title="Renewal & Follow‑Ups"
                subtitle="Automate renewals, offers, and client nurturing."
                type="renewals"
              />
            </>
          ) : isHealthcarePage ? (
            // Enhanced Healthcare Cards
            <>
              <EnhancedHealthcareCard
                title="Patient Intake"
                subtitle="Collect symptoms and context with medical‑grade questioning."
                type="intake"
              />
              <EnhancedHealthcareCard
                title="Triage Guidance"
                subtitle="Routes cases safely without providing diagnosis."
                type="triage"
              />
              <EnhancedHealthcareCard
                title="Appointment Scheduling"
                subtitle="Books visits, reminders, and follow‑ups automatically."
                type="scheduling"
              />
              <EnhancedHealthcareCard
                title="Lab Explanation"
                subtitle="Explains results in simple, patient‑friendly language."
                type="lab"
              />
              <EnhancedHealthcareCard
                title="Diet & Wellness Plans"
                subtitle="Generates personalized lifestyle guidance."
                type="wellness"
              />
              <EnhancedHealthcareCard
                title="Care Coordination"
                subtitle="Manages summaries, insurance info, and communication."
                type="coordination"
              />
            </>
          ) : (
            // Fallback for any other pages
            config.features.map((feature, index) => (
              <article key={feature.title} className="agent-feature-card hr-dashboard-style">
                <h3 className="agent-feature-title">{feature.title}</h3>
                <p className="agent-feature-subtitle">{feature.description}</p>
                <div className="hr-card-content-wrapper">
                  <div className="agent-feature-icon">{feature.icon}</div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

// --- Individual agent configs with provided content ---

const gtmSalesConfig: AgentConfig = {
  id: 'gtm-sales',
  title: 'GTM & Sales Agent',
  eyebrow: 'GTM & Sales Agent',
  overview:
    'Drive outreach, qualify intent, and keep deals in motion. A fully autonomous growth partner that discovers opportunities, initiates outreach, manages campaigns, and elevates every conversation.',
  videoSrc: '/sales.mp4',
  features: [
    {
      icon: '',
      title: 'Lead Generation',
      description: 'Find and qualify high-intent leads with precision in seconds.',
    },
    {
      icon: '',
      title: 'Lead Enrichment',
      description: 'Surface deep company insights automatically before outreach.',
    },
    {
      icon: '',
      title: 'Voice Calling',
      description: 'Call prospects in any language—or with your cloned voice.',
    },
    {
      icon: '',
      title: 'Campaign Automation',
      description: 'Launch multi‑channel sequences that run on autopilot.',
    },
    {
      icon: '',
      title: 'Follow‑Ups',
      description: 'Never miss a follow-up; the agent chases prospects relentlessly.',
    },
    {
      icon: '',
      title: 'AI Meeting Assistant',
      description: 'Joins your calls silently and turns every word into actionable intelligence.',
    },
    {
      icon: '',
      title: 'Sales Analytics',
      description: 'Crystal‑clear pipeline insights, call logs, and performance reports.',
    },
  ],
};

const hrRecruitmentConfig: AgentConfig = {
  id: 'hr-recruitment',
  title: 'HR & Recruitment Agent',
  eyebrow: 'HR & Recruitment Agent',
  overview:
    'Orchestrate hiring, onboarding, and people ops flows. From sourcing to onboarding, this agent keeps every candidate and employee journey quietly coordinated.',
  videoSrc: '/HRvc.mp4',
  features: [
    {
      icon: '',
      title: 'Resume Screening',
      description: 'Filter hundreds of CVs instantly with skill‑accurate matching.',
    },
    {
      icon: '',
      title: 'Candidate Outreach',
      description: 'Call candidates, collect details, and schedule interviews automatically.',
    },
    {
      icon: '',
      title: 'AI Interviewing',
      description: 'Conducts natural interviews based on JD + resume understanding.',
    },
    {
      icon: '',
      title: 'Cross‑Questioning',
      description: 'Tests real competence with smart follow-up questions.',
    },
    {
      icon: '',
      title: 'Shortlisting',
      description: 'Ranks and selects top candidates with clean scorecards.',
    },
    {
      icon: '',
      title: 'Interview Summaries',
      description: 'Delivers transcripts, insights, and hiring recommendations.',
    },
  ],
};

const cfoFinanceConfig: AgentConfig = {
  id: 'cfo-finance',
  title: 'CFO & Finance Agent',
  eyebrow: 'CFO & Finance Agent',
  overview:
    'See cash, margin, and risk in one focused lane. A calm layer over budgets, forecasts, and cash — always ready with the next best move for your team.',
  videoSrc: '/AICFO.mp4',
  features: [
    {
      icon: '',
      title: 'Financial Automation',
      description: 'Automate AP, AR, reconciliation, and monthly closes.',
    },
    {
      icon: '',
      title: 'Cashflow Intelligence',
      description: 'Predict burn, runway, and financial health instantly.',
    },
    {
      icon: '',
      title: 'Expense Tracking',
      description: 'Spot anomalies and overspending in real time.',
    },
    {
      icon: '',
      title: 'Revenue Insights',
      description: 'Get instant P&L, balance sheets, and forecasts.',
    },
    {
      icon: '',
      title: 'Compliance‑Ready',
      description: 'Built for PDPL, NCA, HIPAA‑aligned data governance.',
    },
    {
      icon: '',
      title: 'CFO Reports',
      description: 'Receive clean, investor‑ready summaries on demand.',
    },
  ],
};

const customerSupportConfig: AgentConfig = {
  id: 'customer-support',
  title: 'Customer Support Agent',
  eyebrow: 'Customer Support Agent',
  overview:
    'Always-on help that feeds product with real signals. Frontline support that feels human, learns from every ticket, and feeds product back with clarity.',
  videoSrc: '/sal.mp4',
  features: [
    {
      icon: '',
      title: 'Multi‑Channel Support',
      description: 'Resolve queries across chat, WhatsApp, email, and voice.',
    },
    {
      icon: '',
      title: '24/7 Availability',
      description: 'Instant, accurate responses at any hour.',
    },
    {
      icon: '',
      title: 'Ticket Automation',
      description: 'Creates, assigns, and tracks tickets without human input.',
    },
    {
      icon: '',
      title: 'Knowledge Learning',
      description: 'Learns from your docs and updates FAQs automatically.',
    },
    {
      icon: '',
      title: 'Voice Support',
      description: 'Handles verification, callbacks, and status updates.',
    },
    {
      icon: '',
      title: 'Support Analytics',
      description: 'Monitor response time, CSAT, volume, and trends.',
    },
  ],
};

const realEstateConfig: AgentConfig = {
  id: 'real-estate',
  title: 'Real Estate Agent',
  eyebrow: 'Real Estate Agent',
  overview:
    'From leads to leases and maintenance, handled quietly. From leads to leases and maintenance, this agent keeps your portfolio humming in the background.',
  videoSrc: '/sal.mp4',
  features: [
    {
      icon: '',
      title: 'Property Matching',
      description: 'Suggest perfect units based on client needs instantly.',
    },
    {
      icon: '',
      title: 'Lead Calling',
      description: 'Qualify buyers and tenants using multilingual AI voice.',
    },
    {
      icon: '',
      title: 'Viewings Scheduling',
      description: 'Book, confirm, and manage property viewings effortlessly.',
    },
    {
      icon: '',
      title: 'Tenant Issue Handling',
      description: 'Call tenants, diagnose issues, and create maintenance tickets.',
    },
    {
      icon: '',
      title: 'Maintenance Automation',
      description: 'Assign technicians and track task completion automatically.',
    },
    {
      icon: '',
      title: 'Renewal & Follow‑Ups',
      description: 'Automate renewals, offers, and client nurturing.',
    },
  ],
};

const healthcareConfig: AgentConfig = {
  id: 'healthcare',
  title: 'Healthcare Agent',
  eyebrow: 'Healthcare Agent',
  overview:
    'Coordinate intake, scheduling, and follow‑ups with care. A focused layer for intake, scheduling, and follow-ups — designed for clinics and care teams.',
  videoSrc: '/sal.mp4',
  features: [
    {
      icon: '',
      title: 'Patient Intake',
      description: 'Collect symptoms and context with medical‑grade questioning.',
    },
    {
      icon: '',
      title: 'Triage Guidance',
      description: 'Routes cases safely without providing diagnosis.',
    },
    {
      icon: '',
      title: 'Appointment Scheduling',
      description: 'Books visits, reminders, and follow‑ups automatically.',
    },
    {
      icon: '',
      title: 'Lab Explanation',
      description: 'Explains results in simple, patient‑friendly language.',
    },
    {
      icon: '',
      title: 'Diet & Wellness Plans',
      description: 'Generates personalized lifestyle guidance.',
    },
    {
      icon: '',
      title: 'Care Coordination',
      description: 'Manages summaries, insurance info, and communication.',
    },
  ],
};

// --- Page components wired into the router ---

export const GTMSalesAgentPage: React.FC = () => (
  <AgentPageTemplate config={gtmSalesConfig} />
);

export const HRRecruitmentAgentPage: React.FC = () => {
  // Add body class for HR recruitment page styling
  useEffect(() => {
    document.body.classList.add('hr-recruitment-active');
    return () => {
      document.body.classList.remove('hr-recruitment-active');
    };
  }, []);

  return <AgentPageTemplate config={hrRecruitmentConfig} />;
};

export const CFOFinanceAgentPage: React.FC = () => (
  <AgentPageTemplate config={cfoFinanceConfig} />
);

export const CustomerSupportAgentPage: React.FC = () => (
  <AgentPageTemplate config={customerSupportConfig} />
);

export const RealEstateAgentPage: React.FC = () => (
  <AgentPageTemplate config={realEstateConfig} />
);

export const HealthcareAgentPage: React.FC = () => (
  <AgentPageTemplate config={healthcareConfig} />
);


