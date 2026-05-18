import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { WebView } from 'react-native-webview';
import { useStore } from '../../src/store';
import { colors, PLANS, spacing, radius } from '../../src/theme';

export default function PlanScreen() {
  const { setPlan, setOnboardingComplete } = useStore();
  const [selected, setSelected] = useState<'free' | 'starter' | 'pro'>('starter');
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);

  const handleStart = () => {
    if (selected === 'free') {
      setPlan('free');
      setOnboardingComplete(true);
      router.replace('/(tabs)/invoice');
    } else {
      setStripeUrl(PLANS[selected].stripeUrl!);
    }
  };

  const handlePaymentDone = () => {
    setStripeUrl(null);
    setPlan(selected);
    setOnboardingComplete(true);
    router.replace('/(tabs)/invoice');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>Factura</Text>
        <View style={styles.steps}>
          {[1,2,3].map(i => (
            <View key={i} style={[styles.stepDot, styles.stepActive]} />
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Choisissez votre plan</Text>
        <Text style={styles.desc}>Commencez gratuitement. Upgradez quand vous êtes prêt.</Text>

        {Object.values(PLANS).map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.card, selected === plan.id && styles.cardSel]}
            onPress={() => setSelected(plan.id as any)}
            activeOpacity={0.8}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAIRE</Text>
              </View>
            )}
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planName, selected === plan.id && { color: plan.color }]}>
                  {plan.name}
                </Text>
                <Text style={styles.planQuota}>{plan.quota} factures/mois</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={[styles.price, { color: plan.price === 0 ? colors.muted : plan.color }]}>
                  {plan.price === 0 ? '0$' : `${plan.price}$`}
                </Text>
                {plan.price > 0 && <Text style={styles.priceSub}>/mois</Text>}
              </View>
            </View>
            <View style={styles.featureList}>
              {plan.features.map(f => (
                <Text key={f} style={styles.feature}>
                  <Text style={{ color: plan.price === 0 ? colors.muted : colors.success }}>✓ </Text>
                  {f}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.secureRow}>
          <Text style={styles.secureText}>🔒 Paiement sécurisé via Stripe · SSL 256-bit · Annulez n'importe quand</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleStart}>
          <Text style={styles.btnText}>
            {selected === 'free' ? 'Commencer gratuitement →' : `Démarrer ${PLANS[selected].name} →`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stripe WebView Modal */}
      <Modal visible={!!stripeUrl} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setStripeUrl(null)}>
              <Text style={styles.backText}>✕ Fermer</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Paiement sécurisé</Text>
            <TouchableOpacity onPress={handlePaymentDone}>
              <Text style={[styles.backText, { color: colors.success }]}>Fait ✓</Text>
            </TouchableOpacity>
          </View>
          {stripeUrl && (
            <WebView
              source={{ uri: stripeUrl }}
              style={{ flex: 1 }}
              onNavigationStateChange={(state) => {
                if (state.url.includes('success') || state.url.includes('merci')) {
                  handlePaymentDone();
                }
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  back: { marginBottom: 8 },
  backText: { fontFamily: 'Sora_400Regular', fontSize: 13, color: colors.accent },
  logo: { fontFamily: 'Sora_700Bold', fontSize: 22, color: colors.accent },
  steps: { flexDirection: 'row', gap: 6, marginTop: 12 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border2 },
  stepActive: { backgroundColor: colors.accent, width: 20 },
  scroll: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { fontFamily: 'Sora_600SemiBold', fontSize: 18, color: colors.text, marginBottom: 6 },
  desc: { fontFamily: 'Sora_400Regular', fontSize: 13, color: colors.muted, marginBottom: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 12, position: 'relative' },
  cardSel: { borderColor: colors.accent, backgroundColor: '#1a0e00' },
  popularBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  popularText: { fontFamily: 'Sora_700Bold', fontSize: 9, color: '#000', letterSpacing: 0.5 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  planName: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: colors.text, marginBottom: 3 },
  planQuota: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted },
  priceBox: { alignItems: 'flex-end' },
  price: { fontFamily: 'Sora_700Bold', fontSize: 24 },
  priceSub: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted, marginTop: -2 },
  featureList: { gap: 5 },
  feature: { fontFamily: 'Sora_400Regular', fontSize: 12, color: colors.textSub, lineHeight: 18 },
  secureRow: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginTop: 4 },
  secureText: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted, textAlign: 'center', lineHeight: 16 },
  footer: { padding: spacing.xl, paddingBottom: 34, borderTopWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  btnText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#000' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, paddingTop: 60, borderBottomWidth: 1, borderColor: colors.border },
  modalTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: colors.text },
});
