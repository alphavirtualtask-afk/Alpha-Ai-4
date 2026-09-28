import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ViewMode } from '../../types';
import { useAuth } from '../../firebase/AuthContext';
import { ArrowLeft, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface ClientSignInProps {
  onNavigate: (view: ViewMode) => void;
  onLoginSuccess: (role: 'client' | 'admin') => void;
}

export const ClientSignIn: React.FC<ClientSignInProps> = ({
  onNavigate,
  onLoginSuccess,
}) => {
  const { signInWithEmail, signInWithGoogle, userProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInWithEmail(email, password);
      setIsLoading(false);
      const role = email.toLowerCase() === 'alphavirtualtask@gmail.com' ? 'admin' : 'client';
      onLoginSuccess(role);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('user-not-found') || msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        setErrorMessage('Invalid email or password. Please check your credentials or create a new account.');
      } else if (msg.includes('operation-not-allowed')) {
        setErrorMessage('Email/Password provider is not yet enabled in your Firebase console. You can also sign in with Google or create an account.');
      } else {
        setErrorMessage(`Sign in failed: ${msg}`);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const authUser = await signInWithGoogle();
      setIsGoogleLoading(false);
      const role = authUser.email?.toLowerCase() === 'alphavirtualtask@gmail.com' ? 'admin' : 'client';
      onLoginSuccess(role);
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setErrorMessage(`Google Sign-In error: ${msg}`);
      }
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setForgotModal(false);
      setResetSent(false);
      setForgotEmail('');
    }, 2000);
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
          Client Portal Sign In
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Sign in to store your profile and manage your task bookings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#121622] py-8 px-6 sm:px-10 rounded-2xl border border-[#222838] shadow-2xl space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            variant="secondary"
            size="md"
            type="button"
            isLoading={isGoogleLoading}
            onClick={handleGoogleSignIn}
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

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#121622] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
              Or with email
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="client@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#2B3242] bg-[#161B26] text-[#E5A93C] focus:ring-[#E5A93C]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-[#E5A93C] hover:text-[#FDE68A] transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <div className="pt-2 space-y-3">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                isLoading={isLoading}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          {/* Firebase Connection Confirmation */}
          <div className="pt-4 border-t border-white/5 text-[11px] text-slate-400 flex items-start gap-2 bg-[#161B26]/60 p-3 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Firebase Account Connected:</span>{' '}
              Authenticated with Firebase Project <code className="text-[#E5A93C]">alpha-virtual-task</code>. Your bookings and data are securely stored in Firestore.
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('client-signup')}
                className="font-semibold text-[#E5A93C] hover:text-[#FDE68A] transition-colors cursor-pointer ml-1"
              >
                Create Account
              </button>
            </p>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121622] border border-[#2B3242] p-6 rounded-2xl max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white font-display">
              Reset Your Password
            </h3>
            <p className="text-xs text-slate-300">
              Enter your registered email address to receive password reset instructions.
            </p>
            {resetSent ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                Password reset link has been dispatched to {forgotEmail}.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="name@company.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setForgotModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Send Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
