import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const STORAGE_KEY = 'avora_user';
const TOKEN_KEY = 'avora_token';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Attach the token to every outgoing request at request-time, reading fresh
// from localStorage. This avoids a race where a child component's own
// useEffect (which fires before a parent's, e.g. AuthProvider's) sends a
// request before the token had a chance to be set on axios.defaults.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const signup = useCallback(async ({ name, email, password }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
      const { access_token, user: newUser } = response.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'An error occurred during signup');
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { access_token, user: loggedInUser } = response.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Incorrect email or password');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    const merged = { ...loadUser(), ...updatedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setUser(merged);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
