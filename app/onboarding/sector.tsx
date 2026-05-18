import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useStore } from '../../src/store';
import { colors, SECTORS, spacing, radius } from '../../src/theme';

export default function SectorScreen() {
  const { profile, setProfile } = useStore();
  const [selected, setSelected] = useState(profile.sector || 'construction');

  const handleNext = () => {
    setProfile({ sector: selected });
    router.push('/onboarding/profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Factura</Text>
        <Text style={styles.sub}>Configurez votre profil une seule fois</Text>
        <View style={styles.steps}>
          {[1,2,3].map(i => (
            <View key={i} style={[styles.stepDot, i === 1 && styles.stepActive]} />
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Quel est votre domaine?</Text>
        <Text style={styles.desc}>Les champs de licences s'adaptent selon votre secteur.</Text>

        {Object.entries(SECTORS).map(([key, sec]) => (
          <TouchableOpacity
            key={key}
            style={[styles.card, selected === key && styles.cardSelected]}
            onPress={() => setSelected(key)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>{sec.icon}</Text>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, selected === key && styles.cardTitleSelected]}>
                {sec.label}
              </Text>
              <Text style={styles.cardSub}>{sec.sub}</Text>
            </View>
            {selected === key && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleNext}>
          <Text style={styles.btnText}>Continuer →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  logo: { fontFamily: 'Sora_700Bold', fontSize: 26, color: colors.accent, marginBottom: 4 },
  sub: { fontFamily: 'Sora_400Regular', fontSize: 12, color: colors.muted },
  steps: { flexDirection: 'row', gap: 6, marginTop: 14 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border2 },
  stepActive: { backgroundColor: colors.accent, width: 20 },
  scroll: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { fontFamily: 'Sora_600SemiBold', fontSize: 18, color: colors.text, marginBottom: 6 },
  desc: { fontFamily: 'Sora_400Regular', fontSize: 13, color: colors.muted, marginBottom: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  cardSelected: { borderColor: colors.accent, backgroundColor: '#1a0e00' },
  cardIcon: { fontSize: 24 },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: colors.text },
  cardTitleSelected: { color: colors.accent },
  cardSub: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted, marginTop: 2 },
  checkBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: '#000', fontSize: 12, fontWeight: '700' },
  footer: { padding: spacing.xl, paddingBottom: 34, borderTopWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  btnText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#000' },
});
