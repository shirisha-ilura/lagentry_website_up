import React, { useEffect, useRef, useState } from 'react';
import './FeatureCards.css';

interface FeatureCardsProps {
  theme?: 'dark' | 'light';
}

interface FeatureCard {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const features: FeatureCard[] = [
  {
    id: 1,
    title: 'Meet your AI employees',
    description: 'CFO, HR, and Marketing agents in action.',
    icon: '👥',
  },
  {
    id: 2,
    title: 'Experience real-time automation',
    description: 'Experience real-time automation for MENA businesses.',
    icon: '⚡',
  },
  {
    id: 3,
    title: 'No code. No setup.',
    description: 'Just your prompt.',
    icon: '✨',
  },
  {
    id: 4,
    title: 'Built for enterprises, startups, and innovators',
    description: 'Built for enterprises, startups, and innovators.',
    icon: '🚀',
  },
];

const FeatureCards: React.FC<FeatureCardsProps> = ({ theme = 'dark' }) => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((cardRef, index) => {
      if (!cardRef) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => {
                const newSet = new Set(prev);
                newSet.add(index);
                return newSet;
              });
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      observer.observe(cardRef);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section className={`feature-cards-section ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="feature-cards-container">
        <div className="feature-cards-header">
          <h2 className="feature-cards-title">Why Book a Demo?</h2>
          <p className="feature-cards-subtitle">
            Discover how Legentry transforms your business operations
          </p>
        </div>

        <div className="feature-cards-grid">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`feature-card ${visibleCards.has(index) ? 'visible' : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="feature-card-icon">{feature.icon}</div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-description">{feature.description}</p>
              <div className="feature-card-glow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;

