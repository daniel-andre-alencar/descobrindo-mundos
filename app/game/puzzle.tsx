import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CONFIG_NIVEL, getNivel, salvarProgresso } from '../../config';

// ===== FASES DO JOGO =====
const FASES = [
  { nome: 'Cachorro', emoji: '🐶', pecas: ['🐾', '🦴', '🐶', '🏠'], correta: 2 },
  { nome: 'Fruta', emoji: '🍎', pecas: ['🍇', '🍎', '🍌', '🍊'], correta: 1 },
  { nome: 'Transporte', emoji: '🚗', pecas: ['✈️', '🚢', '🚂', '🚗'], correta: 3 },
  { nome: 'Clima', emoji: '☀️', pecas: ['🌧️', '❄️', '☀️', '🌪️'], correta: 2 },
  { nome: 'Esporte', emoji: '⚽', pecas: ['🏀', '⚽', '🎾', '🏈'], correta: 1 },
];

function embaralhar<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

function filtrarPecas(pecas: string[], indexCorreta: number, qtd: number) {
  const correta = pecas[indexCorreta];
  const erradas = pecas.filter((_, i) => i !== indexCorreta);
  const selecionadas = erradas.slice(0, qtd - 1);
  return embaralhar([...selecionadas, correta]);
}

export default function PuzzleGame() {
  const router = useRouter();
  const [config, setConfig] = useState(CONFIG_NIVEL[1]);
  const [fases, setFases] = useState(FASES);
  const [atual, setAtual] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [acertou, setAcertou] = useState<boolean | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    async function carregarNivel() {
      const nivel = await getNivel();
      const cfg = CONFIG_NIVEL[nivel];
      setConfig(cfg);
      setFases(cfg.embaralhar ? embaralhar(FASES) : FASES);
    }
    carregarNivel();
  }, []);

  // toca qualquer arquivo de áudio
  async function tocarSom(arquivo: any) {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: novoSom } = await Audio.Sound.createAsync(arquivo);
      setSound(novoSom);
      await novoSom.playAsync();
    } catch (e) {
      console.log('Erro ao tocar som:', e);
    }
  }

  // libera memória quando sai da tela
  useEffect(() => {
    return () => { if (sound) sound.unloadAsync(); };
  }, [sound]);

  // toca o áudio automaticamente quando muda de fase
  useEffect(() => {
    tocarSom(require('../../assets/sounds/ttsMP3.Qual peça completa.mp3'));
  }, [atual]);

  const fase = fases[atual];
  const pecasFiltradas = filtrarPecas(fase.pecas, fase.correta, config.qtdOpcoes);
  const pecaCorreta = fase.pecas[fase.correta];

  async function responder(index: number) {
    setSelecionada(index);
    const pecaEscolhida = pecasFiltradas[index];

    if (pecaEscolhida === pecaCorreta) {
      const novosAcertos = acertos + 1;
      setAcertos(novosAcertos);
      setAcertou(true);
      await tocarSom(require('../../assets/sounds/ttsMP3.Muito bem.mp3'));

      setTimeout(async () => {
        if (atual + 1 < fases.length) {
          setAtual(atual + 1);
          setSelecionada(null);
          setAcertou(null);
        } else {
          await salvarProgresso('Quebra-cabeça', novosAcertos, fases.length);
          router.replace('/reward?jogo=puzzle' as any);
        }
      }, config.tempoFeedback);

    } else {
      setAcertou(false);
      await tocarSom(require('../../assets/sounds/ttsMP3.Tente de novo.mp3'));
      setTimeout(() => {
        setSelecionada(null);
        setAcertou(null);
      }, config.tempoFeedback);
    }
  }

  function corDoBotao(index: number) {
    if (selecionada === null) return '#fff';
    if (selecionada === index && acertou) return '#EEEDFE';
    if (selecionada === index && !acertou) return '#FAECE7';
    return '#fff';
  }

  function bordaDoBotao(index: number) {
    if (selecionada === null) return '#ddd';
    if (selecionada === index && acertou) return '#7F77DD';
    if (selecionada === index && !acertou) return '#D85A30';
    return '#ddd';
  }

  return (
    <View style={styles.container}>

      <Text style={styles.progresso}>{atual + 1} de {fases.length}</Text>
      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${((atual + 1) / fases.length) * 100}%` }]} />
      </View>

      <View style={styles.perguntaBox}>
        <Text style={styles.perguntaLabel}>Qual peça completa?</Text>
        <Text style={styles.perguntaEmoji}>{fase.emoji}</Text>
      </View>

      {/* botão para repetir o áudio */}
      <TouchableOpacity style={styles.btnAudio} onPress={() => tocarSom(require('../../assets/sounds/ttsMP3.Qual peça completa.mp3'))}>
        <Text style={styles.btnAudioTexto}>🔊 Ouvir pergunta</Text>
      </TouchableOpacity>

      {acertou === true && <Text style={styles.feedbackCerto}>Muito bem!</Text>}
      {acertou === false && <Text style={styles.feedbackErro}>Tente de novo!</Text>}

      <View style={styles.grade}>
        {pecasFiltradas.map((peca, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.peca, { backgroundColor: corDoBotao(index), borderColor: bordaDoBotao(index) }]}
            onPress={() => responder(index)}
            disabled={selecionada !== null}
          >
            <Text style={styles.pecaEmoji}>{peca}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
        <Text style={styles.btnVoltarText}>Voltar</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEDFE',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  progresso: { fontSize: 13, color: '#3C3489' },
  barraFundo: { width: '100%', height: 6, backgroundColor: '#CECBF6', borderRadius: 3 },
  barraPreenchida: { height: 6, backgroundColor: '#7F77DD', borderRadius: 3 },
  perguntaBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#CECBF6',
    gap: 8,
  },
  perguntaLabel: { fontSize: 15, color: '#534AB7', fontWeight: '600' },
  perguntaEmoji: { fontSize: 72 },
  btnAudio: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7F77DD',
    alignItems: 'center',
    width: '100%',
  },
  btnAudioTexto: { fontSize: 14, color: '#3C3489', fontWeight: '500' },
  feedbackCerto: { fontSize: 16, color: '#534AB7', fontWeight: '600' },
  feedbackErro: { fontSize: 16, color: '#D85A30', fontWeight: '600' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  peca: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pecaEmoji: { fontSize: 52 },
  btnVoltar: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7F77DD',
    width: '100%',
    alignItems: 'center',
  },
  btnVoltarText: { color: '#3C3489', fontWeight: '600' },
});