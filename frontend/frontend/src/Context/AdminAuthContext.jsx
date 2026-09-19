import React, { createContext, useContext, useState, useCallback } from "react";

const AdminAuthContext = createContext();
const SESSION_KEY = "avora_admin_session";

// Only this exact email/password pair may unlock the admin panel.
const ADMIN_EMAIL = "mansi@gmail.com";
const ADMIN_PASSWORD = "Mansi@123";

function loadSession() {
  try {
    return localStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(loadSession);

  const adminLogin = useCallback(({ email, password }) => {
    if (email?.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, "true");
      setIsAdmin(true);
      return;
    }
    throw new Error("Invalid admin email or password");
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export default AdminAuthContext;
