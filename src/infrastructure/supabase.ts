import { createClient } from '@supabase/supabase-js';

// Polyfill WebSocket constructor for Node environments (like Jest running on Node 18)
// to prevent RealtimeClient initialization from throwing "WebSocket support required" crashes.
if (typeof WebSocket === 'undefined') {
  (global as any).WebSocket = class {};
}

// Fallback dummy credentials to prevent Jest / test suites from crashing during import when env is not loaded.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-string';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing! Offline Guest Mode will be active.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
