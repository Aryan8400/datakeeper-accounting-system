import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { storage } from "../services/storageService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed demo account for first-time users (remove when Supabase is connected)
    const users = storage.getUsers([]);
    if (users.length === 0) {
      storage.setUsers([
        {
          id: "demo-user",
          name: "Jay Durge",
          email: "demo@jaydurgetraders.com",
          password: "demo123",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    const session = storage.getSession();
    setUser(session);
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const users = storage.getUsers([]);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) throw new Error("Invalid email or password.");
    const session = { id: found.id, name: found.name, email: found.email };
    storage.setSession(session);
    setUser(session);
    return session;
  }, []);

  const signup = useCallback(({ name, email, password }) => {
    const users = storage.getUsers([]);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists.");
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    storage.setUsers([...users, newUser]);
    const session = { id: newUser.id, name: newUser.name, email: newUser.email };
    storage.setSession(session);
    setUser(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    storage.clearSession();
    setUser(null);
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
