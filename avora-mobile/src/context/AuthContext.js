import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'avora_user';
const TOKEN_KEY = 'avora_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate user from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const res = await client.post('/auth/signup', { name, email, password });
    return res.data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await client.post('/auth/login', { email, password });
    const { access_token, user: loggedIn } = res.data;
    await AsyncStorage.setItem(TOKEN_KEY, access_token);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, TOKEN_KEY]);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const merged = { ...user, ...data };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export default AuthContext;
