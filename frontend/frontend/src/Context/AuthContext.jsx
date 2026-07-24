import React, { createContext, useState, useCallback, useEffect } from 'react';
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [user]);

  const signup = useCallback(async ({ name, email, password }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
      const { access_token, user: newUser } = response.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
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
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(loggedInUser);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Incorrect email or password');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
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
