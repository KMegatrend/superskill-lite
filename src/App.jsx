import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import PrivateGate from './components/PrivateGate';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Showcase from './components/Showcase';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return window.location.hash === '#dashboard' ? 'dashboard' : 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (window.location.hash === '' || window.location.hash === '#landing') {
        setCurrentView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleGoToMarketplace = () => {
    window.location.href = '/marketplace.html';
  };

  return (
    <PrivateGate>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />
      {currentView === 'landing' ? (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white pb-20 relative">
          <Header onSignIn={handleGoToMarketplace} />
          <main className="max-w-6xl mx-auto px-6 w-full">
            <Hero onGetStarted={handleGoToMarketplace} />
            <Features />
            <Showcase />
            <FAQ />
          </main>
          <Footer />
        </div>
      ) : currentView === 'admin' ? (
        <AdminPanel onBack={() => setCurrentView('dashboard')} />
      ) : (
        <Dashboard 
          onSignOut={() => {
            window.location.hash = '';
            setCurrentView('landing');
          }} 
          onAdmin={() => setCurrentView('admin')}
          onMarketplace={handleGoToMarketplace}
        />
      )}
    </PrivateGate>
  );
}
