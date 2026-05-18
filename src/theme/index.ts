export const colors = {
  bg: '#080808',
  surface: '#111111',
  surface2: '#161616',
  border: '#1f1f1f',
  border2: '#2a2a2a',
  accent: '#f97316',
  accentDark: '#ea580c',
  text: '#f0f0f0',
  textSub: '#aaaaaa',
  muted: '#666666',
  success: '#4ade80',
  error: '#ef4444',
  purple: '#8b5cf6',
  white: '#ffffff',
};

export const fonts = {
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semibold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const SECTORS = {
  construction: {
    label: 'Construction & Rénovation',
    icon: '🏗',
    sub: 'RBQ # · CCQ # · NEQ · Licence entrepreneur',
    fields: [
      { id: 'rbq', label: 'Numéro RBQ', placeholder: '8888-8888-88' },
      { id: 'neq', label: 'NEQ (Registraire)', placeholder: '1234567890' },
      { id: 'ccq', label: 'Numéro CCQ', placeholder: 'CCQ-123456' },
      { id: 'lic', label: 'Licence entrepreneur', placeholder: 'Général — 4.1.1' },
    ],
  },
  transport: {
    label: 'Transport & Camionnage',
    icon: '🚛',
    sub: 'MC # · US DOT # · CVOR # · IFTA · Transporteur QC',
    fields: [
      { id: 'mc', label: 'MC # (USA)', placeholder: 'MC-1234567' },
      { id: 'dot', label: 'US DOT #', placeholder: 'DOT-1234567' },
      { id: 'cvor', label: 'CVOR # (Ontario)', placeholder: 'CVOR-123456' },
      { id: 'ifta', label: 'IFTA #', placeholder: 'QC-1234567' },
      { id: 'tqc', label: 'Transporteur QC', placeholder: 'T-123456' },
      { id: 'neq', label: 'NEQ', placeholder: '1234567890' },
    ],
  },
  piscine: {
    label: 'Piscines & Paysagement',
    icon: '🏊',
    sub: 'Certification pisciniste · RBQ · NEQ',
    fields: [
      { id: 'pisciniste', label: 'Cert. pisciniste', placeholder: 'AQPG-12345' },
      { id: 'rbq', label: 'RBQ # (si applicable)', placeholder: '8888-8888-88' },
      { id: 'neq', label: 'NEQ', placeholder: '1234567890' },
    ],
  },
  electro: {
    label: 'Électricien & Plombier',
    icon: '⚡',
    sub: 'RBQ # · Licence maître · NEQ · CCQ',
    fields: [
      { id: 'rbq', label: 'Numéro RBQ *', placeholder: '8888-8888-88' },
      { id: 'maitre', label: 'Licence maître', placeholder: 'ME-12345' },
      { id: 'ccq', label: 'Numéro CCQ', placeholder: 'CCQ-123456' },
      { id: 'neq', label: 'NEQ', placeholder: '1234567890' },
    ],
  },
  it: {
    label: 'TI · Design · Agence',
    icon: '💻',
    sub: 'NEQ · Numéro incorporation',
    fields: [
      { id: 'neq', label: 'NEQ (Registraire)', placeholder: '1234567890' },
      { id: 'inc', label: 'Incorporation fédérale', placeholder: '123456-8' },
    ],
  },
  autre: {
    label: 'Autre / Général',
    icon: '📋',
    sub: 'Champs standards',
    fields: [
      { id: 'neq', label: 'NEQ', placeholder: '1234567890' },
      { id: 'permit', label: 'Permis / Licence', placeholder: '—' },
    ],
  },
};

export const PLANS = {
  free: {
    id: 'free',
    name: 'Essai gratuit',
    price: 0,
    quota: 3,
    label: 'GRATUIT',
    color: '#555',
    features: ['3 factures', '1 template', 'Avec filigrane'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    quota: 50,
    label: 'STARTER',
    color: '#f97316',
    popular: true,
    features: ['50 factures/mois', '4 templates', 'Sans filigrane', 'Logo inclus', 'PDF haute qualité'],
    stripeUrl: 'https://buy.stripe.com/VOTRE_LIEN_STARTER',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 17.99,
    quota: 100,
    label: 'PRO',
    color: '#8b5cf6',
    features: ['100 factures/mois', 'Tous les templates', 'Logo + couleurs', 'Historique complet', 'Suivi paiements'],
    stripeUrl: 'https://buy.stripe.com/VOTRE_LIEN_PRO',
  },
};
