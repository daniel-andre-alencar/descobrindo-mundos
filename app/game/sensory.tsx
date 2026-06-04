import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getTema, TEMAS } from '../../config';

const CORES = ['#1D9E75', '#D4537E', '#378ADD', '#EF9F27', '#7F77DD', '#D85A30', '#639922', '#085041'];

function gerarBolhas() {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i, cor: CORES[i % CORES.length], tamanho: 60 + Math.random() * 50, estourada: false,
  }));
}

export default function SensoryGame() {
  const router = useRouter();
  const [bolhas, setBolhas] = useState(gerarBolhas);
  const [tema, setTema] = useState(TEMAS.verde);
  const estouradas = bolhas.filter(b => b.estourada).length;

  useEffect(() => {
    getTema().then(chave => setTema(TEMAS[chave]));
  }, []);

  function estourar(id: number) {
    setBolhas(prev => prev.map(b => b.id === id ? { ...b, estourada: true } : b));
  }

  function reiniciar() { setBolhas(gerarBolhas()); }

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      <Text style={[styles.titulo, { color: tema.texto }]}>Estoure as bolhas!</Text>
      <Text style={[styles.contador, { color: tema.primaria }]}>{estouradas} de {bolhas.length} estouradas</Text>
      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${(estouradas / bolhas.length) * 100}%`, backgroundColor: tema.primaria }]} />
      </View>
      <View style={styles.grade}>
        {bolhas.map((bolha) => (
          <TouchableOpacity
            key={bolha.id}
            onPress={() => estourar(bolha.id)}
            disabled={bolha.estourada}
            style={[styles.bolha, { width: bolha.tamanho, height: bolha.tamanho, borderRadius: bolha.tamanho / 2, backgroundColor: bolha.estourada ? 'transparent' : bolha.cor, borderColor: bolha.estourada ? 'transparent' : bolha.cor }]}
          >
            {bolha.estourada && <Text style={[styles.pop, { color: tema.primaria }]}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
      {estouradas === bolhas.length && (
        <View style={styles.finalBox}>
          <Text style={[styles.finalTexto, { color: tema.texto }]}>Você estourou todas!</Text>
          <TouchableOpacity style={[styles.btnReiniciar, { backgroundColor: tema.primaria }]} onPress={reiniciar}>
            <Text style={styles.btnReiniciarTexto}>Jogar de novo</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={[styles.btnVoltar, { borderColor: tema.primaria }]} onPress={() => router.back()}>
        <Text style={[styles.btnVoltarText, { color: tema.texto }]}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', gap: 12, paddingTop: 60, paddingBottom: 80 },
  titulo: { fontSize: 22, fontWeight: '700' },
  contador: { fontSize: 13 },
  barraFundo: { width: '100%', height: 6, backgroundColor: '#ddd', borderRadius: 3 },
  barraPreenchida: { height: 6, borderRadius: 3 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 16 },
  bolha: { borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  pop: { fontSize: 20 },
  finalBox: { alignItems: 'center', gap: 12 },
  finalTexto: { fontSize: 18, fontWeight: '700' },
  btnReiniciar: { padding: 14, borderRadius: 12, width: 200, alignItems: 'center' },
  btnReiniciarTexto: { color: '#fff', fontWeight: '600' },
  btnVoltar: { padding: 14, borderRadius: 12, borderWidth: 1, width: '100%', alignItems: 'center', marginTop: 8 },
  btnVoltarText: { fontWeight: '600' },
});