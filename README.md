# 📱 FACTURA — Application Mobile

Générateur de factures professionnel pour entrepreneurs québécois.
iOS App Store + Google Play Store.

---

## 🚀 INSTALLATION RAPIDE

### 1. Prérequis
- Node.js installé (https://nodejs.org)
- Compte Expo: https://expo.dev (gratuit)
- Compte EAS (pour les builds): inclus avec Expo

### 2. Installer les dépendances
```
cd factura-app
npm install
```

### 3. Configurer vos clés (app.json)
Remplacez dans `app.json`:
- `VOTRE_SUPABASE_URL` → votre URL Supabase
- `VOTRE_SUPABASE_ANON_KEY` → votre clé Supabase
- `VOTRE_STRIPE_KEY` → votre clé Stripe publishable

Dans `src/theme/index.ts`:
- `VOTRE_LIEN_STARTER` → lien de paiement Stripe 9.99$
- `VOTRE_LIEN_PRO` → lien de paiement Stripe 17.99$

### 4. Tester sur votre téléphone
```
npx expo start
```
Scannez le QR code avec l'app **Expo Go** (iOS/Android)

---

## 📦 BUILD POUR LES STORES

### Installer EAS CLI
```
npm install -g eas-cli
eas login
eas build:configure
```

### Build Android (Google Play)
```
eas build --platform android
```

### Build iOS (App Store)
```
eas build --platform ios
```

### Soumettre aux stores
```
eas submit --platform android
eas submit --platform ios
```

---

## 💳 CONFIGURATION STRIPE

1. Créez un compte sur https://stripe.com
2. Allez dans "Payment Links"
3. Créez un lien pour 9.99$/mois (Starter)
4. Créez un lien pour 17.99$/mois (Pro)
5. Collez les liens dans `src/theme/index.ts`

---

## 🏪 COMPTES DÉVELOPPEURS REQUIS

| Platform | Coût | Lien |
|----------|------|------|
| Apple Developer | 99$/an | https://developer.apple.com |
| Google Play Console | 25$ une fois | https://play.google.com/console |

---

## 📱 FONCTIONNALITÉS

- ✅ Onboarding 3 étapes
- ✅ 6 secteurs (Construction, Transport, Piscines, Électricien, TI, Autre)
- ✅ Champs de licences par métier (RBQ, MC#, DOT#, CVOR, IFTA, etc.)
- ✅ Logo personnalisé
- ✅ Génération PDF native
- ✅ Partage PDF (email, iMessage, WhatsApp...)
- ✅ Numéro automatique FAC-2026-0001
- ✅ TPS + TVQ automatique (14.975%)
- ✅ 3 plans (Gratuit / Starter 9.99$ / Pro 17.99$)
- ✅ Paiement Stripe via WebView
- ✅ Historique des factures
- ✅ Suivi paiements (Envoyée / Payée)
- ✅ Données sauvegardées localement

---

## 📁 STRUCTURE DU PROJET

```
factura-app/
├── app/
│   ├── _layout.tsx          # Navigation principale
│   ├── onboarding/
│   │   ├── sector.tsx       # Étape 1: Choix du secteur
│   │   ├── profile.tsx      # Étape 2: Profil entreprise + Logo
│   │   └── plan.tsx         # Étape 3: Choix du plan + Stripe
│   └── (tabs)/
│       ├── _layout.tsx      # Navigation onglets
│       ├── invoice.tsx      # Créer une facture
│       ├── history.tsx      # Historique
│       └── settings.tsx     # Profil & paramètres
├── src/
│   ├── store/index.ts       # État global (Zustand)
│   └── theme/index.ts       # Couleurs, secteurs, plans
└── app.json                 # Config Expo
```
