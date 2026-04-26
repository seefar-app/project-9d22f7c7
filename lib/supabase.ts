import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://gtsgoabroyajmnyoyqoo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0c2dvYWJyb3lham1ueW95cW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODQzMTYsImV4cCI6MjA5Mjc2MDMxNn0.U0o7Uan7pxrqU4G6oKr7cG4N1dk5QB2OqJcO1qrizhI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
