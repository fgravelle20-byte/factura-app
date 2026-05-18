import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#111',
        borderTopColor: '#1f1f1f',
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingTop: 8,
        height: 70,
      },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: '#555',
      tabBarLabelStyle: { fontFamily: 'Sora_500Medium', fontSize: 11, marginTop: 2 },
    }}>
      <Tabs.Screen name="invoice" options={{ title: 'Nouvelle', tabBarIcon: ({ color }) => <TabIcon icon="➕" color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Historique', tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Profil', tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <>{require('react').createElement(require('react-native').Text, { style: { fontSize: 20, opacity: color === colors.accent ? 1 : 0.5 } }, icon)}</>
  );
}
