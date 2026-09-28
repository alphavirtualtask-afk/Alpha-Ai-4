import React, { useState } from 'react';
import { CountryCode } from 'libphonenumber-js';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { InternationalPhoneInput, PhoneChangeData } from '../common/InternationalPhoneInput';
import { ViewMode } from '../../types';
import { useAuth } from '../../firebase/AuthContext';
import { ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface ClientSignUpProps {
  onNavigate: (view: ViewMode) => void;
  onLoginSuccess: (role: 'client' | 'admin') => void;
}

export const ClientSignUp: React.FC<ClientSignUpProps> = ({
  onNavigate,
  onLoginSuccess,
}) => {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [countryIso, setCountryIso] = useState<CountryCode>('IN');
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handlePhoneChange = (data: PhoneChangeData) => {
    setPhone(data.phoneNumber);
    setCountryCode(data.countryCode);
    setCountryIso(data.countryIso);
    setFullPhoneNumber(data.fullPhoneNumber);
    setIsPhoneValid(data.isValid);
    setPhoneError(data.errorMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate phone number according to international formats if provided
    if (phone.trim() && !isPhoneValid) {
      setError(phoneError || 'Please enter a valid international phone number for the selected country');
      return;
    }

    setIsLoading(true);
    try {
      // Store country code and phone number separately in the user profile/database
      await signUpWithEmail(
        email,
        password,
        fullName,
        phone.trim() || undefined,
        businessName.trim() || undefined,
        countryCode,
        countryIso,
        fullPhoneNumber.trim() || undefined
      );
      setIsLoading(false);
      const role = email.toLowerCase() === 'alphavirtualtask@gmail.com' ? 'admin' : 'client';
      onLoginSuccess(role);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('email-already-in-use')) {
        setError('An account with this email address already exists. Please sign in instead.');
      } else if (msg.includes('operation-not-allowed')) {
        setError('Email/Password registration is not yet enabled in your Firebase console. Please sign in with Google or enable Email/Password provider.');
      } else {
        setError(`Registration failed: ${msg}`);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const authUser = await signInWithGoogle();
      setIsGoogleLoading(false);
      const role = authUser.email?.toLowerCase() === 'alphavirtualtask@gmail.com' ? 'admin' : 'client';
      onLoginSuccess(role);
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setError(`Google registration error: ${msg}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#E5A93C]/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-[#141924] px-3 py-1.5 rounded-lg border border-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Logo size="lg" showTagline={true} className="justify-center mb-6" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
          Create Client Account
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Sign up to store your profile and task bookings in Firebase
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <div className="bg-[#121622] py-8 px-6 sm:px-10 rounded-2xl border border-[#222838] shadow-2xl space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Google Sign In / Sign Up */}
          <Button
            variant="secondary"
            size="md"
            type="button"
            isLoading={isGoogleLoading}
            onClick={handleGoogleSignUp}
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
            <span>Sign up with Google</span>
          </Button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#121622] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
              Or with details
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="Alexander Mercer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Email Address *"
                type="email"
                placeholder="alexander@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InternationalPhoneInput
                label="Phone Number"
                phoneNumber={phone}
                countryCode={countryCode}
                countryIso={countryIso}
                onChange={handlePhoneChange}
                error={phoneError && phone.trim() ? phoneError : undefined}
                helperText="Select country code & enter national digits"
              />

              <Input
                label="Business / Organization (Optional)"
                placeholder="e.g. Lumina Retail Group"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password *"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password *"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                isLoading={isLoading}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Create Account & Open Portal
              </Button>
            </div>
          </form>

          {/* Firebase Connection Confirmation */}
          <div className="pt-4 border-t border-white/5 text-[11px] text-slate-400 flex items-start gap-2 bg-[#161B26]/60 p-3 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Firebase Firestore:</span>{' '}
              Profiles and bookings are securely stored in Firestore under project <code className="text-[#E5A93C]">alpha-virtual-task</code>.
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('client-signin')}
                className="font-semibold text-[#E5A93C] hover:text-[#FDE68A] transition-colors cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
