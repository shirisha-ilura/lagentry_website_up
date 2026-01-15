import React from 'react';
import './Pricing.css';

type Tier = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  per?: string;
  badge: string;
  features: string[];
  cta: string;
  href: string;
};

const tiers: Tier[] = [
  {
    id: 'basic-free',
    title: 'Basic Plan',
    subtitle: 'Best for personal use.',
    price: 'Free',
    per: '',
    badge: 'AI-based',
    features: [
      'Employee directory',
      'Task management',
      'Calendar integration',
      'File storage',
      'Communication tools',
      'Reporting and analytics',
    ],
    cta: 'Get Started',
    href: '#',
  },
  {
    id: 'basic-20',
    title: 'Basic Plan',
    subtitle: 'For large teams & corporations.',
    price: '$20',
    per: '/ per month',
    badge: 'AI-based',
    features: [
      'Advanced employee directory',
      'Project management',
      'Resource scheduling',
      'Version control',
      'Team collaboration',
      'Advanced analytics',
    ],
    cta: 'Get Started',
    href: '#',
  },
  {
    id: 'pro-120',
    title: 'Pro Plan',
    subtitle: 'Best for business owners.',
    price: '$120',
    per: '/ per month',
    badge: 'AI-based',
    features: [
      'Customizable employee directory',
      'Client project management',
      'Client meeting schedule',
      'Compliance tracking',
      'Client communication',
      'Create custom reports tailored',
    ],
    cta: 'Get Started',
    href: '#',
  },
  {
    id: 'teams-80',
    title: 'Teams',
    subtitle: 'Best for business owners.',
    price: '$80',
    per: '/ per month',
    badge: 'AI-based',
    features: [
      'Contact with teams',
      'Collaborate with upto 10 team members',
      'Control Agents',
      'Manage Agents',
      'Client communication',
      'Create custom reports and build Agents Together',
    ],
    cta: 'Get Started',
    href: '#',
  },
];

const Pricing: React.FC = () => {
  return (
    <div className="pricing-container">
      <h1 className="pricing-title">Choose the best plan that fits your need</h1>
      <div className="pricing-grid pricing-grid-4">
        {tiers.map((t, index) => (
          <div 
            key={t.id} 
            className="card glass"
            style={(index === 0 || index === 1 || index === 2 || index === 3) ? {
              backgroundImage: 'url(/images/pricingbackgroundimage.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            } : undefined}
          >
            <div className="card-halo" />
            {(index === 0 || index === 1 || index === 2 || index === 3) && <div className="stars-overlay" />}
            <div className="card-inner">
              <div className="card-top">
                <div className="plan-line">
                  <img src="/images/logo.png" alt="Logo" className="plan-logo" />
                  <span className="plan-title">{t.title}</span>
                  <span className="plan-badge">{t.badge}</span>
                </div>
                <p className="plan-subtitle">{t.subtitle}</p>
              </div>
              <div className="plan-price">
                <span className="price-main">{t.price}</span>
                {t.per && <span className="price-per">{t.per}</span>}
              </div>
              <a className="card-cta big" href={t.href}>{t.cta}</a>
              <div className="divider" />
              <div className="features-title">What you will get</div>
              <ul className="features">
                {t.features.map((f) => (
                  <li key={f}><span className="check" />{f}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;


