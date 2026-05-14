import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RewardScreen() {
  const router = useRouter();
  const { jogo } = useLocalSearchParams<{ jogo: string }>();

  return (
    <View style={styles.container}>

      <View style={styles.estrelas}>
        <View style={[styles.estrela, styles.estrelaPequena]} />
        <View style={[styles.estrela, styles.estrelaGrande]} />
        <View style={[styles.estrela, styles.estrelaPequena]} />
      </View>

      <Text style={styles.titulo}>Parabéns!</Text>
      <Text style={styles.subtitulo}>Você completou todas as fases!</Text>

      {/* joga de novo o mesmo jogo */}
      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={() => router.replace(`/game/${jogo}` as any)}
      >
        <Text style={styles.btnPrimaryText}>Jogar de novo</Text>
      </TouchableOpacity>

      {/* vai para a tela de mundos — de lá o botão voltar vai para home */}
      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={() => router.replace('/worlds' as any)}
      >
        <Text style={styles.btnSecondaryText}>Escolher outro mundo</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  estrelas: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 16 },
  estrela: { backgroundColor: '#EF9F27', borderRadius: 50 },
  estrelaGrande: { width: 64, height: 64 },
  estrelaPequena: { width: 44, height: 44 },
  titulo: { fontSize: 32, fontWeight: '700', color: '#27500A' },
  subtitulo: { fontSize: 15, color: '#3B6D11', marginBottom: 16, textAlign: 'center' },
  btnPrimary: { backgroundColor: '#3B6D11', width: '100%', padding: 16, borderRadius: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnSecondary: { backgroundColor: '#fff', width: '100%', padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#3B6D11' },
  btnSecondaryText: { color: '#27500A', fontSize: 16, fontWeight: '600' },
});