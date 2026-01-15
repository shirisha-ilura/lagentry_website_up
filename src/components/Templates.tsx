import React from 'react';
import './Templates.css';

const Templates: React.FC = () => {
  const templates = [
    {
      id: 'ai-cfo',
      name: 'AI CFO',
      role: 'Financial planning, budgeting, and strategic financial analysis',
      avatar: '/images/one.png',
      color: '#8B5CF6',
      skills: ['Budget Analysis', 'Financial Forecasting', 'Cost Optimization', 'ROI Tracking']
    },
    {
      id: 'hr',
      name: 'HR',
      role: 'Human resources management and employee lifecycle',
      avatar: '/images/two.png',
      color: '#3B82F6',
      skills: ['Recruitment', 'Employee Onboarding', 'Performance Reviews', 'Payroll Management']
    },
    {
      id: 'finance',
      name: 'Finance',
      role: 'KYC, KYB, invoice processing, tax returns, and audit management',
      avatar: '/images/three.png',
      color: '#DC2626',
      skills: ['KYC/KYB Verification', 'Invoice Processing', 'Tax Returns', 'Audit Management']
    },
    {
      id: 'customer-support',
      name: 'Customer Support',
      role: '24/7 customer service and support automation',
      avatar: '/images/four.png',
      color: '#F59E0B',
      skills: ['Live Chat', 'Ticket Management', 'FAQ Automation', 'Customer Satisfaction']
    },
    {
      id: 'competitor-analysis',
      name: 'Competitor Analysis',
      role: 'Market research and competitive intelligence',
      avatar: '/images/five.png',
      color: '#10B981',
      skills: ['Market Research', 'Competitor Tracking', 'Price Analysis', 'Trend Monitoring']
    },
    {
      id: 'voice-calling',
      name: 'Voice Calling',
      role: 'AI-powered voice interactions and call management',
      avatar: '/images/six.png',
      color: '#EC4899',
      skills: ['Voice Recognition', 'Call Routing', 'Transcription', 'Sentiment Analysis']
    },
    {
      id: 'property-management',
      name: 'Property Management',
      role: 'Real estate and property management automation',
      avatar: '/images/seven.png',
      color: '#06B6D4',
      skills: ['Tenant Management', 'Maintenance Tracking', 'Rent Collection', 'Property Analytics']
    },
    {
      id: 'sales',
      name: 'Sales',
      role: 'AI-powered sales automation and lead management',
      avatar: '/images/eight.png',
      color: '#84CC16',
      skills: ['Lead Generation', 'Sales Pipeline', 'CRM Integration', 'Follow-up Automation']
    }
  ];

  return (
    <div className="templates-section">
      <div className="templates-container">
        <div className="templates-header">
          <h2 className="templates-title">AI Employees</h2>
          <p className="templates-subtitle">
            Choose from our pre-built templates or create your own custom AI employee
          </p>
        </div>
        
        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template.id} className="template-card" style={{ '--card-color': template.color } as React.CSSProperties}>
              <div className="template-header">
                <h3 className="template-name" style={{ color: template.color }}>{template.name}</h3>
                <p className="template-role">{template.role}</p>
              </div>
              
              <div className="template-avatar">
                <img src={template.avatar} alt={template.name} className="avatar-image" />
              </div>
              
              <div className="template-skills">
                <h4 className="skills-title">What I can do</h4>
                <div className="skills-list">
                  {template.skills.map((skill, index) => (
                    <div key={index} className="skill-button">{skill}</div>
                  ))}
                </div>
              </div>
              
              <div className="template-footer">
                <p className="footer-text" style={{ color: template.color }}>and hundreds more skills...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;