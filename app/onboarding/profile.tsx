import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../../src/store';
import { colors, SECTORS, spacing, radius } from '../../src/theme';

export default function ProfileScreen() {
  const { profile, setProfile } = useStore();
  const sector = SECTORS[profile.sector as keyof typeof SECTORS];

  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
    web: profile.web,
    tps: profile.tps,
    tvq: profile.tvq,
    logoUri: profile.logoUri,
    extra: { ...profile.extra },
  });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const updateExtra = (key: string, val: string) => setForm(f => ({ ...f, extra: { ...f.extra, [key]: val } }));

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setForm(f => ({ ...f, logoUri: result.assets[0].uri }));
    }
  };

  const handleNext = () => {
    if (!form.name || !form.phone || !form.email) {
      Alert.alert('Champs requis', 'Veuillez remplir le nom, téléphone et email.');
      return;
    }
    setProfile(form);
    router.push('/onboarding/plan');
  };

  const inp = (placeholder: string, key: string, opts?: any) => (
    <TextInput
      style={styles.inp}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      value={(form as any)[key]}
      onChangeText={v => update(key, v)}
      {...opts}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>Factura</Text>
        <View style={styles.steps}>
          {[1,2,3].map(i => (
            <View key={i} style={[styles.stepDot, i <= 2 && styles.stepActive]} />
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Informations de votre entreprise</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>✅ Entrez ça une seule fois — apparaît automatiquement sur chaque facture.</Text>
        </View>

        {/* LOGO */}
        <Text style={styles.sectionTitle}>🖼 Logo</Text>
        <TouchableOpacity style={styles.logoZone} onPress={pickLogo}>
          {form.logoUri ? (
            <Image source={{ uri: form.logoUri }} style={styles.logoImg} resizeMode="contain" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoIcon}>📁</Text>
              <Text style={styles.logoLabel}>Touchez pour ajouter votre logo</Text>
              <Text style={styles.logoSub}>PNG avec fond transparent recommandé</Text>
            </View>
          )}
        </TouchableOpacity>
        {form.logoUri && (
          <TouchableOpacity onPress={() => setForm(f => ({ ...f, logoUri: null }))}>
            <Text style={styles.removeLink}>🗑 Supprimer le logo</Text>
          </TouchableOpacity>
        )}

        {/* COORDONNÉES */}
        <Text style={styles.sectionTitle}>📋 Coordonnées</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.lbl}>Nom entreprise *</Text>
            {inp('Construction Tremblay Inc.', 'name')}
          </View>
        </View>
        <Text style={styles.lbl}>Téléphone *</Text>
        {inp('514-555-0001', 'phone', { keyboardType: 'phone-pad' })}
        <Text style={styles.lbl}>Adresse complète *</Text>
        {inp('123 rue Principale, Montréal, QC H1X 1X1', 'address', { multiline: true, numberOfLines: 2, style: [styles.inp, { height: 70 }] })}
        <Text style={styles.lbl}>Email *</Text>
        {inp('info@entreprise.com', 'email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
        <Text style={styles.lbl}>Site web</Text>
        {inp('www.entreprise.com', 'web', { autoCapitalize: 'none' })}

        {/* TAXES */}
        <Text style={styles.sectionTitle}>💰 Numéros de taxes</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.lbl}>TPS (fédéral)</Text>
            <TextInput style={styles.inp} placeholder="123456789 RT0001" placeholderTextColor={colors.muted} value={form.tps} onChangeText={v => update('tps', v)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.lbl}>TVQ (provincial)</Text>
            <TextInput style={styles.inp} placeholder="1234567890 TQ0001" placeholderTextColor={colors.muted} value={form.tvq} onChangeText={v => update('tvq', v)} />
          </View>
        </View>

        {/* CHAMPS SECTEUR */}
        {sector?.fields?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🪪 {sector.label}</Text>
            <View style={styles.sectorGrid}>
              {sector.fields.map(field => (
                <View key={field.id} style={styles.sectorField}>
                  <Text style={styles.lbl}>{field.label}</Text>
                  <TextInput
                    style={styles.inp}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.muted}
                    value={form.extra[field.id] || ''}
                    onChangeText={v => updateExtra(field.id, v)}
                    autoCapitalize="characters"
                  />
                </View>
              ))}
            </View>
          </>
        )}

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
  back: { marginBottom: 8 },
  backText: { fontFamily: 'Sora_400Regular', fontSize: 13, color: colors.accent },
  logo: { fontFamily: 'Sora_700Bold', fontSize: 22, color: colors.accent },
  steps: { flexDirection: 'row', gap: 6, marginTop: 12 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border2 },
  stepActive: { backgroundColor: colors.accent, width: 20 },
  scroll: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { fontFamily: 'Sora_600SemiBold', fontSize: 18, color: colors.text, marginBottom: 10 },
  notice: { backgroundColor: '#0d1a0d', borderLeftWidth: 3, borderLeftColor: colors.accent, borderRadius: 4, padding: 10, marginBottom: 16 },
  noticeText: { fontFamily: 'Sora_400Regular', fontSize: 12, color: '#aaa', lineHeight: 18 },
  sectionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  lbl: { fontFamily: 'Sora_400Regular', fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, marginTop: 8 },
  inp: { backgroundColor: '#161616', borderWidth: 1, borderColor: '#252525', borderRadius: radius.md, color: colors.text, fontFamily: 'Sora_400Regular', fontSize: 13, padding: 11, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10 },
  logoZone: { backgroundColor: '#0d0d0d', borderWidth: 2, borderColor: '#252525', borderStyle: 'dashed', borderRadius: radius.lg, padding: 24, alignItems: 'center', marginBottom: 8 },
  logoImg: { width: 160, height: 60 },
  logoPlaceholder: { alignItems: 'center' },
  logoIcon: { fontSize: 28, marginBottom: 6 },
  logoLabel: { fontFamily: 'Sora_500Medium', fontSize: 13, color: colors.textSub, marginBottom: 3 },
  logoSub: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted },
  removeLink: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.error, textAlign: 'center', marginBottom: 4 },
  sectorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectorField: { width: '47%' },
  footer: { padding: spacing.xl, paddingBottom: 34, borderTopWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: 15, alignItems: 'center' },
  btnText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#000' },
});
