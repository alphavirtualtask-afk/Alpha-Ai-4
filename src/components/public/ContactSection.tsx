import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Clock, Send, CheckCircle2, Shield, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { COMPANY_INFO, SERVICES_DATA } from '../../data/mockData';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Modal } from '../common/Modal';
import { useAuth } from '../../firebase/AuthContext';
import { createBooking } from '../../firebase/bookingService';

interface ContactSectionProps {
  initialService?: string;
  onNavigateToDashboard?: () => void;
  onNavigateToAuth?: (mode: 'signin' | 'signup') => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  initialService = '',
  onNavigateToDashboard,
  onNavigateToAuth,
}) => {
  const { user, userProfile, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(initialService || 'Data Entry');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auth gate modal state
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Auto-fill user profile if logged in
  useEffect(() => {
    if (userProfile || user) {
      if (!fullName) {
        setFullName(userProfile?.displayName || user?.displayName || '');
      }
      if (!email) {
        setEmail(userProfile?.email || user?.email || '');
      }
      if (!phone && userProfile?.phoneNumber) {
        setPhone(userProfile.phoneNumber);
      }
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (initialService) {
      setService(initialService);
    }
  }, [initialService]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!message.trim()) newErrors.message = 'Please provide a message or requirements';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeSaveBooking = async (uid: string, clientEmail: string, clientDisplayName: string) => {
    setIsSubmitting(true);
    try {
      const bookingId = await createBooking({
        userId: uid,
        clientName: fullName || clientDisplayName,
        email: email || clientEmail,
        phone: phone || undefined,
        serviceName: service,
        requirements: message,
      });
      setIsSubmitting(false);
      setSubmittedBookingId(bookingId);
      setShowAuthGate(false);
    } catch (err) {
      setIsSubmitting(false);
      console.error('Failed to create booking:', err);
      setErrors({ form: 'Failed to record booking in database. Please try again.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Requirement: Add sign in / sign up for users before store users data and their booking
    if (!user) {
      setAuthEmail(email);
      setAuthName(fullName);
      setShowAuthGate(true);
      return;
    }

    await executeSaveBooking(user.uid, user.email || email, fullName);
  };

  const handleModalGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const authUser = await signInWithGoogle();
      await executeSaveBooking(authUser.uid, authUser.email || email, authUser.displayName || fullName);
      setAuthLoading(false);
    } catch (err: unknown) {
      setAuthLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError(`Google authentication error: ${msg}`);
      }
    }
  };

  const handleModalEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      let authUser;
      if (authMode === 'signin') {
        authUser = await signInWithEmail(authEmail, authPassword);
      } else {
        authUser = await signUpWithEmail(authEmail, authPassword, authName || fullName, phone);
      }
      await executeSaveBooking(authUser.uid, authEmail, authName || fullName);
      setAuthLoading(false);
    } catch (err: unknown) {
      setAuthLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('user-not-found') || msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        setAuthError('Invalid email or password.');
      } else if (msg.includes('email-already-in-use')) {
        setAuthError('This email is already registered. Please sign in instead.');
      } else {
        setAuthError(`Authentication error: ${msg}`);
      }
    }
  };

  const resetForm = () => {
    setFullName(userProfile?.displayName || user?.displayName || '');
    setEmail(userProfile?.email || user?.email || '');
    setPhone(userProfile?.phoneNumber || '');
    setService('Data Entry');
    setMessage('');
    setSubmittedBookingId(null);
  };

  return (
    <section id="contact" className="py-24 bg-[#0E121A] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#E5A93C] mb-3">
            <span>Direct Communication · {COMPANY_INFO.phone}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight text-balance">
            Contact Us
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Reach out to our project management team for an immediate response, custom scope, or confidential proposal.
          </p>
        </div>

        {/* Clear Contact Action Buttons (Requirement 5) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
          {/* Call Us Button */}
          <a
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            className="flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl bg-[#141926] border border-[#2B354A] hover:border-[#E5A93C] hover:bg-[#1A2133] hover:shadow-lg hover:shadow-[#E5A93C]/10 text-white font-semibold text-sm transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E5A93C]/15 text-[#E5A93C] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-white group-hover:text-[#F5B942] transition-colors leading-tight">
                Call Us
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {COMPANY_INFO.phone}
              </div>
            </div>
          </a>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${COMPANY_INFO.whatsappRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl bg-[#141926] border border-[#2B354A] hover:border-emerald-500 hover:bg-[#1A2133] hover:shadow-lg hover:shadow-emerald-500/10 text-white font-semibold text-sm transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-white group-hover:text-emerald-300 transition-colors leading-tight">
                WhatsApp
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {COMPANY_INFO.phone}
              </div>
            </div>
          </a>

          {/* Email Us Button */}
          <a
            href={`mailto:${COMPANY_INFO.email}`}
            className="flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl bg-[#141926] border border-[#2B354A] hover:border-[#E5A93C] hover:bg-[#1A2133] hover:shadow-lg hover:shadow-[#E5A93C]/10 text-white font-semibold text-sm transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E5A93C]/15 text-[#E5A93C] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-white group-hover:text-[#F5B942] transition-colors leading-tight">
                Email Us
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">
                {COMPANY_INFO.email}
              </div>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Contact Information & Channels */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#121622] rounded-2xl p-7 border border-[#222838]">
              <h3 className="text-lg font-bold text-white font-display mb-6">
                Direct Channels
              </h3>

              <div className="space-y-6">
                
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#181E2C] border border-[#2B354A] flex items-center justify-center text-[#E5A93C] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Phone Number
                    </div>
                    <a
                      href={`tel:${COMPANY_INFO.phoneRaw}`}
                      className="text-sm font-semibold text-white hover:text-[#E5A93C] transition-colors mt-0.5 block font-mono"
                    >
                      {COMPANY_INFO.phone}
                    </a>
                    <div className="text-xs text-slate-400 mt-1">
                      Mon – Sat: 8:00 AM – 10:00 PM EST
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#181E2C] border border-[#2B354A] flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                      WhatsApp Chat & Support
                    </div>
                    <a
                      href={`https://wa.me/${COMPANY_INFO.whatsappRaw}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors mt-0.5 block font-mono"
                    >
                      {COMPANY_INFO.whatsapp}
                    </a>
                    <div className="text-xs text-slate-400 mt-1">
                      Fast response for urgent requests
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#181E2C] border border-[#2B354A] flex items-center justify-center text-[#E5A93C] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Official Email
                    </div>
                    <a
                      href={`mailto:${COMPANY_INFO.email}`}
                      className="text-sm font-semibold text-white hover:text-[#E5A93C] transition-colors mt-0.5 block"
                    >
                      {COMPANY_INFO.email}
                    </a>
                    <div className="text-xs text-slate-400 mt-1">
                      Direct inbox for quotes and RFPs
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#181E2C] border border-[#2B354A] flex items-center justify-center text-[#E5A93C] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Operations Hours
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      {COMPANY_INFO.hours}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Continuous round-the-clock shift coverage
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* User Session Status */}
            {user ? (
              <div className="bg-[#121620] rounded-xl p-4 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Signed in as {userProfile?.displayName || user.displayName || user.email}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono">
                      Your booking will be saved directly to your account
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#121620] rounded-xl p-4 border border-[#E5A93C]/30 flex items-start gap-3">
                <Lock className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Secure Task Booking: </span>
                  Sign in or create an account to store your service booking in Firestore and track milestone progress.
                </div>
              </div>
            )}

            {/* Privacy & Guarantee Card */}
            <div className="bg-[#121620] rounded-xl p-5 border border-white/5 flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#E5A93C] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white">Your Data Is Safe: </span>
                All files, communications, and requirements submitted to Alpha Virtual Task are governed by strict commercial NDAs and Firebase cloud security rules.
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-[#121622] rounded-2xl p-7 sm:p-9 border border-[#222838] shadow-xl">
            
            {submittedBookingId ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white font-display">
                  Booking Recorded in Firebase!
                </h3>
                <div className="p-3 bg-[#161B26] border border-white/10 rounded-xl inline-block font-mono text-sm text-[#E5A93C] font-bold">
                  Booking Reference: {submittedBookingId}
                </div>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-white">{fullName}</span>. Your data and booking requirements have been safely stored in your account database. An Alpha Virtual Task project lead will review and follow up with a proposal within 2–4 business hours.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    Send Another Message / Booking
                  </Button>
                  {onNavigateToDashboard && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onNavigateToDashboard}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                      iconPosition="right"
                    >
                      View in My Dashboard
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-white/10 pb-4 mb-2">
                  <h3 className="text-xl font-bold text-white font-display">
                    Send Us a Message & Task Brief
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill out the form below. Sign in / sign up is verified before saving your project booking in the database.
                  </p>
                </div>

                {errors.form && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    {errors.form}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Name *"
                    placeholder="e.g. Alexander Mercer"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={errors.fullName}
                    required
                  />

                  <Input
                    label="Email *"
                    type="email"
                    placeholder="e.g. alexander@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    placeholder="e.g. 91+ 7738767859"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Service (Optional)
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full bg-[#161B26] border border-[#2B3242] text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E5A93C] transition-colors"
                    >
                      {SERVICES_DATA.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Custom Virtual Task Scope">Custom Virtual Task Scope</option>
                    </select>
                  </div>
                </div>

                <Textarea
                  label="Message Box *"
                  placeholder="Tell us about your requirements, project scope, data volume, questions, or specific instructions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  error={errors.message}
                  rows={4}
                  required
                />

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    isLoading={isSubmitting}
                    icon={<Send className="w-4 h-4" />}
                    iconPosition="right"
                    className="w-full sm:w-auto"
                  >
                    Send Message
                  </Button>

                  {!user && (
                    <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                      Sign in prompt will verify your booking account
                    </span>
                  )}
                </div>
              </form>
            )}

          </div>

        </div>

      </div>

      {/* Sign In / Sign Up Gate Modal */}
      {showAuthGate && (
        <Modal
          isOpen={showAuthGate}
          onClose={() => setShowAuthGate(false)}
          title="Sign In or Sign Up to Confirm Booking"
          subtitle="Your task details will be securely saved under your account in Firestore"
          maxWidth="md"
        >
          <div className="space-y-4">
            {authError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {authError}
              </div>
            )}

            {/* Quick Google Sign In */}
            <Button
              variant="secondary"
              size="md"
              type="button"
              isLoading={authLoading}
              onClick={handleModalGoogleAuth}
              className="w-full border-slate-700 bg-[#161B26] hover:bg-[#1E2433] text-white flex items-center justify-center gap-2.5 py-2.5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#121620] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
                Or with Email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Toggle Sign In / Sign Up */}
            <div className="flex rounded-lg bg-[#161B26] p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  authMode === 'signin' ? 'bg-[#E5A93C] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  authMode === 'signup' ? 'bg-[#E5A93C] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleModalEmailAuth} className="space-y-3 pt-1">
              {authMode === 'signup' && (
                <Input
                  label="Full Name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              )}

              <Input
                label="Email Address"
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAuthGate(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" isLoading={authLoading}>
                  {authMode === 'signin' ? 'Sign In & Submit Booking' : 'Sign Up & Submit Booking'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </section>
  );
};
