import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Chỉ bật Supabase thật nếu cấu hình đầy đủ và không ở chế độ demo/offline
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'demo' &&
  supabaseUrl !== 'offline' &&
  !supabaseUrl.includes('your-project-id')
);

// Tạo Mock Supabase hỗ trợ chạy Offline/Demo cho buổi thuyết trình
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

  let mockSession: any = null;
  const authListeners = new Set<(event: string, session: any) => void>();

  return {
    auth: {
      getSession: async () => ({ data: { session: mockSession }, error: null }),
      getUser: async () => ({ data: { user: mockSession?.user ?? null }, error: null }),
      onAuthStateChange: (callback: any) => {
        authListeners.add(callback);
        // Nếu đã có sẵn session giả lập, gọi callback ngay lập tức
        if (mockSession) {
          callback('SIGNED_IN', mockSession);
        }
        return { data: { subscription: { unsubscribe: () => authListeners.delete(callback) } } };
      },
      signInWithPassword: async ({ email }: { email: string }) => {
        const user = { id: 'mock_user_123', email, role: 'student' };
        mockSession = { user, access_token: 'mock_token', refresh_token: 'mock_refresh' };
        authListeners.forEach((cb) => cb('SIGNED_IN', mockSession));
        return { data: { session: mockSession, user }, error: null };
      },
      signUp: async ({ email }: { email: string }) => {
        const user = { id: 'mock_user_123', email, role: 'student' };
        mockSession = { user, access_token: 'mock_token', refresh_token: 'mock_refresh' };
        authListeners.forEach((cb) => cb('SIGNED_IN', mockSession));
        return { data: { session: mockSession, user }, error: null };
      },
      signOut: async () => {
        mockSession = null;
        authListeners.forEach((cb) => cb('SIGNED_OUT', null));
        return { error: null };
      },
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
