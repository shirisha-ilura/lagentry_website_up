import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftPanel from './LeadQualification/LeftPanel';
import RightPanel from './LeadQualification/RightPanel';
import './WhyChooseLagentry.css';
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
        prompt: `You are a professional Lead Qualification agent for Lagentry, an AI automation platform. [enthusiastic] Your role is to qualify potential customers and understand their business needs. [warm, friendly] Always speak with confidence and show genuine interest in helping potential clients. [pause] Use natural pauses in your speech to sound more human and engaging. [excited] When discussing solutions, express enthusiasm about how Lagentry can help transform their business. [empathetic] Listen carefully to their pain points and respond with understanding. [confident] Be persuasive but never pushy - let them know you're here to help them succeed.`
    },
    {
        id: 'customer-support' as AgentId,
        title: 'Customer Support · Zara',
        name: 'Customer Support',
        color: 'green',
        hashtags: ['#Real-Time Booking', '#Receptionist'],
        buttonColor: buttonColors.green,
        voiceId: 'jqcCZkN6Knx8BJ5TBdYR',
        prompt: `You are a friendly Customer Support agent for a restaurant using Lagentry's AI platform. [warm, welcoming] Your role is to help customers with reservations, menu questions, and general inquiries. [cheerful] Always greet customers with genuine warmth and enthusiasm. [pause] Use natural pauses to make conversations feel more natural and less robotic. [helpful] Show eagerness to assist and make their dining experience special. [empathetic] If there's an issue, acknowledge their concern with understanding. [excited] When discussing menu items or specials, express genuine excitement about the food. [friendly] Maintain a positive, upbeat tone throughout every interaction.`
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

const WhyChooseLagentry: React.FC = () => {
    const navigate = useNavigate();
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
                console.error('VAPI SDK not found after 5 seconds.');
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
            const response = await fetch('http://localhost:3001/api/start-voice-call', {
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

            if (!response.ok) {
                throw new Error('Failed to start voice call');
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

            vapi.on('error', (error: any) => {
                console.error('Call error:', error);
                setCallState('ended');
                if (error?.errorMsg) {
                    alert(`Call error: ${error.errorMsg}`);
                } else {
                    alert('Call error occurred. Please try again.');
                }
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
                    if (status.endedReason === 'silence-timed-out') {
                        alert('Call ended due to no audio detected. Please check your microphone and try again.');
                    }
                }
            });

            // Start WebRTC call
            console.log('Starting VAPI call...');
            await vapi.start(data.agentId);
            console.log('VAPI call initiated successfully');

        } catch (error: any) {
            console.error('Voice call error:', error);
            setCallState('ended');
            
            let errorMessage = 'Unknown error occurred.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                errorMessage = 'Failed to connect to backend server. Please ensure the backend server is running on port 3001.';
            }
            
            alert(`Failed to start call: ${errorMessage}\n\nPlease check:\n1. Backend server is running (http://localhost:3001)\n2. No firewall blocking the connection\n3. Check browser console for more details`);
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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
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
    );
};

export default WhyChooseLagentry;
