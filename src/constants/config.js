import { Platform } from 'react-native';

/**
 * Backend API Configuration for XAMPP / phpMyAdmin
 *
 * Candidate hosts:
 * 1. Android Emulator: '10.0.2.2' points to the computer's localhost.
 * 2. Physical Android Phone (Wi-Fi): PC's local IP '10.159.10.179'.
 * 3. Localhost (for 'adb reverse tcp:80 tcp:80' or iOS / Web): 'localhost'.
 */
export const PC_WIFI_IP = '10.159.10.179';
export const EMULATOR_IP = '10.0.2.2';

export const SERVER_PRESETS = [
  { label: '📱 Real Phone (Wi-Fi)', url: `http://${PC_WIFI_IP}/insta-api` },
  { label: '💻 Android Emulator', url: `http://${EMULATOR_IP}/insta-api` },
  { label: '⚡ Localhost (adb / web)', url: 'http://localhost/insta-api' },
];

export const CANDIDATE_URLS = [
  `http://${EMULATOR_IP}/insta-api`,
  `http://${PC_WIFI_IP}/insta-api`,
  'http://localhost/insta-api',
  'http://192.168.137.1/insta-api',
];

// Current active base URL (mutable so user or auto-fallback can change it)
let currentBaseUrl = Platform.select({
  android: `http://${EMULATOR_IP}/insta-api`,
  default: 'http://localhost/insta-api',
});

export const getApiBaseUrl = () => currentBaseUrl;

export const setApiBaseUrl = (url) => {
  if (url) {
    currentBaseUrl = url.replace(/\/+$/, '');
  }
  return currentBaseUrl;
};

// Backwards compatibility export
export const API_BASE_URL = currentBaseUrl;

// Curated avatar choices for easy selection in profile setup/edit
export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250',
];
