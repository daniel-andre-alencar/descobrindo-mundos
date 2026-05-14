import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* logo do app */}
      <View style={styles.logo}>
        <View style={styles.logoMeio}>
          <View style={styles.logoCenter} />
        </View>
      </View>

      <Text style={styles.title}>Descobrindo Mundos</Text>
      <Text style={styles.subtitle}>aprender com alegria</Text>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/worlds')}>
        <Text style={styles.btnPrimaryText}>Jogar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/parent')}>
        <Text style={styles.btnSecondaryText}>Área dos pais</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FAF6', // verde pastel bem clarinho
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 14,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#A8DFC8', // verde pastel médio
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoMeio: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCenter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A8DFC8',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D6A4F', // verde escuro suave
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#74B49B', // verde médio suave
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: '#74B49B', // verde pastel médio
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A8DFC8',
  },
  btnSecondaryText: {
    color: '#2D6A4F',
    fontSize: 16,
    fontWeight: '600',
  },
});