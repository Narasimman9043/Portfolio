import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

// ── Security config ───────────────────────────────────────────────────────
// SHA-256 hash of: Narasimman@2005
// To change password: run hashPassword('NewPass').then(console.log) in browser console
// then replace ADMIN_HASH below.
export const ADMIN_HASH = '6a4f24b1ac01aa5e14c7bab2515e438e686a631ddf11cfb8ea7321d82e0485fb';
const INACTIVITY_MINUTES = 15;

export async function hashPassword(plain) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const inactivityTimer = useRef(null);

  // Restore Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAdmin(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Inactivity auto-logout
  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    if (isAdmin) {
      inactivityTimer.current = setTimeout(async () => {
        await supabase.auth.signOut();
        setIsAdmin(false);
        toast('Auto-logged out after 15 min inactivity.', { icon: 'ℹ️' });
      }, INACTIVITY_MINUTES * 60 * 1000);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) { clearTimeout(inactivityTimer.current); return; }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetInactivity, { passive: true }));
    resetInactivity();
    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetInactivity));
      clearTimeout(inactivityTimer.current);
    };
  }, [isAdmin, resetInactivity]);

  /**
   * Login:
   * 1. Verify password via SHA-256 client-side (plain text never stored)
   * 2. Sign in to Supabase Auth so RLS write policies activate
   */
  const handleLogin = useCallback(async (password) => {
    setAuthLoading(true);
    try {
      // Step 1: client-side hash check
      const digest = await hashPassword(password);
      if (digest !== ADMIN_HASH) {
        toast.error('Incorrect password. Access denied.');
        return false;
      }

      // Step 2: Supabase Auth sign-in for RLS write access
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'narasimman@portfolio.com';
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password,
      });

      if (error) {
        // Auth failed but password was correct locally — still enable admin UI
        // (useful when Supabase auth user not set up yet)
        console.warn('[Auth] Supabase sign-in failed:', error.message);
      }

      setIsAdmin(true);
      toast.success('Admin mode enabled.');
      return true;
    } catch (err) {
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut().catch(() => {});
    clearTimeout(inactivityTimer.current);
    setIsAdmin(false);
    toast.success('Admin mode disabled.');
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, authLoading, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
