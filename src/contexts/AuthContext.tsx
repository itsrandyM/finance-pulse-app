
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState, resetApplicationState } from '@/lib/authUtils';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event, newSession?.user?.email);
        
        if (!mounted) return;

        // Handle sign out events
        if (event === 'SIGNED_OUT' || !newSession) {
          console.log('User signed out, clearing state');
          setSession(null);
          setUser(null);
          // Clean up any cached data when user signs out
          resetApplicationState();
          return;
        }

        // Handle sign in events
        if (event === 'SIGNED_IN' && newSession) {
          console.log('User signed in:', newSession.user.email);
          setSession(newSession);
          setUser(newSession.user);
        }

        // Handle token refresh
        if (event === 'TOKEN_REFRESHED' && newSession) {
          console.log('Token refreshed for user:', newSession.user.email);
          setSession(newSession);
          setUser(newSession.user);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // If there's an error getting session, clean up any stale data
          resetApplicationState();
          setSession(null);
          setUser(null);
        } else if (currentSession) {
          console.log('Existing session found for user:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log('No existing session found');
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        resetApplicationState();
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clear any existing state before signing in
      resetApplicationState();
      
      // Attempt global sign out to prevent limbo states, ignore errors
      await supabase.auth.signOut({ scope: 'global' }).catch(err => 
        console.warn("Pre-signin global signout failed", err)
      );

      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      console.log('Sign in successful for user:', data.user?.email);
      
      // The auth state change listener will handle setting the session
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      
      // Clear any existing state before signing up
      resetApplicationState();
      
      const redirectUrl = `${window.location.origin}/`;
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('Signing out user:', user?.email);
      
      // Clear application state first
      resetApplicationState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error("Global signout failed:", error);
      }
      
      // Force clear the local state immediately
      setSession(null);
      setUser(null);
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Force a full page reload to the auth page to ensure a clean state
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoading,
      signIn, 
      signUp, 
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
