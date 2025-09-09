import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

let cachedUser: User | null = null;
let initializing = true;
let listenerStarted = false;
let subscribers: Array<(u: User | null) => void> = [];

const ensureAuthListener = () => {
  if (listenerStarted) return;
  listenerStarted = true;
  onAuthStateChanged(auth, (user) => {
    cachedUser = user;
    initializing = false;
    subscribers.forEach((cb) => cb(user));
  });
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(initializing);

  useEffect(() => {
    ensureAuthListener();
    const cb = (u: User | null) => {
      setUser(u);
      setLoading(false);
    };
    subscribers.push(cb);
    return () => {
      subscribers = subscribers.filter((s) => s !== cb);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
  };
};