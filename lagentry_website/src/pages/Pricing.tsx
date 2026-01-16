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
  whoIsItFor: string;
  cta: string;
  href: string;
};

const tiers: Tier[] = [
  {
    id: 'basic-free',
    title: 'Basic',
    subtitle: 'Perfect for individuals exploring AI Employees for the first time',
    price: '$0',
    per: '/ month',
    badge: '',
    features: [
      '1,000 credits on signup',
      'Chat with any 1 AI Employee',
      'Voice agents',
      'Try conversational flows',
      'Test knowledge base uploads',
      'Insights & usage report',
      'Community support',
      'Access to Lagentry Marketplace',
      '1000+ integrations',
    ],
    whoIsItFor: 'Individuals, freelancers, and early testers who want to understand how Lagentry AI Employees work before committing.',
    cta: 'Get Started',
    href: '/waitlist',
  },
  {
    id: 'hobby-20',
    title: 'Hobby',
    subtitle: 'Ideal for small teams & solo founders getting started with automation',
    price: '$20',
    per: '/ month',
    badge: '',
    features: [
      'Everything in Basic, plus',
      'Use any 2 AI Employees at a time',
      '10,000 monthly credits',
      'Deploy agents with chat widget + dashboard',
      'Access to AI Employee templates',
      'Voice agents',
      'Multilingual support',
      'Workflow editor',
      'Analytics dashboard',
      'Email integration',
      'File upload for internal knowledge',
      '1000+ integrations',
    ],
    whoIsItFor: 'Small founders, early-stage startups, individual agents who want automation without heavy setup.',
    cta: 'Get Started',
    href: '/waitlist',
  },
  {
    id: 'startup-80',
    title: 'Startup',
    subtitle: 'For growing teams ready to deploy AI Employees into real workflows',
    price: '$80',
    per: '/ month',
    badge: '',
    features: [
      'Everything in Hobby, plus',
      'Use up to 5 AI Employees at a time',
      '50,000 monthly credits',
      'Iframe Embeds',
      'Voice agents',
      '1000+ integrations',
      'Advanced analytics & custom dashboards',
      'Fine-tuning knowledge base',
      'Team collaboration',
      'Agent personality customization',
      'Multi-language skill pack',
    ],
    whoIsItFor: 'Startups & small businesses wanting to create automated workflows: customer support, property management, sales outreach automation, ticketing.',
    cta: 'Get Started',
    href: '/waitlist',
  },
  {
    id: 'growth-100',
    title: 'Growth',
    subtitle: 'Best for businesses scaling operations with multiple AI Employees',
    price: '$100',
    per: '/ month',
    badge: '',
    features: [
      'Everything in Startup, plus',
      'Use up to 10 AI Employees at a time',
      '100,000 monthly credits',
      'Custom AI Employee builder',
      'Priority access to new AI employee templates',
      'Private deployment',
      'Collaboration for up to 10 users',
      'Voice agents',
      'Full access to voice cloning',
      'Advanced workflow automations',
      'API access',
      'Webhooks',
      'CRM bi-directional sync',
      'Advanced security: encryption, audit logs',
      '1000+ integrations',
    ],
    whoIsItFor: 'Agencies, operations teams, SME businesses scaling their support, sales, HR, finance, and real-estate flows using AI Employees.',
    cta: 'Get Started',
    href: '/waitlist',
  },
];

const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = React.useState(false);

  const getPrice = (tier: Tier) => {
    if (tier.price === '$0') return '$0';
    const monthlyPrice = parseInt(tier.price.replace('$', ''));
    if (isYearly) {
      const yearlyPrice = monthlyPrice * 10;
      return `$${yearlyPrice}`;
    }
    return tier.price;
  };

  const getPerText = (tier: Tier) => {
    if (tier.price === '$0') return '/ month';
    return isYearly ? '/ year' : '/ month';
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1 className="pricing-title">Unlimited Users. Only Pay For Actions.</h1>
        <p className="pricing-subtitle">Scale your business with AI Employees designed for every stage of growth</p>
        
        {/* Billing Toggle */}
        <div className="billing-toggle-container">
          <div className="billing-toggle">
            <button
              className={`toggle-option ${!isYearly ? 'active' : ''}`}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </button>
            <button
              className={`toggle-option ${isYearly ? 'active' : ''}`}
              onClick={() => setIsYearly(true)}
            >
              Yearly
            </button>
          </div>
          {isYearly && (
            <p className="yearly-savings-text">Get 2 months free for buying yearly plan</p>
          )}
        </div>
      </div>
      
      <div className="pricing-grid pricing-grid-4">
        {tiers.map((tier, index) => (
          <div 
            key={tier.id} 
            className={`pricing-card`}
            style={{
              backgroundImage: `url(${process.env.PUBLIC_URL || ''}/images/pricingbackgroundimage.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="card-halo" />
            <div className="stars-overlay" />
            
            <div className="card-inner">
              <div className="card-header">
                <h3 className="plan-title">{tier.title}</h3>
                <p className="plan-subtitle">{tier.subtitle}</p>
                
                <div className="plan-price">
                  <span className="price-main">{getPrice(tier)}</span>
                  <span className="price-per">{getPerText(tier)}</span>
                </div>
                
                <a className="cta-button" href={tier.href}>
                  {tier.cta}
                </a>
              </div>

              <div className="card-content">
                <div className="features-section">
                  <h4 className="features-title">Includes</h4>
                  <ul className="features-list">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="feature-item">
                        <span className="check-icon">✓</span>
                        <span className="feature-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;