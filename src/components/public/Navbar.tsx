import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, User, ShieldCheck, LogOut } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { ViewMode } from '../../types';
import { useAuth } from '../../firebase/AuthContext';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenContact,
}) => {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B0D11]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Single Brand Lockup */}
          <div className="shrink-0">
            <Logo
              size="md"
              showTagline={!isScrolled}
              onClick={() => onNavigate('home')}
            />
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('home')}
              className="hover:text-[#E5A93C] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="hover:text-[#E5A93C] transition-colors cursor-pointer"
            >
              Our Services
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-[#E5A93C] transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="hover:text-[#E5A93C] transition-colors cursor-pointer"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="hover:text-[#E5A93C] transition-colors cursor-pointer"
            >
              Contact Us
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'client-dashboard')}
                  className="flex items-center gap-2 text-xs font-semibold text-white bg-[#141926] hover:bg-[#1A2030] px-3 py-2 rounded-lg border border-[#2B354A] hover:border-[#E5A93C] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span className="max-w-[120px] truncate">
                    {userProfile?.displayName || user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#E5A93C]/20 text-[#E5A93C]">
                    {isAdmin ? 'Admin' : 'Dashboard'}
                  </span>
                </button>

                <button
                  onClick={async () => {
                    await logout();
                    onNavigate('home');
                  }}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('client-signin')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onNavigate('client-signup')}
                  className="text-xs font-semibold text-slate-300 hover:text-[#E5A93C] px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>

                <button
                  onClick={() => onNavigate('admin-login')}
                  title="Admin Management Portal"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#E5A93C] px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E5A93C]/70" />
                  <span>Admin</span>
                </button>
              </>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (onOpenContact) {
                  onOpenContact();
                } else {
                  scrollToSection('contact');
                }
              }}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              Get In Touch
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => onNavigate(user ? (isAdmin ? 'admin-dashboard' : 'client-dashboard') : 'client-signin')}
              className="p-2 text-slate-300 hover:text-white"
              aria-label="User Portal"
            >
              <User className="w-5 h-5 text-[#E5A93C]" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-4 pb-6 border-t border-white/10 bg-[#0E121A]/95 rounded-xl px-4 shadow-2xl backdrop-blur-xl animate-fadeIn">
            <div className="flex flex-col gap-3 text-sm font-medium text-slate-300 mb-5">
              <button
                onClick={() => scrollToSection('home')}
                className="text-left py-2 hover:text-[#E5A93C] transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-left py-2 hover:text-[#E5A93C] transition-colors"
              >
                Our Services (14 Categories)
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left py-2 hover:text-[#E5A93C] transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => scrollToSection('reviews')}
                className="text-left py-2 hover:text-[#E5A93C] transition-colors"
              >
                Client Reviews
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-left py-2 hover:text-[#E5A93C] transition-colors"
              >
                Contact Us
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('contact');
                }}
              >
                Get In Touch
              </Button>

              {user ? (
                <div className="space-y-2 mt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(isAdmin ? 'admin-dashboard' : 'client-dashboard');
                    }}
                    icon={<User className="w-3.5 h-3.5 text-[#E5A93C]" />}
                  >
                    Open {isAdmin ? 'Admin Console' : 'My Dashboard'}
                  </Button>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      onNavigate('home');
                    }}
                    className="w-full text-center text-xs text-red-400 hover:text-red-300 py-1.5"
                  >
                    Sign Out ({user.email})
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('client-signin');
                    }}
                    icon={<User className="w-3.5 h-3.5 text-[#E5A93C]" />}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('client-signup');
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
