import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { signIn, signUp } from '../../src/lib/supabase';
import { colors, spacing, radius } from '../../src/theme';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !password) { Alert.alert('Requis', 'Email et mot de passe obligatoires.'); return; }
    if (password.length < 6) { Alert.alert('Mot de passe', 'Minimum 6 caractères.'); return; }
    setLoading(true);
    const fn = mode === 'signup' ? signUp : signIn;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) { Alert.alert('Erreur', error.message); return; }
    if (mode === 'signup') {
      router.replace('/onboarding/sector');
    } else {
      router.replace('/(tabs)/invoice');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>Factura</Text>
        <Text style={styles.tagline}>Facturation professionnelle pour entrepreneurs</Text>

        <View style={styles.tabs}>
          {(['signup', 'login'] as const).map(m => (
            <TouchableOpacity key={m} style={[styles.tab, mode === m && styles.tabActive]} onPress={() => setMode(m)}>
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === 'signup' ? 'Créer un compte' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <Text style={styles.lbl}>Email</Text>
          <TextInput style={styles.inp} placeholder="info@entreprise.com" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.lbl}>Mot de passe</Text>
          <TextInput style={styles.inp} placeholder="Minimum 6 caractères" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={styles.btn} onPress={handle} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>{mode === 'signup' ? 'Créer mon compte →' : 'Se connecter →'}</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  logo: { fontFamily: 'Sora_700Bold', fontSize: 36, color: colors.accent, textAlign: 'center', marginBottom: 8 },
  tagline: { fontFamily: 'Sora_400Regular', fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: 36 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, padding: 11, borderRadius: radius.md, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { fontFamily: 'Sora_500Medium', fontSize: 13, color: colors.muted },
  tabTextActive: { color: '#000', fontFamily: 'Sora_700Bold' },
  form: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg },
  lbl: { fontFamily: 'Sora_400Regular', fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, marginTop: 10 },
  inp: { backgroundColor: '#161616', borderWidth: 1, borderColor: '#252525', borderRadius: radius.md, color: colors.text, fontFamily: 'Sora_400Regular', fontSize: 14, padding: 12, marginBottom: 4 },
  btn: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: 15, alignItems: 'center', marginTop: 16 },
  btnText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#000' },
  legal: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 20, lineHeight: 16 },
});
