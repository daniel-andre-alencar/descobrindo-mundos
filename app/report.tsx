import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getProgresso, limparProgresso } from '../config';

// tipo de cada entrada do histórico — agora com erros
type Entrada = {
  jogo: string;
  acertos: number;
  erros: number;
  total: number;
  data: string;
  hora: string;
};

// cor por jogo
const CORES: Record<string, string> = {
  'Associação': '#1D9E75',
  'Emoções': '#D4537E',
  'Sílabas': '#7F77DD',
};

export default function ReportScreen() {
  const router = useRouter();
  const [historico, setHistorico] = useState<Entrada[]>([]);

  useEffect(() => {
    getProgresso().then(dados => {
      setHistorico(dados);
    });
  }, []);

  // totais gerais
  const totalAcertos = historico.reduce((acc, e) => acc + e.acertos, 0);
  const totalErros = historico.reduce((acc, e) => acc + (e.erros || 0), 0);
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

      {/* resumo geral — agora com 4 itens incluindo erros */}
      <View style={styles.resumoBox}>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>{historico.length}</Text>
          <Text style={styles.resumoLabel}>sessões</Text>
        </View>
        <View style={styles.resumoDivisor} />
        <View style={styles.resumoItem}>
          <Text style={[styles.resumoNumero, { color: '#1D9E75' }]}>{totalAcertos}</Text>
          <Text style={styles.resumoLabel}>acertos</Text>
        </View>
        <View style={styles.resumoDivisor} />
        <View style={styles.resumoItem}>
          {/* erros em vermelho para chamar atenção */}
          <Text style={[styles.resumoNumero, { color: '#D85A30' }]}>{totalErros}</Text>
          <Text style={styles.resumoLabel}>erros</Text>
        </View>
        <View style={styles.resumoDivisor} />
        <View style={styles.resumoItem}>
          <Text style={styles.resumoNumero}>{taxaGeral}%</Text>
          <Text style={styles.resumoLabel}>taxa</Text>
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

          {/* cabeçalho com nome do jogo e data */}
          <View style={styles.entradaHeader}>
            <Text style={[styles.entradaJogo, { color: CORES[entrada.jogo] || '#999' }]}>{entrada.jogo}</Text>
            <Text style={styles.entradaData}>{entrada.data} às {entrada.hora}</Text>
          </View>

          {/* acertos e erros lado a lado */}
          <View style={styles.acertosErrosRow}>
            <View style={styles.acertosBox}>
              <Text style={styles.acertosNumero}>{entrada.acertos}</Text>
              <Text style={styles.acertosLabel}>acertos</Text>
            </View>
            <View style={styles.errosBox}>
              {/* erros — mostra 0 se não tiver o campo (sessões antigas) */}
              <Text style={styles.errosNumero}>{entrada.erros || 0}</Text>
              <Text style={styles.errosLabel}>erros</Text>
            </View>
            <View style={styles.totalBox}>
              <Text style={styles.totalNumero}>{entrada.total}</Text>
              <Text style={styles.totalLabel}>total</Text>
            </View>
          </View>

          {/* barra de acerto verde */}
          <View style={styles.barraFundo}>
            <View style={[
              styles.barraPreenchida,
              {
                width: `${(entrada.acertos / entrada.total) * 100}%`,
                backgroundColor: CORES[entrada.jogo] || '#999',
              }
            ]} />
          </View>

          {/* barra de erro vermelha */}
          {(entrada.erros || 0) > 0 && (
            <View style={styles.barraFundo}>
              <View style={[
                styles.barraPreenchida,
                {
                  // calcula porcentagem de erros em relação ao total de tentativas
                  width: `${((entrada.erros || 0) / ((entrada.erros || 0) + entrada.total)) * 100}%`,
                  backgroundColor: '#D85A30',
                }
              ]} />
            </View>
          )}

        </View>
      ))}

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
  resumoNumero: { fontSize: 22, fontWeight: '700', color: '#0C447C' },
  resumoLabel: { fontSize: 11, color: '#185FA5' },
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
  // linha de acertos, erros e total
  acertosErrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  acertosBox: { alignItems: 'center', flex: 1, backgroundColor: '#E1F5EE', borderRadius: 8, padding: 8 },
  acertosNumero: { fontSize: 20, fontWeight: '700', color: '#1D9E75' },
  acertosLabel: { fontSize: 11, color: '#0F6E56' },
  errosBox: { alignItems: 'center', flex: 1, backgroundColor: '#FAECE7', borderRadius: 8, padding: 8 },
  errosNumero: { fontSize: 20, fontWeight: '700', color: '#D85A30' },
  errosLabel: { fontSize: 11, color: '#A33A18' },
  totalBox: { alignItems: 'center', flex: 1, backgroundColor: '#E6F1FB', borderRadius: 8, padding: 8 },
  totalNumero: { fontSize: 20, fontWeight: '700', color: '#0C447C' },
  totalLabel: { fontSize: 11, color: '#185FA5' },
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