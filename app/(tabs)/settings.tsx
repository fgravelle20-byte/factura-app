import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useStore } from '../../src/store';
import { colors, SECTORS, PLANS, spacing, radius } from '../../src/theme';

export default function SettingsScreen() {
  const { profile, setProfile, plan, setPlan, setOnboardingComplete } = useStore();
  const sector = SECTORS[profile.sector as keyof typeof SECTORS];
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const updateExtra = (key: string, val: string) => setForm(f => ({ ...f, extra: { ...f.extra, [key]: val } }));

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setForm(f => ({ ...f, logoUri: result.assets[0].uri }));
  };

  const save = () => { setProfile(form); setEditing(false); };

  const resetApp = () => {
    Alert.alert('Réinitialiser?', 'Toutes vos données seront supprimées.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui, réinitialiser', style: 'destructive', onPress: () => { setOnboardingComplete(false); router.replace('/onboarding/sector'); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Mon profil</Text>
        <TouchableOpacity onPress={() => editing ? save() : setEditing(true)} style={styles.editBtn}>
          <Text style={styles.editBtnText}>{editing ? 'Sauvegarder ✓' : 'Modifier'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🖼 Logo</Text>
          <TouchableOpacity onPress={editing ? pickLogo : undefined} style={styles.logoBox}>
            {profile.logoUri
              ? <Image source={{ uri: editing ? form.logoUri || undefined : profile.logoUri }} style={styles.logo} resizeMode="contain" />
              : <View style={styles.logoEmpty}><Text style={styles.logoEmptyIcon}>📁</Text><Text style={styles.logoEmptyText}>{editing ? 'Touchez pour ajouter' : 'Aucun logo'}</Text></View>}
          </TouchableOpacity>
        </View>

        {/* Plan actuel */}
        <View style={[styles.section, { borderColor: PLANS[plan].color + '44' }]}>
          <Text style={styles.sectionLabel}>💳 Plan actuel</Text>
          <View style={styles.planRow}>
            <View>
              <Text style={[styles.planName, { color: PLANS[plan].color }]}>{PLANS[plan].name}</Text>
              <Text style={styles.planQuota}>{PLANS[plan].quota} factures/mois</Text>
            </View>
            <Text style={[styles.planPrice, { color: PLANS[plan].color }]}>
              {PLANS[plan].price === 0 ? 'Gratuit' : `${PLANS[plan].price}$/mois`}
            </Text>
          </View>
          {plan === 'free' && (
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/onboarding/plan')}>
              <Text style={styles.upgradeBtnText}>Passer à Starter — 9.99$/mois →</Text>
            </TouchableOpacity>
          )}
          {plan === 'starter' && (
            <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: '#8b5cf622', borderColor: '#8b5cf6' }]} onPress={() => router.push('/onboarding/plan')}>
              <Text style={[styles.upgradeBtnText, { color: '#8b5cf6' }]}>Passer à Pro — 17.99$/mois →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Infos entreprise */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📋 Informations entreprise</Text>
          {[
            { key: 'name', label: 'Nom entreprise', placeholder: 'Construction Tremblay Inc.' },
            { key: 'phone', label: 'Téléphone', placeholder: '514-555-0001' },
            { key: 'email', label: 'Email', placeholder: 'info@entreprise.com' },
            { key: 'web', label: 'Site web', placeholder: 'www.entreprise.com' },
          ].map(f => (
            <View key={f.key}>
              <Text style={styles.lbl}>{f.label}</Text>
              {editing
                ? <TextInput style={styles.inp} value={(form as any)[f.key]} onChangeText={v => update(f.key, v)} placeholder={f.placeholder} placeholderTextColor={colors.muted} />
                : <Text style={styles.val}>{(profile as any)[f.key] || '—'}</Text>}
            </View>
          ))}
          <Text style={styles.lbl}>Adresse</Text>
          {editing
            ? <TextInput style={[styles.inp, { height: 64 }]} value={form.address} onChangeText={v => update('address', v)} multiline />
            : <Text style={styles.val}>{profile.address || '—'}</Text>}
        </View>

        {/* Taxes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>💰 Taxes</Text>
          {[{ key: 'tps', label: 'TPS' }, { key: 'tvq', label: 'TVQ' }].map(f => (
            <View key={f.key}>
              <Text style={styles.lbl}>{f.label}</Text>
              {editing
                ? <TextInput style={styles.inp} value={(form as any)[f.key]} onChangeText={v => update(f.key, v)} placeholderTextColor={colors.muted} />
                : <Text style={styles.val}>{(profile as any)[f.key] || '—'}</Text>}
            </View>
          ))}
        </View>

        {/* Secteur */}
        {sector?.fields?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🪪 {sector.label}</Text>
            {sector.fields.map(f => (
              <View key={f.id}>
                <Text style={styles.lbl}>{f.label}</Text>
                {editing
                  ? <TextInput style={styles.inp} value={form.extra?.[f.id] || ''} onChangeText={v => updateExtra(f.id, v)} placeholder={f.placeholder} placeholderTextColor={colors.muted} />
                  : <Text style={styles.val}>{profile.extra?.[f.id] || '—'}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Danger zone */}
        <TouchableOpacity style={styles.resetBtn} onPress={resetApp}>
          <Text style={styles.resetText}>Réinitialiser l'application</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Factura v1.0 · Confidentialité · Conditions d'utilisation</Text>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontFamily: 'Sora_700Bold', fontSize: 22, color: colors.text },
  editBtn: { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 7, borderRadius: radius.full },
  editBtnText: { fontFamily: 'Sora_700Bold', fontSize: 12, color: '#000' },
  scroll: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  section: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: 12 },
  sectionLabel: { fontFamily: 'Sora_600SemiBold', fontSize: 10, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  lbl: { fontFamily: 'Sora_400Regular', fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, marginTop: 8 },
  inp: { backgroundColor: '#161616', borderWidth: 1, borderColor: '#252525', borderRadius: radius.md, color: colors.text, fontFamily: 'Sora_400Regular', fontSize: 13, padding: 10, marginBottom: 4 },
  val: { fontFamily: 'Sora_400Regular', fontSize: 13, color: colors.text, paddingVertical: 6, borderBottomWidth: 1, borderColor: colors.border },
  logoBox: { backgroundColor: '#0d0d0d', borderWidth: 2, borderColor: '#252525', borderStyle: 'dashed', borderRadius: radius.lg, padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 80 },
  logo: { width: 160, height: 60 },
  logoEmpty: { alignItems: 'center' },
  logoEmptyIcon: { fontSize: 24, marginBottom: 4 },
  logoEmptyText: { fontFamily: 'Sora_400Regular', fontSize: 12, color: colors.muted },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planName: { fontFamily: 'Sora_700Bold', fontSize: 15 },
  planQuota: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted, marginTop: 2 },
  planPrice: { fontFamily: 'Sora_700Bold', fontSize: 18 },
  upgradeBtn: { backgroundColor: '#1a0e00', borderWidth: 1, borderColor: colors.accent, borderRadius: radius.md, padding: 11, alignItems: 'center' },
  upgradeBtnText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: colors.accent },
  resetBtn: { backgroundColor: '#1a0000', borderWidth: 1, borderColor: '#3a1a1a', borderRadius: radius.lg, padding: 14, alignItems: 'center', marginBottom: 12 },
  resetText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: colors.error },
  footer: { alignItems: 'center', paddingVertical: 8 },
  footerText: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted, textAlign: 'center' },
});
