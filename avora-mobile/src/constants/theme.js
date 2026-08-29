// ─── Avora Design System Tokens ───────────────────────────────────────────────
export const COLORS = {
  primary: '#212d43',    // deep navy
  accent: '#c86f49',     // terracotta
  accent2: '#2da7a1',    // teal
  text: '#0f1724',       // heading / primary text
  muted: '#6b7280',      // secondary text
  bg: '#f5f7fb',         // page background
  surface: '#ffffff',    // cards / panels
  border: '#e6e9f0',     // dividers
  white: '#ffffff',
  black: '#000000',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  // Status colours
  statusPending:   { bg: '#fff8e1', color: '#f59e0b' },
  statusConfirmed: { bg: '#e8f5e9', color: '#22c55e' },
  statusShipped:   { bg: '#e3f2fd', color: '#3b82f6' },
  statusDelivered: { bg: '#e8f5e9', color: '#16a34a' },
  statusCancelled: { bg: '#fce4ec', color: '#ef4444' },
  statusApproved:  { bg: '#e8f5e9', color: '#16a34a' },
  statusCompleted: { bg: '#e8f5e9', color: '#16a34a' },
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  logo: 'Leodarck',  // Same font as website navbar AVORA logo
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ─── API URL ──────────────────────────────────────────────────────────────────
// Physical device via USB: uses adb reverse tcp:3000 tcp:3000
//   so localhost on phone = port 3000 on your PC
// Local Wi-Fi IP for physical devices: change to http://10.219.46.16:3000
export const API_URL = 'http://10.219.46.16:3000';
