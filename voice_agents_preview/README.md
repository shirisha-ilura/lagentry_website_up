# Voice Agents Preview - Frontend & Backend Files

This folder contains all the exact files needed for the voice agents preview section.

## File Structure

### Frontend Files:
- `src/components/WhyChooseLagentry.tsx` - Main component
- `src/components/LeadQualification/LeftPanel.tsx` - Left panel with agent selection
- `src/components/LeadQualification/RightPanel.tsx` - Right panel with sphere animation and form
- `src/components/LeadQualification/SphereCanvas.tsx` - Canvas wrapper component
- `src/components/LeadQualification/hooks/useSphereAnimation.ts` - Sphere animation hook
- `src/components/LeadQualification/LeadQualificationPage.css` - Main CSS styles
- `src/components/WhyChooseLagentry.css` - Additional CSS
- `public/index.html` - HTML file with VAPI SDK script tag

### Backend Files:
- `server/index.js` - Backend server with VAPI integration
- `server/package.json` - Backend dependencies

## Setup Instructions

### Backend:
1. Navigate to `server` folder
2. Run `npm install`
3. Run `npm start` (starts on port 3001)

### Frontend:
1. Ensure VAPI SDK script is loaded in `public/index.html` (already included)
2. Import and use `WhyChooseLagentry` component in your React app

## Features:
- 3 Agents: Lead Qualification (Layla), Customer Support (Zara), Real Estate (Ahmed)
- Animated dotted sphere that moves when call starts
- Personalized greetings using user's name
- 1-minute call duration limit
- Call limit popup after call ends
- Form with name, email (required), phone (optional)
