import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CompanyProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
  web: string;
  tps: string;
  tvq: string;
  sector: string;
  logoUri: string | null;
  extra: Record<string, string>;
}

export interface InvoiceItem {
  id: string;
  desc: string;
  qty: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  due: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  items: InvoiceItem[];
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  createdAt: string;
}

interface AppState {
  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;

  // Plan
  plan: 'free' | 'starter' | 'pro';
  setPlan: (plan: 'free' | 'starter' | 'pro') => void;
  sendCount: number;
  incrementSendCount: () => void;

  // Company
  profile: CompanyProfile;
  setProfile: (profile: Partial<CompanyProfile>) => void;

  // Invoices
  invoices: Invoice[];
  invoiceCounter: number;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  getNextNumber: () => string;

  // Persist
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  onboardingComplete: false,
  setOnboardingComplete: (v) => {
    set({ onboardingComplete: v });
    get().saveToStorage();
  },

  plan: 'free',
  setPlan: (plan) => {
    set({ plan, sendCount: 0 });
    get().saveToStorage();
  },
  sendCount: 0,
  incrementSendCount: () => {
    set((s) => ({ sendCount: s.sendCount + 1 }));
    get().saveToStorage();
  },

  profile: {
    name: '',
    phone: '',
    email: '',
    address: '',
    web: '',
    tps: '',
    tvq: '',
    sector: 'construction',
    logoUri: null,
    extra: {},
  },
  setProfile: (data) => {
    set((s) => ({ profile: { ...s.profile, ...data } }));
    get().saveToStorage();
  },

  invoices: [],
  invoiceCounter: 1,
  addInvoice: (invoice) => {
    set((s) => ({
      invoices: [invoice, ...s.invoices],
      invoiceCounter: s.invoiceCounter + 1,
    }));
    get().saveToStorage();
  },
  updateInvoice: (id, data) => {
    set((s) => ({
      invoices: s.invoices.map((inv) => inv.id === id ? { ...inv, ...data } : inv),
    }));
    get().saveToStorage();
  },
  getNextNumber: () => {
    const year = new Date().getFullYear();
    const count = get().invoiceCounter;
    return `FAC-${year}-${String(count).padStart(4, '0')}`;
  },

  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem('factura_state');
      if (data) {
        const parsed = JSON.parse(data);
        set(parsed);
      }
    } catch (e) {
      console.error('Load error:', e);
    }
  },

  saveToStorage: async () => {
    try {
      const { onboardingComplete, plan, sendCount, profile, invoices, invoiceCounter } = get();
      await AsyncStorage.setItem('factura_state', JSON.stringify({
        onboardingComplete, plan, sendCount, profile, invoices, invoiceCounter,
      }));
    } catch (e) {
      console.error('Save error:', e);
    }
  },
}));
