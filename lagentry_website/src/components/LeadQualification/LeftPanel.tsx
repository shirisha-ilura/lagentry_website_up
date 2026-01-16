import React from 'react';

const BarsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="8" width="3" height="8" rx="1.5" fill="currentColor" />
        <rect x="7" y="4" width="3" height="12" rx="1.5" fill="currentColor" />
        <rect x="12" y="6" width="3" height="10" rx="1.5" fill="currentColor" />
        <rect x="17" y="2" width="3" height="14" rx="1.5" fill="currentColor" />
    </svg>
);


interface LeftPanelProps {
    selectedId: 'lead-qualification' | 'customer-support' | 'real-estate';
    onSelect: (id: 'lead-qualification' | 'customer-support' | 'real-estate') => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ selectedId, onSelect }) => {
    // Dynamic titles based on selected agent
    const getTitle = () => {
        switch (selectedId) {
            case 'lead-qualification':
                return 'Test the Lead Qualification Live';
            case 'customer-support':
                return 'Test the Customer Support Live';
            case 'real-estate':
                return 'Test the Real Estate Live';
            default:
                return 'Test the Lead Qualification Live';
        }
    };

    const getDescription = () => {
        switch (selectedId) {
            case 'lead-qualification':
                return 'This agent can answer questions using trusted internal documents or URLs.';
            case 'customer-support':
                return 'This agent can handle customer inquiries, bookings, and support requests.';
            case 'real-estate':
                return 'This agent can help with property inquiries, bookings, and real estate questions.';
            default:
                return 'This agent can answer questions using trusted internal documents or URLs.';
        }
    };

    return (
        <div className="left-panel">
            <div className="header-section">
                <h1 className="main-title">{getTitle()}</h1>
                <p className="description">{getDescription()}</p>
            </div>

            <div className="left-panel-preview">
                <div className="left-panel-card">
                    <div
                        className={
                            'preview-option' +
                            (selectedId === 'lead-qualification' ? ' preview-option-active' : '')
                        }
                        onClick={() => onSelect('lead-qualification')}
                    >
                        <div className="preview-icon preview-icon-pink">
                            <BarsIcon />
                        </div>
                        <div className="preview-text">
                            <span className="preview-title">Lead Qualification · Layla</span>
                            <span className="preview-tags">#Real-Time Booking  #Lead Qualification  #Voice calling agents, with voice cloning capability</span>
                        </div>
                    </div>

                    <div
                        className={
                            'preview-option' +
                            (selectedId === 'customer-support' ? ' preview-option-active' : '')
                        }
                        onClick={() => onSelect('customer-support')}
                    >
                        <div className="preview-icon preview-icon-green">
                            <BarsIcon />
                        </div>
                        <div className="preview-text">
                            <span className="preview-title">Customer Support · Zara</span>
                            <span className="preview-tags">#Real-Time Booking  #Receptionist  #Voice calling agents, with voice cloning capability</span>
                        </div>
                    </div>

                    <div
                        className={
                            'preview-option' +
                            (selectedId === 'real-estate' ? ' preview-option-active' : '')
                        }
                        onClick={() => onSelect('real-estate')}
                    >
                        <div className="preview-icon preview-icon-blue">
                            <BarsIcon />
                        </div>
                        <div className="preview-text">
                            <span className="preview-title">Real Estate · Ahmed</span>
                            <span className="preview-tags">#Real Estate  #Property  #Voice calling agents, with voice cloning capability</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeftPanel;

