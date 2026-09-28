import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode } from './types';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { ServicesSection } from './components/public/ServicesSection';
import { WhyChooseUs } from './components/public/WhyChooseUs';
import { HowItWorks } from './components/public/HowItWorks';
import { AboutUs } from './components/public/AboutUs';
import { ReviewsSection } from './components/public/ReviewsSection';
import { CTASection } from './components/public/CTASection';
import { ContactSection } from './components/public/ContactSection';
import { Footer } from './components/public/Footer';
import { ClientSignIn } from './components/auth/ClientSignIn';
import { ClientSignUp } from './components/auth/ClientSignUp';
import { AdminLogin } from './components/auth/AdminLogin';
import { ClientDashboard } from './components/dashboard/client/ClientDashboard';
import { AdminDashboard } from './components/dashboard/admin/AdminDashboard';
import { useAuth } from './firebase/AuthContext';

export default function App() {
  const { user, userProfile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [contactInitialService, setContactInitialService] = useState<string>('');

  const isUserAdmin = user?.email === 'alphavirtualtask@gmail.com' || userProfile?.role === 'admin';

  // Parse path or hash to resolve view mode
  const getViewFromLocation = useCallback((): ViewMode => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // Check hash first since it's most specific and reliable on GH Pages
    if (hash.includes('/admin/login') || hash.includes('admin/login')) {
      return 'admin-login';
    }
    if (hash === '#/admin' || hash === '#admin' || hash.includes('admin-dashboard')) {
      return 'admin-dashboard';
    }
    if (hash.includes('client-dashboard') || hash.includes('dashboard')) {
      return 'client-dashboard';
    }
    if (hash.includes('signin') || hash.includes('login')) {
      return 'client-signin';
    }
    if (hash.includes('signup')) {
      return 'client-signup';
    }

    // Fallback to path check if hash is not set
    if (path.endsWith('/admin/login') || path.includes('/admin/login')) {
      return 'admin-login';
    }
    if (path.endsWith('/admin') || path.startsWith('/admin/') || path.includes('/admin')) {
      return 'admin-dashboard';
    }
    if (path.endsWith('/dashboard') || path.startsWith('/client/dashboard') || path.includes('/dashboard')) {
      return 'client-dashboard';
    }
    if (path.endsWith('/login') || path.includes('/client/login') || path.includes('/login')) {
      return 'client-signin';
    }
    if (path.endsWith('/signup') || path.includes('/client/signup') || path.includes('/signup')) {
      return 'client-signup';
    }
    return 'home';
  }, []);

  const navigateView = useCallback((view: ViewMode, updateHistory = true) => {
    setCurrentView(view);
    if (!updateHistory) return;

    // Detect if we should use hash routing (GitHub Pages or subfolder deployment)
    const isGitHubPages = window.location.hostname.includes('github.io');
    // If we're deployed to a subdirectory, pathname won't be just '/' (or empty), e.g. /my-repo/
    const isSubdirectory = window.location.pathname !== '/' && !['/login', '/signup', '/dashboard', '/admin', '/admin/login'].includes(window.location.pathname);
    const useHash = isGitHubPages || isSubdirectory || window.location.hash !== '';

    if (useHash) {
      let targetHash = '#/';
      if (view === 'admin-dashboard') targetHash = '#/admin';
      else if (view === 'admin-login') targetHash = '#/admin/login';
      else if (view === 'client-dashboard') targetHash = '#/dashboard';
      else if (view === 'client-signin') targetHash = '#/login';
      else if (view === 'client-signup') targetHash = '#/signup';

      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
    } else {
      let targetPath = '/';
      if (view === 'admin-dashboard') targetPath = '/admin';
      else if (view === 'admin-login') targetPath = '/admin/login';
      else if (view === 'client-dashboard') targetPath = '/dashboard';
      else if (view === 'client-signin') targetPath = '/login';
      else if (view === 'client-signup') targetPath = '/signup';

      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, []);

  // Listen to popstate for browser navigation (Back / Forward / Direct URL)
  useEffect(() => {
    const handlePopState = () => {
      const targetView = getViewFromLocation();
      navigateView(targetView, false);
    };

    // Initial check on boot
    const initialView = getViewFromLocation();
    if (initialView !== 'home') {
      navigateView(initialView, false);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getViewFromLocation, navigateView]);

  // Enforce security: strictly guard /admin route against unauthorized normal users
  useEffect(() => {
    if (currentView === 'admin-dashboard' && !loading) {
      if (!user) {
        // Not logged in -> redirect to admin login
        navigateView('admin-login');
      } else if (!isUserAdmin) {
        // Logged in as normal client user -> deny access and redirect to client dashboard
        console.warn('Unauthorized direct access attempt to /admin blocked. Redirecting to client workspace.');
        navigateView('client-dashboard');
      }
    }
  }, [currentView, user, isUserAdmin, loading, navigateView]);

  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
      navigateView('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestServiceFromCard = (serviceName: string) => {
    setContactInitialService(serviceName);
    scrollToSection('contact');
  };

  const handleLoginSuccess = (role: 'client' | 'admin') => {
    if (role === 'admin') {
      navigateView('admin-dashboard');
    } else {
      navigateView('client-dashboard');
    }
  };

  // Render Client Dashboard
  if (currentView === 'client-dashboard') {
    return (
      <ClientDashboard
        onLogout={() => navigateView('home')}
        onNavigateHome={() => navigateView('home')}
      />
    );
  }

  // Render Admin Dashboard (only accessible if authorized)
  if (currentView === 'admin-dashboard') {
    if (!loading && (!user || !isUserAdmin)) {
      // Security fallback during render
      return (
        <AdminLogin
          onNavigate={(view) => navigateView(view)}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    return (
      <AdminDashboard
        onLogout={() => navigateView('home')}
        onNavigateHome={() => navigateView('home')}
      />
    );
  }

  // Render Client Sign In
  if (currentView === 'client-signin') {
    return (
      <ClientSignIn
        onNavigate={(view) => navigateView(view)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Render Client Sign Up
  if (currentView === 'client-signup') {
    return (
      <ClientSignUp
        onNavigate={(view) => navigateView(view)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Render Admin Login
  if (currentView === 'admin-login') {
    return (
      <AdminLogin
        onNavigate={(view) => navigateView(view)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Render Public Website (Home)
  return (
    <div className="min-h-screen bg-[#0B0D11] text-slate-100 flex flex-col font-sans selection:bg-[#E5A93C] selection:text-black">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => navigateView(view)}
        onOpenContact={() => scrollToSection('contact')}
      />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onExploreServices={() => scrollToSection('services')}
          onGetInTouch={() => scrollToSection('contact')}
        />

        {/* 2. Services Section (14 Services with Category Filter & Modals) */}
        <ServicesSection onRequestService={handleRequestServiceFromCard} />

        {/* 3. Why Choose Us Section */}
        <WhyChooseUs />

        {/* 4. How It Works Section */}
        <HowItWorks onStartProject={() => scrollToSection('contact')} />

        {/* 5. About Us Section */}
        <AboutUs onContactClick={() => scrollToSection('contact')} />

        {/* 6. Reviews / Testimonials Section */}
        <ReviewsSection />

        {/* 7. Call To Action Section */}
        <CTASection
          onGetStarted={() => scrollToSection('services')}
          onContactUs={() => scrollToSection('contact')}
        />

        {/* 8. Contact Section */}
        <ContactSection
          initialService={contactInitialService}
          onNavigateToDashboard={() => navigateView('client-dashboard')}
          onNavigateToAuth={(mode) => navigateView(mode === 'signin' ? 'client-signin' : 'client-signup')}
        />
      </main>

      {/* 9. Footer */}
      <Footer
        onNavigate={(view) => navigateView(view)}
        onScrollTo={(id) => scrollToSection(id)}
      />
    </div>
  );
}
