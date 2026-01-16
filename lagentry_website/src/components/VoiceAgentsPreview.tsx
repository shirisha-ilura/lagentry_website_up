import React, { useState, useEffect, useRef } from 'react';
import LeftPanel from './LeadQualification/LeftPanel';
import RightPanel from './LeadQualification/RightPanel';
import './LeadQualification/LeadQualificationPage.css';

// Declare VAPI SDK types
declare global {
    interface Window {
        Vapi: any;
    }
}

type AgentId = 'lead-qualification' | 'customer-support' | 'real-estate';

// Button color definitions
const buttonColors = {
    pink: {
        normal: '#ec4899',
        hover: '#db2777'
    },
    green: {
        normal: '#10b981',
        hover: '#059669'
    },
    purple: {
        normal: '#a855f7',
        hover: '#9333ea'
    }
};

const agents = [
    {
        id: 'lead-qualification' as AgentId,
        title: 'Lead Qualification · Layla',
        name: 'Lead Qualification',
        color: 'pink',
        hashtags: ['#Real-Time Booking', '#Lead Qualification'],
        buttonColor: buttonColors.pink,
        voiceId: 'cgSgspJ2msm6clMCkdW9',
        prompt: `You are a professional Lead Qualification agent for Lagentry, an AI automation platform. Note: Pronounce 'Lagentry' as 'Laejentry' (with a soft 'g' like 'j'). [enthusiastic] Your role is to qualify potential customers and understand their business needs. [warm, friendly] Always speak with confidence and show genuine interest in helping potential clients. [pause] Use natural pauses in your speech to sound more human and engaging. [excited] When discussing solutions, express enthusiasm about how Lagentry can help transform their business. [empathetic] Listen carefully to their pain points and respond with understanding. [confident] Be persuasive but never pushy - let them know you're here to help them succeed.`
    },
    {
        id: 'customer-support' as AgentId,
        title: 'Customer Support · Zara',
        name: 'Customer Support',
        color: 'green',
        hashtags: ['#Real-Time Booking', '#Receptionist'],
        buttonColor: buttonColors.green,
        voiceId: 'jqcCZkN6Knx8BJ5TBdYR',
        prompt: `You are a friendly Customer Support agent for a restaurant using Lagentry's AI platform. Note: Pronounce 'Lagentry' as 'Laejentry' (with a soft 'g' like 'j'). [warm, welcoming] Your role is to help customers with reservations, menu questions, and general inquiries. [cheerful] Always greet customers with genuine warmth and enthusiasm. [pause] Use natural pauses to make conversations feel more natural and less robotic. [helpful] Show eagerness to assist and make their dining experience special. [empathetic] If there's an issue, acknowledge their concern with understanding. [excited] When discussing menu items or specials, express genuine excitement about the food. [friendly] Maintain a positive, upbeat tone throughout every interaction.`
    },
    {
        id: 'real-estate' as AgentId,
        title: 'Real Estate · Ahmed',
        name: 'Real Estate',
        color: 'purple',
        hashtags: ['#Real Estate', '#Property'],
        buttonColor: buttonColors.purple,
        voiceId: '1SM7GgM6IMuvQlz2BwM3',
        prompt: `You are Ahmed, ACME Corp's Real Estate AI Agent. [professional, confident] You help buyers, tenants, and investors with inventory, unit availability, pricing, viewing bookings, brochures, floor plans, and support requests. [warm, approachable] Always greet clients with genuine warmth and professionalism. [pause] Use natural pauses in your speech to sound more human and thoughtful. [enthusiastic] When discussing properties, show genuine excitement about matching clients with their perfect home or investment. [empathetic] Listen carefully to their needs and respond with understanding. [confident] Be knowledgeable and reassuring when answering questions about pricing, availability, and property details. [helpful] Go above and beyond to ensure clients feel supported throughout their real estate journey.`
    }
];

const VoiceAgentsPreview: React.FC = () => {
    const [selectedId, setSelectedId] = useState<AgentId>('lead-qualification');
    const selectedAgent = agents.find(a => a.id === selectedId) ?? agents[0];
    const [callState, setCallState] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const vapiCallRef = useRef<any>(null);
    const vapiSDKLoadedRef = useRef(false);

    // Check if VAPI SDK is loaded (it should be loaded from index.html)
    useEffect(() => {
        // Check immediately first
        if (window.Vapi) {
            vapiSDKLoadedRef.current = true;
            console.log('VAPI SDK already loaded from index.html');
            return;
        }

        // Wait a bit for the script from index.html to load
        const checkSDK = setInterval(() => {
            if (window.Vapi) {
                vapiSDKLoadedRef.current = true;
                clearInterval(checkSDK);
                console.log('VAPI SDK loaded from index.html');
            }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkSDK);
            if (!vapiSDKLoadedRef.current && !window.Vapi) {
                // Only log in development to avoid console spam
                if (process.env.NODE_ENV === 'development') {
                    console.warn('VAPI SDK not found after 5 seconds. Make sure the VAPI script is loaded in index.html.');
                }
            }
        }, 5000);

        return () => {
            clearInterval(checkSDK);
        };
    }, []);

    const handleStartCall = () => {
        setShowForm(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            alert('Please fill in your name and email.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        setShowForm(false);
        setCallState('connecting');

        try {
            await initiateVoiceCall();
        } catch (error) {
            console.error('Error starting call:', error);
            setCallState('ended');
        }
    };

    const initiateVoiceCall = async () => {
        setCallState('connecting');

        try {
            // Get agent ID from backend
            // In development, use proxy from package.json (http://localhost:5001)
            // In production, use environment variable - must be set in Netlify
            const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            let backendUrl: string;

            if (isDevelopment) {
                // Directly use backend URL in development
                backendUrl = 'http://localhost:5001';
            } else {
                // In production, REACT_APP_BACKEND_URL must be set in Netlify environment variables
                backendUrl = process.env.REACT_APP_BACKEND_URL || '';
                if (!backendUrl) {
                    console.error('REACT_APP_BACKEND_URL is not set. Voice call feature will not work.');
                    throw new Error('Backend service is not configured. Please contact support.');
                }
                // Remove trailing slash if present
                backendUrl = backendUrl.replace(/\/$/, '');
            }

            const apiUrl = backendUrl ? `${backendUrl}/api/start-voice-call` : '/api/start-voice-call';
            console.log('Calling backend API:', apiUrl, 'isDevelopment:', isDevelopment);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: selectedAgent.prompt,
                    voiceId: selectedAgent.voiceId,
                    userName: formData.name,
                    userEmail: formData.email,
                    userPhone: formData.phone,
                    agentType: selectedAgent.id
                }),
            });

            console.log('Response status:', response.status, response.statusText);

            if (!response.ok) {
                // Try to read error message from response
                let errorMessage = 'Failed to start voice call';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                    if (errorData.details) {
                        errorMessage += `: ${errorData.details}`;
                    }
                } catch (e) {
                    // If response is not JSON, use status text
                    errorMessage = `Failed to start voice call (${response.status}: ${response.statusText})`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Voice call started:', data);

            // Wait for VAPI SDK to load
            if (!vapiSDKLoadedRef.current) {
                console.log('Waiting for VAPI SDK to load...');
                await new Promise((resolve, reject) => {
                    let attempts = 0;
                    const maxAttempts = 50;
                    const checkSDK = setInterval(() => {
                        attempts++;
                        if (window.Vapi) {
                            vapiSDKLoadedRef.current = true;
                            clearInterval(checkSDK);
                            console.log('VAPI SDK is now available');
                            resolve(true);
                        } else if (attempts >= maxAttempts) {
                            clearInterval(checkSDK);
                            reject(new Error('VAPI SDK failed to load. Please refresh the page.'));
                        }
                    }, 100);
                });
            }

            if (!window.Vapi) {
                throw new Error('VAPI SDK not loaded. Please refresh the page and try again.');
            }

            console.log('Initializing VAPI with agent ID:', data.agentId);

            const publicApiKey = data.publicApiKey || 'a40eb25c-29c0-44c6-a381-24d7587f572b';
            console.log('Using public API key for VAPI initialization');

            const vapi = new window.Vapi(publicApiKey);
            vapiCallRef.current = vapi;

            // Set up event listeners
            vapi.on('call-start', () => {
                console.log('Call has started');
                setCallState('connected');
            });

            vapi.on('call-end', (data: any) => {
                console.log('Call ended', data);
                setCallState('ended');
                vapiCallRef.current = null;
            });

            vapi.on('error', async (error: any) => {
                console.error('Call error:', error);
                console.error('Error type:', typeof error);
                console.error('Error keys:', error ? Object.keys(error) : 'no keys');
                
                // Try to extract error message from Response object
                let errorMessage = 'Call error occurred. Please try again.';
                
                if (error && error instanceof Response) {
                    try {
                        const errorData = await error.json();
                        console.error('Error response data:', errorData);
                        errorMessage = errorData.message || errorData.error || `HTTP ${error.status}: ${error.statusText}`;
                    } catch (e) {
                        errorMessage = `HTTP ${error.status}: ${error.statusText}`;
                    }
                } else if (error) {
                    if (typeof error === 'string') {
                        errorMessage = error;
                    } else if (error.errorMsg) {
                        errorMessage = error.errorMsg;
                    } else if (error.message) {
                        errorMessage = error.message;
                    } else if (error.error) {
                        errorMessage = typeof error.error === 'string' ? error.error : 'An error occurred';
                    } else if (error.status) {
                        errorMessage = `Call failed with status: ${error.status}`;
                    } else if (error.endedReason) {
                        // Handle VAPI meeting ended errors
                        if (error.endedReason.includes('Meeting has ended') || error.endedReason === 'meeting-ended') {
                            errorMessage = 'The meeting ended. This may be due to connection issues or timeout. Please try again.';
                        } else {
                            errorMessage = `Call ended: ${error.endedReason}`;
                        }
                    } else {
                        // Try to stringify the error object safely
                        try {
                            const errorStr = JSON.stringify(error);
                            if (errorStr !== '{}' && errorStr !== 'null') {
                                // Check if it contains meeting ended info
                                if (errorStr.includes('Meeting has ended') || errorStr.includes('meeting-ended')) {
                                    errorMessage = 'The meeting ended. This may be due to connection issues or timeout. Please try again.';
                                } else {
                                    errorMessage = `Call error: ${errorStr.substring(0, 200)}`;
                                }
                            }
                        } catch (e) {
                            // If stringification fails, use default message
                        }
                    }
                }
                
                console.error('Final error message:', errorMessage);
                alert(errorMessage);
                setCallState('ended');
                vapiCallRef.current = null;
            });

            vapi.on('user-speech-start', () => {
                console.log('User started speaking');
            });

            vapi.on('user-speech-end', () => {
                console.log('User finished speaking');
            });

            vapi.on('speech-start', () => {
                console.log('AI agent started speaking');
            });

            vapi.on('speech-end', () => {
                console.log('AI agent finished speaking');
            });

            vapi.on('message', (message: any) => {
                console.log('Message received:', message);
                if (message.type === 'transcript') {
                    console.log(`${message.role}: ${message.transcript}`);
                    if (message.role === 'user') {
                        console.log('✅ User microphone is working! User said:', message.transcript);
                    }
                }
            });

            vapi.on('customer-joined', () => {
                console.log('✅ Customer (user) joined the call - microphone should be active');
            });

            vapi.on('status-update', (status: any) => {
                console.log('Status update:', status);
                if (status.status === 'ended' && status.endedReason) {
                    console.error('Call ended reason:', status.endedReason);
                    setCallState('ended');
                    
                    let errorMessage = 'Call ended unexpectedly.';
                    
                    if (status.endedReason === 'silence-timed-out') {
                        errorMessage = 'Call ended due to no audio detected. Please check your microphone and try again.';
                    } else if (status.endedReason === 'meeting-ended' || status.endedReason?.includes('Meeting has ended')) {
                        errorMessage = 'The meeting ended. This may be due to connection issues or timeout. Please try again.';
                    } else if (status.endedReason === 'customer-join-timeout') {
                        errorMessage = 'Call timed out while connecting. Please check your microphone permissions and try again.';
                    } else if (status.endedReason) {
                        errorMessage = `Call ended: ${status.endedReason}`;
                    }
                    
                    alert(errorMessage);
                    vapiCallRef.current = null;
                }
            });

            // Start WebRTC call
            console.log('Starting VAPI call with agent ID:', data.agentId);
            console.log('VAPI instance:', vapi);
            
            // Prepare variables for the call (including customer_name)
            const callVariables = data.variables || {};
            if (formData.name && formData.name.trim()) {
                callVariables.customer_name = formData.name.trim();
            }
            
            try {
                // Try VAPI start with just the assistantId as a string (most common format)
                console.log('Attempting to start VAPI call with assistantId:', data.agentId);
                await vapi.start(data.agentId);
                console.log('VAPI call initiated successfully with assistant ID:', data.agentId);
            } catch (startError: any) {
                console.error('Error starting VAPI call:', startError);
                console.error('Start error type:', typeof startError);
                console.error('Start error details:', startError);
                
                setCallState('ended');
                
                let startErrorMessage = 'Failed to start the call. Please try again.';
                
                // Try to extract error from Response object
                if (startError && startError instanceof Response) {
                    try {
                        const errorData = await startError.json();
                        console.error('Start error response data:', errorData);
                        startErrorMessage = errorData.message || errorData.error || `HTTP ${startError.status}: ${startError.statusText}`;
                    } catch (e) {
                        startErrorMessage = `HTTP ${startError.status}: ${startError.statusText}`;
                    }
                } else if (startError?.message) {
                    startErrorMessage = startError.message;
                } else if (typeof startError === 'string') {
                    startErrorMessage = startError;
                }
                
                console.error('Final start error message:', startErrorMessage);
                alert(`Unable to start call: ${startErrorMessage}`);
                vapiCallRef.current = null;
                return;
            }

        } catch (error: any) {
            console.error('Voice call error:', error);
            console.error('Error details:', {
                message: error?.message,
                stack: error?.stack,
                name: error?.name,
                error: error
            });
            setCallState('ended');

            let errorMessage = 'Unknown error occurred.';
            
            // Properly extract error message
            if (error) {
                if (typeof error === 'string') {
                    errorMessage = error;
                } else if (error.message) {
                    errorMessage = error.message;
                } else if (error.error) {
                    errorMessage = typeof error.error === 'string' ? error.error : 'An error occurred';
                } else if (error instanceof TypeError && error.message?.includes('Failed to fetch')) {
                    const isDev = process.env.NODE_ENV === 'development';
                    if (isDev) {
                        errorMessage = 'Failed to connect to backend server. Please ensure the backend server is running on port 5001.';
                    } else {
                        errorMessage = 'Failed to connect to backend server. The service may be temporarily unavailable. Please try again later.';
                    }
                } else {
                    // Try to get a meaningful error message
                    try {
                        const errorStr = JSON.stringify(error);
                        if (errorStr !== '{}' && errorStr !== 'null') {
                            errorMessage = `Error: ${errorStr}`;
                        }
                    } catch (e) {
                        // If stringification fails, use default
                    }
                }
            }

            // Show user-friendly error messages
            if (errorMessage.includes('Backend URL not configured') || errorMessage.includes('Backend service is not configured')) {
                // This should not happen in production if env var is set correctly
                console.error('Configuration error:', errorMessage);
                alert('Service configuration error. Please contact support.');
            } else if (errorMessage.includes('Failed to fetch') || (error instanceof TypeError && error?.message?.includes('Failed to fetch'))) {
                const isDev = process.env.NODE_ENV === 'development';
                if (isDev) {
                    alert(`Failed to start call: ${errorMessage}\n\nPlease check:\n1. Backend server is running (http://localhost:5001)\n2. No firewall blocking the connection\n3. Check browser console for more details`);
                } else {
                    // In production, show a more user-friendly message
                    alert(`Unable to start call at this time. Please try again in a moment.\n\nIf the problem persists, please contact support.`);
                }
            } else {
                // For other errors, show a user-friendly message (limit length to avoid issues)
                console.error('Call failed:', errorMessage);
                const displayMessage = errorMessage.length > 200 ? errorMessage.substring(0, 200) + '...' : errorMessage;
                alert(`Unable to start call: ${displayMessage}`);
            }
        }
    };

    const handleEndCall = () => {
        if (vapiCallRef.current) {
            if (typeof vapiCallRef.current.stop === 'function') {
                vapiCallRef.current.stop();
            }
            vapiCallRef.current = null;
        }
        setCallState('idle');
        setShowForm(false);
        setFormData({ name: '', email: '', phone: '' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        console.log('Input change:', name, value);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="voice-agents-preview-container">
            <div className="lead-qualification-wrapper">
                <div className="lead-qualification-container">
                    <LeftPanel
                        selectedId={selectedId}
                        onSelect={(id) => {
                            setSelectedId(id);
                            setCallState('idle');
                            setShowForm(false);
                        }}
                    />
                    <RightPanel
                        selectedAgent={selectedAgent}
                        callState={callState}
                        onStartCall={handleStartCall}
                        onEndCall={handleEndCall}
                        showForm={showForm}
                        formData={formData}
                        onFormChange={handleInputChange}
                        onFormSubmit={handleFormSubmit}
                        onCloseForm={() => setShowForm(false)}
                    />
                </div>
                <div className="lead-qualification-footer">
                    <div className="footer-content">
                        <p className="footer-text">This is a simplified demo. Full editing is available in the platform.</p>
                        <div className="footer-cta">
                            <span className="footer-question">Ready to build real agents?</span>
                            <button className="footer-button">Try the Full Platform</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAgentsPreview;

