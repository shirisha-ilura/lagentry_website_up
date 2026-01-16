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
            <h2 className="dashboard-title">
              <span className="dashboard-title-line1">Agent Analytics</span>
              <span className="dashboard-title-line2">Dashboard</span>
            </h2>
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
        </div>
      </div>
    </div>
  );
};export default Dashboard;



