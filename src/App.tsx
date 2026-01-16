import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import Header from './components/Header';
import WelcomePage from './components/WelcomePage';
import AgentDemoCards from './components/AgentDemoCards';
import WhyChooseLagentry from './components/WhyChooseLagentry';
import ChooseConnectComplete from './components/ChooseConnectComplete';
import Dashboard from './components/Dashboard';
import GmailSection from './components/GmailSection';
import Footer from './components/Footer';
import Pricing from './pages/Pricing';
import BookDemo from './pages/BookDemo';
import Waitlist from './pages/Waitlist';
import Features from './pages/Features';
import Agents from './pages/Agents';
import AdminChats from './pages/AdminChats';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import {
  GTMSalesAgentPage,
  HRRecruitmentAgentPage,
  CFOFinanceAgentPage,
  CustomerSupportAgentPage,
  RealEstateAgentPage,
  HealthcareAgentPage,
} from './pages/AgentPages';
import { hasIntroCompleted } from './introState';
import Chatbot from './components/Chatbot';

const HomePage: React.FC = () => {
  // Ensure AgentDemoCards is hidden during the initial purple intro animation
  // and only appears after it has finished on first hard refresh.
  const [showAgentsSection, setShowAgentsSection] = useState(() => hasIntroCompleted());

  useEffect(() => {
    if (hasIntroCompleted()) {
      setShowAgentsSection(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowAgentsSection(true);
    }, 5500); // slightly after Header finishes hiding

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      <WelcomePage />
      {showAgentsSection && (
        <>
          <AgentDemoCards />
          <WhyChooseLagentry />
          <ChooseConnectComplete />
          <Dashboard />
          <GmailSection />
          <Footer />
        </>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/gtm-sales" element={<GTMSalesAgentPage />} />
          <Route path="/agents/hr-recruitment" element={<HRRecruitmentAgentPage />} />
          <Route path="/agents/cfo-finance" element={<CFOFinanceAgentPage />} />
          <Route path="/agents/customer-support" element={<CustomerSupportAgentPage />} />
          <Route path="/agents/real-estate" element={<RealEstateAgentPage />} />
          <Route path="/agents/healthcare" element={<HealthcareAgentPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/book-demo" element={<BookDemo />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/chats" 
            element={
              <ProtectedRoute>
                <AdminChats />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
};

export default App;
