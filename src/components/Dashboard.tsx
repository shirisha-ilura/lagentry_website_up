import React from 'react';
import './Dashboard.css';
import DashGif from '../Dash.gif';
import DashBg from '../Dash_bg.gif';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-section">
      {/* Dashboard Content */}
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h2 className="dashboard-title">Agent Analytics Dashboard</h2>
            <p className="dashboard-subtitle">
              Real-time insights into your AI agent ecosystem
            </p>
          </div>

          {/* Dashboard GIF */}
          <div className="dashboard-gif-container">
            {/* Background GIF */}
            <img src={DashBg} alt="Dashboard Background" className="dashboard-bg-gif" />
            {/* Main Dashboard GIF */}
            <img src={DashGif} alt="Dashboard Analytics" className="dashboard-gif" />
          </div>

          {/* NOTE: The previous embedded "stacked-slides-app" iframe pointed to
              /videos/stacked-slides-app/index.html, which does not exist in this
              project and caused React Router "No routes matched" console errors.
              If you want to embed that app, copy its built files into
              public/videos/stacked-slides-app and restore the iframe.
              For now, the broken iframe has been removed to avoid errors. */}
        </div>
      </div>
    </div>
  );
};export default Dashboard;



