import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render without StrictMode so our one-time intro logic is not run twice in development.
root.render(<App />);
