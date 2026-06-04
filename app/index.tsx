import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getTema, TEMAS } from '../config';

export default function HomeScreen() {
  const router = useRouter();
  const [tema, setTema] = useState(TEMAS.verde);

  // carrega o tema salvo quando a tela abre
  useEffect(() => {
    getTema().then(chave => setTema(TEMAS[chave]));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>

      <View style={[styles.logo, { backgroundColor: tema.primaria }]}>
        <View style={[styles.logoMeio, { backgroundColor: tema.fundo }]}>
          <View style={[styles.logoCenter, { backgroundColor: tema.primaria }]} />
        </View>
      </View>

      <Text style={[styles.title, { color: tema.texto }]}>Descobrindo Mundos</Text>
      <Text style={[styles.subtitle, { color: tema.primaria }]}>aprender com alegria</Text>

      <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: tema.primaria }]} onPress={() => router.push('/worlds')}>
        <Text style={styles.btnPrimaryText}>Jogar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btnSecondary, { borderColor: tema.borda }]} onPress={() => router.push('/parent')}>
        <Text style={[styles.btnSecondaryText, { color: tema.texto }]}>Área dos pais</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 14,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoMeio: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCenter: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  btnPrimary: {
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
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});