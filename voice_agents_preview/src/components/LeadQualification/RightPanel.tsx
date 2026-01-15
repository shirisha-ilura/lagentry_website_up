import React, { useState } from 'react';
import SphereCanvas from './SphereCanvas';
import { agentColors } from './hooks/useSphereAnimation';

interface Agent {
    id: string;
    title: string;
    name: string;
    color: string;
    hashtags: string[];
    buttonColor: {
        normal: string;
        hover: string;
    };
}

interface RightPanelProps {
    selectedAgent: Agent;
    callState: 'idle' | 'connecting' | 'connected' | 'ended';
    onStartCall: () => void;
    onEndCall: () => void;
    showForm: boolean;
    formData: {
        name: string;
        email: string;
        phone: string;
    };
    onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFormSubmit: (e: React.FormEvent) => void;
    onCloseForm: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
    selectedAgent, 
    callState, 
    onStartCall, 
    onEndCall,
    showForm,
    formData,
    onFormChange,
    onFormSubmit,
    onCloseForm
}) => {
    const agentColor = agentColors[selectedAgent.color as keyof typeof agentColors] || agentColors.pink;
    const loadingArcColor = `rgb(${agentColor.r}, ${agentColor.g}, ${agentColor.b})`;
    const isAnimated = callState === 'connecting' || callState === 'connected';

    return (
        <div className="right-panel">
            {showForm ? (
                <div className="form-modal-content">
                    <div className="form-modal-header">
                        <h3>Start Your Call with {selectedAgent.title}</h3>
                        <button className="close-form-btn" onClick={onCloseForm}>×</button>
                    </div>
                    <form onSubmit={onFormSubmit} className="call-form">
                        <div className="form-field">
                            <label>Your Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onFormChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onFormChange}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label>Phone Number (Optional)</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={onFormChange}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <button type="submit" className="call-button" style={{
                            backgroundColor: selectedAgent.buttonColor.normal
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = selectedAgent.buttonColor.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = selectedAgent.buttonColor.normal;
                        }}>
                            Start Call Now
                        </button>
                    </form>
                </div>
            ) : callState === 'idle' ? (
                <>
                    <div className="sphere-wrapper">
                        <SphereCanvas sphereColor={agentColor} isAnimated={false} />
                    </div>
                    
                    <div className="agent-info-section">
                        <h2 className="agent-name">{selectedAgent.name}</h2>
                        <div className="status">
                            <span className="status-dot"></span>
                            <span className="status-text">Available</span>
                        </div>
                    </div>
                    <button 
                        className="call-button" 
                        onClick={onStartCall}
                        style={{
                            backgroundColor: selectedAgent.buttonColor.normal
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = selectedAgent.buttonColor.hover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = selectedAgent.buttonColor.normal;
                        }}
                    >
                        Start a call
                    </button>
                </>
            ) : callState === 'connecting' || callState === 'connected' ? (
                <div className="connecting-state">
                    <div className="sphere-wrapper">
                        <SphereCanvas sphereColor={agentColor} isAnimated={true} />
                    </div>
                    <div className="connecting-content">
                        <div className="loading-indicator">
                            <svg className="loading-circle" width="24" height="24" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="#2a2a2a" strokeWidth="2" fill="none"/>
                                <circle 
                                    cx="12" 
                                    cy="12" 
                                    r="10" 
                                    stroke={loadingArcColor}
                                    strokeWidth="2" 
                                    fill="none" 
                                    strokeDasharray="62.83" 
                                    strokeDashoffset="47.12" 
                                    strokeLinecap="round" 
                                    className="loading-arc"
                                />
                            </svg>
                        </div>
                        <p className="connecting-text">
                            {callState === 'connecting' ? 'Connecting you with ' : 'Connected - AI Agent is speaking...'}
                            {callState === 'connecting' && selectedAgent.name}
                        </p>
                        <p className="call-instruction">
                            {callState === 'connecting' && 'Please wait while we connect you...'}
                            {callState === 'connected' && 'The agent will introduce themselves and start the conversation. You can speak naturally!'}
                        </p>
                    </div>
                    <button 
                        className="call-button end-call-button" 
                        onClick={onEndCall}
                        style={{
                            backgroundColor: '#dc2626'
                        }}
                    >
                        End Call
                    </button>
                </div>
            ) : (
                <div className="call-limit-popup">
                    <div className="call-limit-card">
                        <h3 className="call-limit-title">Call limit reached</h3>
                        <p className="call-limit-text">For more explore the platform</p>
                        <button 
                            className="get-started-button"
                            onClick={onEndCall}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RightPanel;

