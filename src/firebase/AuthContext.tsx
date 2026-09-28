import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
    company?: string,
    countryCode?: string,
    countryIso?: string,
    fullPhoneNumber?: string
  ) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
        return data;
      } else {
        const isAdminUser = firebaseUser.email === 'alphavirtualtask@gmail.com';
        const rawProfile: Record<string, any> = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Client User',
          role: isAdminUser ? 'admin' : 'client',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (firebaseUser.phoneNumber) {
          rawProfile.phoneNumber = firebaseUser.phoneNumber;
        }
        const newProfile = rawProfile as UserProfile;
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await fetchOrCreateProfile(firebaseUser);
        } catch (e) {
          console.error('Error fetching user profile from Firestore:', e);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    setUser(result.user);
    if (result.user) {
      await fetchOrCreateProfile(result.user);
    }
    return result.user;
  };

  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    if (result.user) {
      await fetchOrCreateProfile(result.user);
    }
    return result.user;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
    company?: string,
    countryCode?: string,
    countryIso?: string,
    fullPhoneNumber?: string
  ): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    if (result.user) {
      await updateProfile(result.user, { displayName });
      const userDocRef = doc(db, 'users', result.user.uid);
      const isAdminUser = email === 'alphavirtualtask@gmail.com';
      const rawProfile: Record<string, any> = {
        id: result.user.uid,
        email,
        displayName,
        role: isAdminUser ? 'admin' : 'client',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (phoneNumber?.trim()) rawProfile.phoneNumber = phoneNumber.trim();
      if (countryCode?.trim()) rawProfile.countryCode = countryCode.trim();
      if (countryIso?.trim()) rawProfile.countryIso = countryIso.trim();
      if (fullPhoneNumber?.trim()) rawProfile.fullPhoneNumber = fullPhoneNumber.trim();
      if (company?.trim()) rawProfile.company = company.trim();

      const newProfile = rawProfile as UserProfile;
      try {
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${result.user.uid}`);
      }
    }
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const isAdmin = user?.email === 'alphavirtualtask@gmail.com' || userProfile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
