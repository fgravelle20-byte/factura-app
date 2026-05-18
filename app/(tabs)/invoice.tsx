import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useStore } from '../../src/store';
import { colors, SECTORS, PLANS, spacing, radius } from '../../src/theme';

const fmt = (n: number) => n.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
const fmtDate = (d: string) => {
  if (!d) return '—';
  const [y, m, dd] = d.split('-');
  const ms = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];
  return `${dd} ${ms[parseInt(m)-1]} ${y}`;
};

interface LineItem { id: string; desc: string; qty: number; price: string; }

export default function InvoiceScreen() {
  const { profile, plan, sendCount, incrementSendCount, addInvoice, getNextNumber } = useStore();
  const quota = PLANS[plan].quota;
  const sector = SECTORS[profile.sector as keyof typeof SECTORS];

  const today = new Date().toISOString().slice(0, 10);
  const due30 = new Date(); due30.setDate(due30.getDate() + 30);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddr, setClientAddr] = useState('');
  const [invDate, setInvDate] = useState(today);
  const [invDue, setInvDue] = useState(due30.toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ id: '1', desc: '', qty: 1, price: '' }]);
  const [loading, setLoading] = useState(false);

  const addLine = () => setLines(l => [...l, { id: Date.now().toString(), desc: '', qty: 1, price: '' }]);
  const removeLine = (id: string) => setLines(l => l.filter(x => x.id !== id));
  const updateLine = (id: string, key: keyof LineItem, val: any) =>
    setLines(l => l.map(x => x.id === id ? { ...x, [key]: val } : x));

  const sub = lines.reduce((s, l) => s + (l.qty || 0) * (parseFloat(l.price) || 0), 0);
  const tax = sub * 0.14975;
  const total = sub + tax;

  const generatePDF = async () => {
    if (!clientName) { Alert.alert('Client requis', 'Ajoutez le nom du client.'); return; }
    setLoading(true);
    const extras = Object.entries(profile.extra || {}).filter(([,v]) => v)
      .map(([k,v]) => { const f = sector?.fields?.find(x => x.id === k); return f ? `${f.label}: ${v}` : ''; })
      .filter(Boolean).join(' · ');

    const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #fff; color: #111; }
      .header { background: #f97316; padding: 28px 32px; display: flex; justify-content: space-between; }
      .header-left h1 { color: white; font-size: 28px; margin: 0 0 4px; }
      .header-left p { color: rgba(255,255,255,.75); font-size: 11px; margin: 2px 0; }
      .header-right { text-align: right; }
      .header-right .num { font-family: monospace; font-size: 18px; color: white; font-weight: 700; }
      .header-right p { color: rgba(255,255,255,.75); font-size: 11px; margin: 2px 0; }
      .extras { background: #fff3e8; padding: 8px 32px; font-size: 10px; color: #888; border-bottom: 1px solid #ffe5cc; }
      .body { padding: 24px 32px; }
      .bill-to { background: #fafafa; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
      .bill-to .label { font-size: 9px; text-transform: uppercase; letter-spacing: .1em; color: #bbb; margin-bottom: 4px; }
      .bill-to .name { font-size: 14px; font-weight: 700; color: #111; }
      .bill-to p { font-size: 11px; color: #666; margin: 2px 0; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      thead tr { background: #f5f5f5; }
      th { font-size: 9px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: .06em; padding: 8px 10px; text-align: left; }
      th:not(:first-child) { text-align: right; }
      td { font-size: 12px; padding: 9px 10px; border-bottom: 1px solid #f0f0f0; color: #222; }
      td:not(:first-child) { text-align: right; color: #666; }
      td:last-child { font-weight: 600; color: #111; }
      .totals { display: flex; justify-content: flex-end; margin-bottom: 16px; }
      .totals-box { width: 220px; }
      .totals-row { display: flex; justify-content: space-between; font-size: 11px; color: #999; margin-bottom: 4px; }
      .total-final { display: flex; justify-content: space-between; background: #f97316; border-radius: 6px; padding: 10px 12px; margin-top: 6px; }
      .total-final span:first-child { font-size: 12px; font-weight: 700; color: white; }
      .total-final span:last-child { font-size: 16px; font-weight: 800; color: white; }
      .notes { background: #fafafa; border-left: 3px solid #f97316; padding: 8px 12px; font-size: 11px; color: #888; line-height: 1.7; margin-bottom: 12px; }
      .footer { border-top: 1px solid #eee; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #ccc; }
    </style></head>
    <body>
    <div class="header" style="display:flex;justify-content:space-between;">
      <div class="header-left">
        <h1>FACTURE</h1>
        <p>${profile.name || 'Votre entreprise'}</p>
        ${profile.phone ? `<p>${profile.phone}</p>` : ''}
        ${profile.email ? `<p>${profile.email}</p>` : ''}
        ${profile.address ? `<p>${profile.address}</p>` : ''}
      </div>
      <div class="header-right">
        <div class="num">${getNextNumber()}</div>
        <p>Date: ${fmtDate(invDate)}</p>
        ${invDue ? `<p>Échéance: ${fmtDate(invDue)}</p>` : ''}
      </div>
    </div>
    ${extras ? `<div class="extras">${extras}</div>` : ''}
    <div class="body">
      <div class="bill-to">
        <div class="label">Facturé à</div>
        <div class="name">${clientName}</div>
        ${clientPhone ? `<p>${clientPhone}</p>` : ''}
        ${clientEmail ? `<p>${clientEmail}</p>` : ''}
        ${clientAddr ? `<p>${clientAddr}</p>` : ''}
      </div>
      <table>
        <thead><tr><th>Description</th><th>Qté</th><th>Unitaire</th><th>Total</th></tr></thead>
        <tbody>
          ${lines.map(l => `<tr><td>${l.desc || '—'}</td><td>${l.qty}</td><td>${fmt(parseFloat(l.price)||0)}</td><td>${fmt(l.qty*(parseFloat(l.price)||0))}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="totals-box">
          <div class="totals-row"><span>Sous-total</span><span>${fmt(sub)}</span></div>
          <div class="totals-row"><span>TPS + TVQ (14.975%)</span><span>${fmt(tax)}</span></div>
          <div class="total-final"><span>TOTAL DÛ</span><span>${fmt(total)}</span></div>
        </div>
      </div>
      ${notes ? `<div class="notes">${notes}</div>` : ''}
      ${profile.tps || profile.tvq ? `<p style="font-size:10px;color:#ccc;">${profile.tps ? 'TPS: '+profile.tps : ''}${profile.tvq ? ' · TVQ: '+profile.tvq : ''}</p>` : ''}
      <div class="footer"><span>Généré avec Factura</span><span>Confidentialité · Conditions</span></div>
    </div>
    </body></html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Partager la facture' });
      addInvoice({
        id: Date.now().toString(),
        number: getNextNumber(),
        date: invDate, due: invDue,
        clientName, clientEmail, clientPhone, clientAddress: clientAddr,
        items: lines.map(l => ({ id: l.id, desc: l.desc, qty: l.qty, price: parseFloat(l.price)||0 })),
        notes, subtotal: sub, tax, total, status: 'sent',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de générer le PDF.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appName}>Factura</Text>
          <Text style={styles.quotaText}>{quota - sendCount} envois restants ce mois</Text>
        </View>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>{PLANS[plan].label}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Company preview */}
        <View style={styles.companyBox}>
          <View style={styles.companyRow}>
            <Text style={styles.sectionLabel}>🏢 Votre entreprise</Text>
            <View style={styles.autoTag}><Text style={styles.autoTagText}>● Auto-rempli</Text></View>
          </View>
          <Text style={styles.companyName}>{profile.name || 'Configurez votre profil'}</Text>
          <Text style={styles.companySub}>{[profile.phone, profile.email].filter(Boolean).join(' · ')}</Text>
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>👤 Client</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lbl}>Nom *</Text>
              <TextInput style={styles.inp} placeholder="Client ABC" placeholderTextColor={colors.muted} value={clientName} onChangeText={setClientName} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lbl}>Téléphone</Text>
              <TextInput style={styles.inp} placeholder="438-555-0001" placeholderTextColor={colors.muted} value={clientPhone} onChangeText={setClientPhone} keyboardType="phone-pad" />
            </View>
          </View>
          <Text style={styles.lbl}>Email <Text style={styles.autoSendBadge}> AUTO-ENVOI </Text></Text>
          <TextInput style={[styles.inp, { borderColor: '#f9731640' }]} placeholder="client@exemple.com" placeholderTextColor={colors.muted} value={clientEmail} onChangeText={setClientEmail} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.lbl}>Adresse</Text>
          <TextInput style={[styles.inp, { height: 64 }]} placeholder="456 rue des Affaires, QC" placeholderTextColor={colors.muted} value={clientAddr} onChangeText={setClientAddr} multiline />
        </View>

        {/* Lignes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📦 Lignes de facturation</Text>
          <View style={styles.lineHeader}>
            <Text style={[styles.lbl, { flex: 1 }]}>Description</Text>
            <Text style={[styles.lbl, { width: 40, textAlign: 'center' }]}>Qté</Text>
            <Text style={[styles.lbl, { width: 80, textAlign: 'right' }]}>Prix $</Text>
            <View style={{ width: 28 }} />
          </View>
          {lines.map((line, i) => (
            <View key={line.id} style={styles.lineRow}>
              <TextInput style={[styles.inp, { flex: 1 }]} placeholder="Description du service" placeholderTextColor={colors.muted} value={line.desc} onChangeText={v => updateLine(line.id, 'desc', v)} />
              <TextInput style={[styles.inp, { width: 40, textAlign: 'center', padding: 8 }]} value={String(line.qty)} onChangeText={v => updateLine(line.id, 'qty', parseInt(v)||1)} keyboardType="numeric" />
              <TextInput style={[styles.inp, { width: 80, textAlign: 'right' }]} placeholder="0.00" placeholderTextColor={colors.muted} value={line.price} onChangeText={v => updateLine(line.id, 'price', v)} keyboardType="decimal-pad" />
              {lines.length > 1 && (
                <TouchableOpacity onPress={() => removeLine(line.id)} style={styles.rmBtn}>
                  <Text style={styles.rmText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addLineBtn} onPress={addLine}>
            <Text style={styles.addLineText}>+ Ajouter une ligne</Text>
          </TouchableOpacity>
        </View>

        {/* Totaux */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Sous-total</Text><Text style={styles.totalVal}>{fmt(sub)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>TPS + TVQ (14.975%)</Text><Text style={styles.totalVal}>{fmt(tax)}</Text></View>
          <View style={styles.totalFinal}><Text style={styles.totalFinalLabel}>TOTAL DÛ</Text><Text style={styles.totalFinalVal}>{fmt(total)}</Text></View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.lbl}>Notes</Text>
          <TextInput style={[styles.inp, { height: 70 }]} placeholder="Merci! Paiement dû dans 30 jours." placeholderTextColor={colors.muted} value={notes} onChangeText={setNotes} multiline />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.sendBtn} onPress={generatePDF} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.sendBtnText}>📤 Générer & Partager PDF</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  appName: { fontFamily: 'Sora_700Bold', fontSize: 22, color: colors.accent },
  quotaText: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted, marginTop: 2 },
  planBadge: { backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  planText: { fontFamily: 'Sora_700Bold', fontSize: 11, color: '#000' },
  scroll: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  companyBox: { backgroundColor: '#0d1a0d', borderWidth: 1, borderColor: '#1a3a1a', borderRadius: radius.lg, padding: spacing.md, marginBottom: 14 },
  companyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  autoTag: { flexDirection: 'row', alignItems: 'center' },
  autoTagText: { fontFamily: 'Sora_500Medium', fontSize: 10, color: colors.success },
  companyName: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: colors.text },
  companySub: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted, marginTop: 2 },
  section: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: 12 },
  sectionLabel: { fontFamily: 'Sora_600SemiBold', fontSize: 10, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  lbl: { fontFamily: 'Sora_400Regular', fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, marginTop: 8 },
  inp: { backgroundColor: '#161616', borderWidth: 1, borderColor: '#252525', borderRadius: radius.md, color: colors.text, fontFamily: 'Sora_400Regular', fontSize: 13, padding: 10, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10 },
  autoSendBadge: { backgroundColor: colors.accent, color: '#000', fontSize: 9, fontFamily: 'Sora_700Bold' },
  lineHeader: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 4 },
  lineRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 6 },
  rmBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  rmText: { color: colors.error, fontSize: 14 },
  addLineBtn: { borderWidth: 1, borderColor: '#252525', borderStyle: 'dashed', borderRadius: radius.md, padding: 10, alignItems: 'center', marginTop: 4 },
  addLineText: { fontFamily: 'Sora_400Regular', fontSize: 12, color: colors.muted },
  totalsBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLabel: { fontFamily: 'Sora_400Regular', fontSize: 12, color: colors.muted },
  totalVal: { fontFamily: 'Sora_400Regular', fontSize: 12, color: colors.muted },
  totalFinal: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.accent, borderRadius: radius.md, padding: 12, marginTop: 6 },
  totalFinalLabel: { fontFamily: 'Sora_700Bold', fontSize: 13, color: '#000' },
  totalFinalVal: { fontFamily: 'Sora_700Bold', fontSize: 18, color: '#000' },
  actions: { padding: spacing.xl, paddingBottom: 34, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  sendBtn: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: 16, alignItems: 'center' },
  sendBtnText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#000' },
});
