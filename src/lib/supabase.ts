import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================
// AUTH
// ============================================
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// ============================================
// PROFILE
// ============================================
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, profile: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return { data, error };
};

// ============================================
// INVOICES
// ============================================
export const getInvoices = async (userId: string) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createInvoice = async (invoice: any) => {
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();
  return { data, error };
};

export const updateInvoice = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { data, error };
};

// ============================================
// QUOTA — vérifier avant envoi
// ============================================
export const checkAndIncrementQuota = async (userId: string, plan: string) => {
  const limits: Record<string, number> = { free: 3, starter: 50, pro: 100 };
  const limit = limits[plan] || 3;

  const { data: profile } = await supabase
    .from('profiles')
    .select('send_count, send_reset_at')
    .eq('id', userId)
    .single();

  if (!profile) return { allowed: false, remaining: 0 };

  const resetDate = new Date(profile.send_reset_at);
  const now = new Date();
  const isNewMonth = now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear();

  if (isNewMonth) {
    await supabase.from('profiles').update({ send_count: 1, send_reset_at: now.toISOString() }).eq('id', userId);
    return { allowed: true, remaining: limit - 1 };
  }

  if (profile.send_count >= limit) return { allowed: false, remaining: 0 };

  await supabase.from('profiles').update({ send_count: profile.send_count + 1 }).eq('id', userId);
  return { allowed: true, remaining: limit - profile.send_count - 1 };
};
