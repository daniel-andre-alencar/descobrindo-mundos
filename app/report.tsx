import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getProgresso, limparProgresso } from '../config';

// tipo de cada entrada do histórico
type Entrada = {
  jogo: string;
  acertos: number;
  total: number;
  data: string;
  hora: string;
};

// cor por jogo
const CORES: Record<string, string> = {
  'Associação': '#1D9E75',
  'Emoções': '#D4537E',
  'Quebra-cabeça': '#7F77DD',
};

export default function ReportScreen() {
  const router = useRouter();
  const [historico, setHistorico] = useState<Entrada[]>([]);

  // carrega o histórico quando a tela abre
  useEffect(() => {
  getProgresso().then(dados => {
    console.log('Progresso encontrado:', JSON.stringify(dados));
    setHistorico(dados);
  });
}, []);

  // calcula a taxa de acerto geral
  const totalAcertos = historico.reduce((acc, e) => acc + e.acertos, 0);
  const totalQuestoes = historico.reduce((acc, e) => acc + e.total, 0);
  const taxaGeral = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;

  async function limpar() {
    await limparProgresso();
    setHistorico([]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.titulo}>Relatório da criança</Text>
      <Text style={styles.subtitulo}>{historico.length} sessões registradas</Text>

      {/* resumo geral */}
      <View style={styles.resumoBox}>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>{historico.length}</Text>
          <Text style={styles.resumoLabel}>sessões</Text>
        </View>
        <View style={styles.resumoDivisor} />
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>{totalAcertos}</Text>
          <Text style={styles.resumoLabel}>acertos</Text>
        </View>
        <View style={styles.resumoDivisor} />
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>{taxaGeral}%</Text>
          <Text style={styles.resumoLabel}>taxa geral</Text>
        </View>
      </View>

      {/* histórico vazio */}
      {historico.length === 0 && (
        <View style={styles.vazioBox}>
          <Text style={styles.vazioTexto}>Nenhuma sessão ainda.</Text>
          <Text style={styles.vazioSub}>O progresso aparece aqui depois que a criança jogar.</Text>
        </View>
      )}

      {/* lista de sessões — mais recente primeiro */}
      {[...historico].reverse().map((entrada, index) => (
        <View key={index} style={[styles.entradaCard, { borderLeftColor: CORES[entrada.jogo] || '#999' }]}>
          <View style={styles.entradaHeader}>
            <Text style={[styles.entradaJogo, { color: CORES[entrada.jogo] || '#999' }]}>{entrada.jogo}</Text>
            <Text style={styles.entradaData}>{entrada.data} às {entrada.hora}</Text>
          </View>
          <Text style={styles.entradaAcertos}>{entrada.acertos} de {entrada.total} acertos</Text>
          {/* barra de acerto da sessão */}
          <View style={styles.barraFundo}>
            <View style={[
              styles.barraPreenchida,
              {
                width: `${(entrada.acertos / entrada.total) * 100}%`,
                backgroundColor: CORES[entrada.jogo] || '#999',
              }
            ]} />
          </View>
        </View>
      ))}

      {/* botão limpar histórico */}
      {historico.length > 0 && (
        <TouchableOpacity style={styles.btnLimpar} onPress={limpar}>
          <Text style={styles.btnLimparTexto}>Limpar histórico</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
        <Text style={styles.btnVoltarTexto}>Voltar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
    backgroundColor: '#E6F1FB',
    minHeight: '100%',
    paddingTop: 60,
  },
  titulo: { fontSize: 22, fontWeight: '700', color: '#0C447C' },
  subtitulo: { fontSize: 14, color: '#185FA5', marginBottom: 8 },
  resumoBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#B5D4F4',
  },
  resumoItem: { alignItems: 'center', gap: 4 },
  resumoNumero: { fontSize: 24, fontWeight: '700', color: '#0C447C' },
  resumoLabel: { fontSize: 12, color: '#185FA5' },
  resumoDivisor: { width: 1, height: 40, backgroundColor: '#B5D4F4' },
  vazioBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 0.5,
    borderColor: '#B5D4F4',
  },
  vazioTexto: { fontSize: 16, fontWeight: '600', color: '#0C447C' },
  vazioSub: { fontSize: 13, color: '#185FA5', textAlign: 'center' },
  entradaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderWidth: 0.5,
    borderColor: '#B5D4F4',
  },
  entradaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entradaJogo: { fontSize: 14, fontWeight: '600' },
  entradaData: { fontSize: 11, color: '#185FA5' },
  entradaAcertos: { fontSize: 13, color: '#0C447C' },
  barraFundo: { width: '100%', height: 6, backgroundColor: '#E6F1FB', borderRadius: 3 },
  barraPreenchida: { height: 6, borderRadius: 3 },
  btnLimpar: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D85A30',
    alignItems: 'center',
    marginTop: 8,
  },
  btnLimparTexto: { color: '#D85A30', fontWeight: '600' },
  btnVoltar: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#378ADD',
    alignItems: 'center',
  },
  btnVoltarTexto: { color: '#0C447C', fontWeight: '600' },
});