import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ===== DADOS DAS BOLHAS =====
// cada bolha tem uma cor diferente
const CORES = [
  '#1D9E75', '#D4537E', '#378ADD', '#EF9F27',
  '#7F77DD', '#D85A30', '#639922', '#085041',
];

// gera uma lista de 12 bolhas com cores e tamanhos aleatórios
function gerarBolhas() {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    cor: CORES[i % CORES.length],         // cor da bolha
    tamanho: 60 + Math.random() * 50,     // tamanho entre 60 e 110
    estourada: false,                     // começa inteira
  }));
}

export default function SensoryGame() {
  const router = useRouter();

  // lista de bolhas — começa com 12 bolhas inteiras
  const [bolhas, setBolhas] = useState(gerarBolhas);

  // conta quantas bolhas foram estouradas
  const estouradas = bolhas.filter(b => b.estourada).length;

  // ===== FUNÇÃO DE ESTOURAR =====
  // marca a bolha como estourada quando a criança toca nela
  function estourar(id: number) {
    setBolhas(prev =>
      prev.map(b => b.id === id ? { ...b, estourada: true } : b)
    );
  }

  // reinicia o jogo com bolhas novas
  function reiniciar() {
    setBolhas(gerarBolhas());
  }

  return (
    <View style={styles.container}>

      {/* cabeçalho com contador de bolhas */}
      <Text style={styles.titulo}>Estoure as bolhas!</Text>
      <Text style={styles.contador}>{estouradas} de {bolhas.length} estouradas</Text>

      {/* barra de progresso */}
      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${(estouradas / bolhas.length) * 100}%` }]} />
      </View>

      {/* grade de bolhas */}
      <View style={styles.grade}>
        {bolhas.map((bolha) => (
          <TouchableOpacity
            key={bolha.id}
            onPress={() => estourar(bolha.id)}
            disabled={bolha.estourada} // desativa após estourar
            style={[
              styles.bolha,
              {
                width: bolha.tamanho,
                height: bolha.tamanho,
                borderRadius: bolha.tamanho / 2, // sempre círculo perfeito
                backgroundColor: bolha.estourada ? 'transparent' : bolha.cor,
                borderColor: bolha.estourada ? 'transparent' : bolha.cor,
              }
            ]}
          >
            {/* mostra X quando estourada, vazio quando inteira */}
            {bolha.estourada && (
              <Text style={styles.pop}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* mensagem quando todas estão estouradas */}
      {estouradas === bolhas.length && (
        <View style={styles.finalBox}>
          <Text style={styles.finalTexto}>Você estourou todas!</Text>
          <TouchableOpacity style={styles.btnReiniciar} onPress={reiniciar}>
            <Text style={styles.btnReiniciarTexto}>Jogar de novo</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
        <Text style={styles.btnVoltarText}>Voltar</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F1FB',
    padding: 24,
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    paddingBottom: 80, // espaço extra para não ficar atrás da barra do Android
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0C447C',
  },
  contador: {
    fontSize: 13,
    color: '#185FA5',
  },
  barraFundo: {
    width: '100%',
    height: 6,
    backgroundColor: '#B5D4F4',
    borderRadius: 3,
  },
  barraPreenchida: {
    height: 6,
    backgroundColor: '#378ADD',
    borderRadius: 3,
  },
  grade: {
    flexDirection: 'row',       // coloca as bolhas lado a lado
    flexWrap: 'wrap',           // quebra linha quando necessário
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  bolha: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pop: {
    fontSize: 20,
    color: '#378ADD',
  },
  finalBox: {
    alignItems: 'center',
    gap: 12,
  },
  finalTexto: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C447C',
  },
  btnReiniciar: {
    backgroundColor: '#378ADD',
    padding: 14,
    borderRadius: 12,
    width: 200,
    alignItems: 'center',
  },
  btnReiniciarTexto: {
    color: '#fff',
    fontWeight: '600',
  },
  btnVoltar: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#378ADD',
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  btnVoltarText: {
    color: '#0C447C',
    fontWeight: '600',
  },
});