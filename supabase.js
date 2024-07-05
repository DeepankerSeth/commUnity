import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseURL = 'https://trsyduvtpkmjsblvxtax.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyc3lkdXZ0cGttanNibHZ4dGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxNzYwMjMsImV4cCI6MjAzNDc1MjAyM30.sLuTSGEoH9vXx-wRK3wLeFwBjhOVNV_qEPy_IC8CYS8';

export const supabase = createClient(supabaseURL, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
