import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { signIn, signUp, signOut, getCurrentSession } from "../services/supabaseService.js";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSessionFromUrl = async () => {
      if (typeof window === "undefined") return;
      const url = window.location.href;
      if (url.includes("access_token") || url.includes("type=") || url.includes("refresh_token")) {
        try {
          const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) {
            console.error("Auth callback error:", error);
            return;
          }
          if (data?.session?.user) {
            setUser({
              id: data.session.user.id,
              name: data.session.user.user_metadata?.name || data.session.user.email,
              email: data.session.user.email,
            });
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error("Failed to process auth callback:", err);
        }
      }
    };

    const checkSession = async () => {
      try {
        await handleSessionFromUrl();
        const session = await getCurrentSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email,
            email: session.user.email,
          });
        }
      } catch (err) {
        console.error("Failed to check session:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email,
          email: session.user.email,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { session } = await signIn(email, password);
      if (session?.user) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email,
          email: session.user.email,
        };
        setUser(userData);
        return userData;
      }
    } catch (err) {
      throw new Error(err.message || "Invalid email or password.");
    }
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    try {
      const { user: newUser } = await signUp({ email, password, name });
      if (newUser) {
        const userData = {
          id: newUser.id,
          name: name,
          email: email,
        };
        setUser(userData);
        return userData;
      }
    } catch (err) {
      throw new Error(err.message || "Failed to create account.");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
