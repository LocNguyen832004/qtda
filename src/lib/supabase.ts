import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const createMockSupabase = () => {
  const emptyResult = { data: null, error: null };
  const emptyQuery = {
    select: () => emptyQuery,
    insert: async () => emptyResult,
    update: () => emptyQuery,
    delete: () => emptyQuery,
    eq: () => emptyQuery,
    order: () => emptyQuery,
    single: async () => emptyResult,
    then: (resolve: (value: unknown) => void) => Promise.resolve(emptyResult).then(resolve),
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase chua duoc cau hinh.' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase chua duoc cau hinh.' } }),
      signOut: async () => ({ error: null }),
    },
    from: () => emptyQuery,
    rpc: async () => emptyResult,
  };
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : (createMockSupabase() as any);
