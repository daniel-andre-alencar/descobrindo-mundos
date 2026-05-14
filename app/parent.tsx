import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NIVEIS = [
  {
    id: 1,
    titulo: 'Nível 1 — Leve',
    desc: 'Mais elementos na tela, desafios maiores, feedback animado.',
    cor: '#E1F5EE',
    borda: '#1D9E75',
    texto: '#085041',
  },
  {
    id: 2,
    titulo: 'Nível 2 — Moderado',
    desc: 'Tela mais limpa, menos itens por vez, sem tempo limite.',
    cor: '#FAEEDA',
    borda: '#BA7517',
    texto: '#633806',
  },
  {
    id: 3,
    titulo: 'Nível 3 — Severo',
    desc: 'Uma tarefa por vez, estímulos reduzidos, transições lentas.',
    cor: '#FBEAF0',
    borda: '#D4537E',
    texto: '#72243E',
  },
];

export default function ParentScreen() {
  const router = useRouter();
  const [nivelSelecionado, setNivelSelecionado] = useState<number>(1);
  const [somLigado, setSomLigado] = useState(true);
  const [salvo, setSalvo] = useState(false);

  async function salvarConfiguracoes() {
    try {
      await AsyncStorage.setItem('nivel_tea', String(nivelSelecionado));
      await AsyncStorage.setItem('som', String(somLigado));
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    } catch (e) {
      console.log('Erro ao salvar:', e);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.titulo}>Área dos pais</Text>
      <Text style={styles.subtitulo}>Configure o jogo para a criança</Text>

      <Text style={styles.secaoLabel}>Nível de suporte (TEA)</Text>
      {NIVEIS.map((nivel) => (
        <TouchableOpacity
          key={nivel.id}
          style={[
            styles.nivelCard,
            { borderColor: nivel.borda, backgroundColor: nivel.cor },
            nivelSelecionado === nivel.id && { borderWidth: 3 },
          ]}
          onPress={() => setNivelSelecionado(nivel.id)}
        >
          <View style={styles.nivelHeader}>
            <Text style={[styles.nivelTitulo, { color: nivel.texto }]}>{nivel.titulo}</Text>
            <View style={[styles.circulo, { borderColor: nivel.borda, backgroundColor: nivelSelecionado === nivel.id ? nivel.borda : 'transparent' }]} />
          </View>
          <Text style={[styles.nivelDesc, { color: nivel.borda }]}>{nivel.desc}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.secaoLabel}>Configurações</Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Sons do jogo</Text>
        <TouchableOpacity
          style={[styles.toggle, { backgroundColor: somLigado ? '#1D9E75' : '#B4B2A9' }]}
          onPress={() => setSomLigado(!somLigado)}
        >
          <View style={[styles.toggleKnob, { marginLeft: somLigado ? 'auto' : 0 }]} />
        </TouchableOpacity>
      </View>

      {/* botão para ver o relatório */}
      <TouchableOpacity style={styles.btnRelatorio} onPress={() => router.push('/report')}>
        <Text style={styles.btnRelatorioTexto}>Ver relatório da criança</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnSalvar, salvo && { backgroundColor: '#085041' }]}
        onPress={salvarConfiguracoes}
      >
        <Text style={styles.btnSalvarTexto}>{salvo ? 'Salvo!' : 'Salvar configurações'}</Text>
      </TouchableOpacity>

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
  secaoLabel: { fontSize: 12, fontWeight: '600', color: '#185FA5', letterSpacing: 0.5, marginTop: 8 },
  nivelCard: { padding: 16, borderRadius: 14, borderWidth: 1.5, gap: 6 },
  nivelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nivelTitulo: { fontSize: 15, fontWeight: '600' },
  nivelDesc: { fontSize: 13, lineHeight: 18 },
  circulo: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#B5D4F4',
  },
  toggleLabel: { fontSize: 15, color: '#0C447C', fontWeight: '500' },
  toggle: { width: 44, height: 24, borderRadius: 12, padding: 3, flexDirection: 'row', alignItems: 'center' },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' },
  btnRelatorio: {
    backgroundColor: '#185FA5',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnRelatorioTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnSalvar: { backgroundColor: '#1D9E75', padding: 16, borderRadius: 14, alignItems: 'center' },
  btnSalvarTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnVoltar: { padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#378ADD' },
  btnVoltarTexto: { color: '#0C447C', fontWeight: '600' },
});