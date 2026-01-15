import React from 'react';
import './Agents.css';
import Carousel from '../components/AgentsCarousel';

interface Member {
  name: string;
  role: string;
  image: string;
  bio: string;
  ig: string;
  tw: string;
}

const members: Member[] = [
  {
    name: 'AI CFO',
    role: 'Financial planning, budgeting, and strategic financial analysis',
    image: '/images/1.png',
    bio: 'Expert in budget analysis, financial forecasting, cost optimization, and ROI tracking. I help businesses make strategic financial decisions and optimize their financial performance.',
    ig: 'https://instagram.com/',
    tw: 'https://x.com/'
  },
  {
    name: 'HR',
    role: 'Human resources management and employee lifecycle',
    image: '/images/2.png',
    bio: 'Specialized in recruitment, employee onboarding, performance reviews, and payroll management. I streamline HR processes and enhance employee experience throughout their journey.',
    ig: 'https://instagram.com/',
    tw: 'https://x.com/'
  },
  {
    name: 'Finance',
    role: 'KYC, KYB, invoice processing, tax returns, and audit management',
    image: '/images/3.png',
    bio: 'Handles KYC/KYB verification, invoice processing, tax returns, and audit management. I ensure compliance and streamline financial operations for businesses.',
    ig: 'https://instagram.com/',
    tw: 'https://x.com/'
  },
  {
    name: 'Customer Support',
    role: '24/7 customer service and support automation',
    image: '/images/4.png',
    bio: 'Provides round-the-clock customer service with live chat, ticket management, FAQ automation, and customer satisfaction tracking. I ensure your customers always get the help they need.',
    ig: 'https://instagram.com/',
    tw: 'https://x.com/'
  },
  {
    name: 'Competitor Analysis',
    role: 'Market research and competitive intelligence',
    image: '/images/5.png',
    bio: 'Expert in market research, competitor tracking, price analysis, and trend monitoring. I help you stay ahead of the competition with actionable insights.',
    ig: 'https://instagram.com/',
    tw: 'https://x.com/'
  },
  {
    name: 'Voice Calling',
    role: 'AI-powered voice interactions and call management',
    image: '/images/6.png',
    bio: 'Specialized in voice recognition, call routing, transcription, and sentiment analysis. I transform voice interactions into seamless, intelligent communication experiences.',
    ig: 'https://instagram.com/',
    tw: 'https://x.com/'
  },
  {
    name: 'Property Management',
    role: 'Real estate and property management automation',
    image: '/images/7.png',
    bio: 'Manages tenant relationships, maintenance tracking, rent collection, and property analytics. I automate property management tasks and optimize real estate operations.',
    ig: 'https://instagram.com/',
    tw: 'https://x.com/'
  },
  {
    name: 'Sales',
    role: 'AI-powered sales automation and lead management',
    image: '/images/8.png',
    bio: 'Handles lead generation, sales pipeline management, CRM integration, and follow-up automation. I help you close more deals and grow your revenue efficiently.',
    ig: 'https://instagram.com/',
    tw: 'https://x.com/'
  }
];

const Agents: React.FC = () => {
  return (
    <div className="agents-page">
      {/* Background decorations */}
      <div className="bg-blob bg-blob--1"></div>
      <div className="bg-blob bg-blob--2"></div>
      <div className="bg-blob bg-blob--3"></div>

      <main className="card">
        <h1 className="title">Our AI Agents</h1>
        <Carousel members={members} />
      </main>
    </div>
  );
};

export default Agents;







