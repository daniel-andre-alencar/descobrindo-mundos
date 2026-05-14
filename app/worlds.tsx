import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const WORLDS = [
  { id: 'association', name: 'Associação', desc: '8 fases', color: '#F0FAF6', border: '#74B49B', text: '#2D6A4F' },
  { id: 'emotions', name: 'Emoções', desc: '6 fases', color: '#FDF0F5', border: '#E8A0B4', text: '#8B3A52' },
  { id: 'sensory', name: 'Sensorial', desc: 'sem fim', color: '#F0F4FD', border: '#91B4E8', text: '#2D4A8A' },
  { id: 'puzzle', name: 'Quebra-cabeça', desc: '5 fases', color: '#F4F0FD', border: '#B4A8E8', text: '#4A3A8A' },
];

export default function WorldsScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Escolha um mundo</Text>

      {WORLDS.map((world) => (
        <TouchableOpacity
          key={world.id}
          style={[styles.card, { backgroundColor: world.color, borderColor: world.border }]}
          onPress={() => router.push(`/game/${world.id}` as any)}
        >
          <View>
            <Text style={[styles.worldName, { color: world.text }]}>{world.name}</Text>
            <Text style={[styles.worldDesc, { color: world.border }]}>{world.desc}</Text>
          </View>
          <Text style={{ fontSize: 24, color: world.border }}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btnBack} onPress={() => router.replace('/' as any)}>
        <Text style={styles.btnBackText}>Voltar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
    backgroundColor: '#FDFAF5', // bege pastel clarinho
    minHeight: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5C4A2A',
    marginBottom: 8,
    marginTop: 40,
  },
  card: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  worldName: { fontSize: 16, fontWeight: '600' },
  worldDesc: { fontSize: 13, marginTop: 2 },
  btnBack: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4C5A9',
  },
  btnBackText: { color: '#5C4A2A', fontWeight: '600' },
});