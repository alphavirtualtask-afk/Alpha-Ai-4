import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ViewMode } from '../../types';
import { ArrowLeft, ShieldCheck, Lock, Mail, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../firebase/AuthContext';

interface AdminLoginProps {
  onNavigate: (view: ViewMode) => void;
  onLoginSuccess: (role: 'client' | 'admin') => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onNavigate,
  onLoginSuccess,
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('alphavirtualtask@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setNotice('Please provide your administrative credentials.');
      return;
    }

    setIsLoading(true);
    setNotice(null);

    try {
      let authUser;
      try {
        authUser = await signInWithEmail(email.trim(), password);
      } catch (signInErr: any) {
        const msg = signInErr?.message || '';
        const code = signInErr?.code || '';

        // If the user record doesn't exist in Firebase Authentication yet,
        // automatically provision/register the authorized administrator account
        if (
          email.trim().toLowerCase() === 'alphavirtualtask@gmail.com' &&
          (code === 'auth/invalid-credential' ||
            code === 'auth/user-not-found' ||
            msg.includes('invalid-credential') ||
            msg.includes('user-not-found'))
        ) {
          try {
            authUser = await signUpWithEmail(
              email.trim(),
              password,
              'Alpha Virtual Task Operations Admin',
              undefined,
              'Alpha Virtual Task'
            );
          } catch (signUpErr: any) {
            const signUpMsg = signUpErr?.message || '';
            if (signUpMsg.includes('email-already-in-use')) {
              setNotice(
                'Invalid credentials. If this administrator account was registered with Google, please click "Continue with Admin Google Account" below.'
              );
              return;
            }
            throw signInErr;
          }
        } else {
          throw signInErr;
        }
      }

      // Strictly verify admin authorization
      if (authUser?.email?.toLowerCase() === 'alphavirtualtask@gmail.com') {
        onLoginSuccess('admin');
      } else {
        // Automatically deny access and sign out normal user
        await logout();
        setNotice('Access Denied: This account does not possess administrative clearance.');
      }
    } catch (err: any) {
      console.error('Admin authentication failure:', err);
      const msg = err?.message || '';
      if (
        msg.includes('invalid-credential') ||
        msg.includes('user-not-found') ||
        msg.includes('wrong-password')
      ) {
        setNotice(
          'Invalid credentials. If you previously registered using Google, please use "Continue with Admin Google Account" below.'
        );
      } else {
        setNotice(err?.message || 'Authentication failed. Please verify administrative status.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setNotice(null);
    try {
      const googleUser = await signInWithGoogle();
      if (googleUser?.email?.toLowerCase() === 'alphavirtualtask@gmail.com') {
        onLoginSuccess('admin');
      } else {
        await logout();
        setNotice(
          'Access Denied: Only alphavirtualtask@gmail.com is authorized for administrative console access.'
        );
      }
    } catch (err: any) {
      console.error('Google Admin Sign-In error:', err);
      setNotice(err?.message || 'Google authentication was cancelled or failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0E] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient dark metallic grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1A202E_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#E5A93C]/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Back to Home */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-[#141924] px-3 py-1.5 rounded-lg border border-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Site</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[#E5A93C] text-xs font-mono font-semibold uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Internal Operations Management</span>
        </div>

        <Logo size="lg" showTagline={false} className="justify-center mb-4" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
          Admin Console Sign In
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Authorized administrative access via Firebase Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#10141D] py-8 px-6 sm:px-10 rounded-2xl border border-[#202738] shadow-2xl space-y-6">
          
          {notice && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span className="leading-relaxed">{notice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Gmail / Email"
              type="email"
              placeholder="alphavirtualtask@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Admin Password"
              type="password"
              placeholder="alphavirtualtask@Admin.alpha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                isLoading={isLoading}
                className="w-full font-bold shadow-lg shadow-[#E5A93C]/10"
                icon={<KeyRound className="w-4 h-4" />}
                iconPosition="right"
              >
                Sign In to Admin Portal
              </Button>
            </div>
          </form>

          {/* Alternative Google Sign In for Admin */}
          <div className="space-y-3 pt-1">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                <span className="bg-[#10141D] px-2.5 text-slate-400">or admin identity provider</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              className="w-full text-xs font-semibold border-[#2B354A] flex items-center justify-center gap-2 hover:bg-white/5"
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
              <span>Continue with Admin Google Account</span>
            </Button>
          </div>

          {/* Security & Architecture Compliance Notice */}
          <div className="pt-4 border-t border-white/5 space-y-2 text-[11px] text-slate-400 bg-[#141926]/70 p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>RBAC Security Protected</span>
            </div>
            <p className="leading-relaxed">
              Administrative credentials are authenticated directly by Firebase Authentication.
              Role-based security rules enforce that only verified administrators can view or update client records.
            </p>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={() => onNavigate('client-signin')}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Switch to Client Portal Sign In →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
