import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../../src/store';
import { colors, spacing, radius } from '../../src/theme';

const fmt = (n: number) => n.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });

const STATUS_COLORS = { draft: '#888', sent: '#f97316', paid: '#4ade80' };
const STATUS_LABELS = { draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée' };

export default function HistoryScreen() {
  const { invoices, updateInvoice } = useStore();

  if (!invoices.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📄</Text>
        <Text style={styles.emptyTitle}>Aucune facture encore</Text>
        <Text style={styles.emptySub}>Créez votre première facture dans l'onglet Nouvelle.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.count}>{invoices.length} facture{invoices.length > 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={invoices}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.xl }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.num}>{item.number}</Text>
                <Text style={styles.client}>{item.clientName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.total}>{fmt(item.total)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.date}>{item.date} · Dû {item.due}</Text>
            {item.status === 'sent' && (
              <TouchableOpacity
                style={styles.markPaidBtn}
                onPress={() => updateInvoice(item.id, { status: 'paid' })}
              >
                <Text style={styles.markPaidText}>✓ Marquer comme payée</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontFamily: 'Sora_700Bold', fontSize: 22, color: colors.text },
  count: { fontFamily: 'Sora_400Regular', fontSize: 12, color: colors.muted },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: 10 },
  cardTop: { flexDirection: 'row', marginBottom: 6 },
  num: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: colors.accent, marginBottom: 2 },
  client: { fontFamily: 'Sora_400Regular', fontSize: 13, color: colors.text },
  total: { fontFamily: 'Sora_700Bold', fontSize: 16, color: colors.text, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  statusText: { fontFamily: 'Sora_600SemiBold', fontSize: 10 },
  date: { fontFamily: 'Sora_400Regular', fontSize: 11, color: colors.muted },
  markPaidBtn: { marginTop: 10, borderTopWidth: 1, borderColor: colors.border, paddingTop: 10 },
  markPaidText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: colors.success, textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: colors.text, marginBottom: 6 },
  emptySub: { fontFamily: 'Sora_400Regular', fontSize: 13, color: colors.muted, textAlign: 'center', paddingHorizontal: 40 },
});
