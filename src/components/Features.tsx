import React from 'react';
import './Features.css';

const Features: React.FC = () => {
  const features = [
    {
      id: 1,
      title: 'Template Library Suite',
      description: 'Showcase our domain-specific templates that automate any business – display as interactive visual cards.',
      visual: '🎨'
    },
    {
      id: 2,
      title: 'Prompt to AI Agent Builder',
      description: 'Visualize how prompts directly convert into agents.',
      visual: '🤖'
    },
    {
      id: 3,
      title: 'Voice Agents',
      description: 'Add a visual / screen-record snippet showing voice agent demos.',
      visual: '🎙️'
    },
    {
      id: 4,
      title: 'Multilingual Support',
      description: 'Highlight Arabic and MENA-language support visually (e.g., dual text blocks).',
      visual: '🌍'
    },
    {
      id: 5,
      title: 'One-Click Deployment, No APIs Needed',
      description: 'Add a graphic or animation showing direct deployment from our platform – emphasize "no API handling."',
      visual: '⚡'
    },
    {
      id: 6,
      title: 'MENA-Region Specific Compliance',
      description: 'Add text/graphic noting "Built for the Middle East – compliant, localized, robust, and tested for MENA."',
      visual: '✅'
    }
  ];

  return null;
};

export default Features;

