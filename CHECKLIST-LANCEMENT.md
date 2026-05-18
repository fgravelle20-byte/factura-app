# ✅ CHECKLIST — FACTURA PRÊT À LANCER

Faites les étapes dans l'ordre. Chaque étape = 5-10 minutes max.

---

## ÉTAPE 1 — SUPABASE (Backend gratuit)
**Site: https://supabase.com**

1. [ ] Créez un compte (gratuit)
2. [ ] "New Project" → Nom: factura-app → Région: US East (le plus proche)
3. [ ] Attendez 2 minutes que le projet démarre
4. [ ] Allez dans **SQL Editor** → collez le contenu de `supabase-schema.sql` → Run
5. [ ] Allez dans **Settings > API**
6. [ ] Copiez **Project URL** → collez dans `app.json` à la place de `VOTRE_SUPABASE_URL`
7. [ ] Copiez **anon public key** → collez dans `app.json` à la place de `VOTRE_SUPABASE_ANON_KEY`

---

## ÉTAPE 2 — STRIPE (Paiements)
**Site: https://stripe.com**

1. [ ] Créez un compte (gratuit)
2. [ ] Vérifiez votre identité + compte bancaire (requis pour recevoir des $)
3. [ ] Allez dans **Products** → "Add product"
4. [ ] Créez **Starter**: Nom: "Factura Starter" / Prix: 9.99$ / Récurrent / Mensuel
5. [ ] Créez **Pro**: Nom: "Factura Pro" / Prix: 17.99$ / Récurrent / Mensuel
6. [ ] Allez dans **Payment Links** → Créez un lien pour chaque produit
7. [ ] Copiez les 2 liens dans `src/theme/index.ts`
8. [ ] Allez dans **Developers > API Keys** → copiez la clé publishable dans `app.json`

---

## ÉTAPE 3 — STRIPE WEBHOOK (Automatique quand un client paie)

1. [ ] Installez Supabase CLI: `npm install -g supabase`
2. [ ] Connectez-vous: `supabase login`
3. [ ] Linkez votre projet: `supabase link --project-ref VOTRE_PROJECT_REF`
4. [ ] Déployez le webhook: `supabase functions deploy stripe-webhook`
5. [ ] Dans Stripe Dashboard > **Webhooks** → "Add endpoint"
6. [ ] URL: `https://VOTRE_PROJECT.supabase.co/functions/v1/stripe-webhook`
7. [ ] Événements à écouter: `checkout.session.completed` + `invoice.paid` + `customer.subscription.deleted`
8. [ ] Copiez le **Webhook Secret** → ajoutez dans Supabase > Settings > Edge Functions

---

## ÉTAPE 4 — EXPO (Build l'app)

1. [ ] `npm install -g eas-cli`
2. [ ] `eas login` (créez un compte expo.dev si pas encore fait — gratuit)
3. [ ] Dans le dossier de l'app: `eas build:configure`
4. [ ] Testez sur votre téléphone: `npx expo start` + app Expo Go

---

## ÉTAPE 5 — APPLE APP STORE

1. [ ] Créez compte Apple Developer: https://developer.apple.com/programs/ (99$/an)
2. [ ] Dans `eas.json` → remplacez `VOTRE_APPLE_ID` etc.
3. [ ] Build: `eas build --platform ios --profile production`
4. [ ] Soumettez: `eas submit --platform ios`
5. [ ] Dans App Store Connect → remplissez la description, captures d'écran
6. [ ] Soumettez pour review → 1-3 jours

---

## ÉTAPE 6 — GOOGLE PLAY

1. [ ] Créez compte Google Play Console: https://play.google.com/console (25$ une fois)
2. [ ] Build: `eas build --platform android --profile production`
3. [ ] Soumettez: `eas submit --platform android`
4. [ ] Dans Google Play Console → remplissez la fiche
5. [ ] Soumettez pour review → 1-2 jours

---

## TEMPS TOTAL ESTIMÉ

| Étape | Temps |
|-------|-------|
| Supabase | 15 min |
| Stripe | 20 min |
| Webhook | 10 min |
| Build Expo | 20 min |
| App Store submission | 30 min |
| Google Play submission | 20 min |
| **TOTAL** | **~2 heures** |

---

## REVENUS POTENTIELS

| Clients | Plan moyen | Revenue/mois |
|---------|-----------|--------------|
| 50 | Starter 9.99$ | 499$/mois |
| 100 | Starter 9.99$ | 999$/mois |
| 200 | Mix 13$/avg | 2,600$/mois |
| 500 | Mix 13$/avg | 6,500$/mois |

**Coûts mensuels:**
- Supabase: 0$ (gratuit jusqu'à 50,000 users)
- Expo EAS: 0$ (plan gratuit suffit pour commencer)
- Stripe: ~3% des transactions seulement
- Apple/Google: déjà payé lors de l'inscription

---

## SUPPORT

Pour toute question technique → revenez avec Claude.
