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

    return (
        <div className="left-panel">
            <div className="header-section">
                <h1 className="main-title">Test the Lead Qualification Buyer Live</h1>
                <p className="description">This agent can answer questions using trusted internal documents or URLs.</p>
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
                            <span className="preview-tags">#Real-Time Booking  #Lead Qualification</span>
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
                            <span className="preview-tags">#Real-Time Booking  #Receptionist</span>
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
                            <span className="preview-tags">#Real Estate  #Property</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeftPanel;

