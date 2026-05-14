import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CONFIG_NIVEL, getNivel, salvarProgresso } from '../../config';

// ===== SITUAÇÕES DO JOGO =====
// cada pergunta tem sua própria situação e áudio correspondente
const PERGUNTAS = [
  { 
    situacao: 'O João ganhou um presente!', 
    opcoes: ['😢', '😃', '😡', '😨'], 
    correta: '😃', 
    audio: require('../../assets/sounds/ttsMP3.O João ganhou um presente!.mp3'),
  },
  { 
    situacao: 'A Maria perdeu seu brinquedo.', 
    opcoes: ['😃', '😡', '😢', '😲'], 
    correta: '😢', 
    audio: require('../../assets/sounds/ttsMP3A Maria perdeu seu brinquedo..mp3'),
  },
  { 
    situacao: 'O Pedro levou um susto!', 
    opcoes: ['😃', '😢', '😨', '😡'], 
    correta: '😨', 
    audio: require('../../assets/sounds/ttsMP3.O Pedro levou um susto!.mp3'),
  },
  { 
    situacao: 'A Ana não conseguiu abrir o pote.', 
    opcoes: ['😃', '😡', '😢', '😨'], 
    correta: '😡', 
    audio: require('../../assets/sounds/ttsMP3.A Ana não conseguiu abrir o pote..mp3'),
  },
  { 
    situacao: 'O Luis viu algo inacreditável!', 
    opcoes: ['😢', '😃', '😡', '😲'], 
    correta: '😲', 
    audio: require('../../assets/sounds/ttsMP3.O Luis viu algo inacreditável.mp3'),
  },
  { 
    situacao: 'A Julia brincou com seu cachorro.', 
    opcoes: ['😢', '😨', '😡', '😃'], 
    correta: '😃', 
    audio: require('../../assets/sounds/ttsMP3.A Julia brincou com seu cachorro..mp3'),
  },
];

// ===== NOMES DAS EMOÇÕES =====
const NOMES: Record<string, string> = {
  '😃': 'Feliz',
  '😢': 'Triste',
  '😡': 'Bravo',
  '😨': 'Com medo',
  '😲': 'Surpreso',
};

function embaralhar<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

function filtrarOpcoes(opcoes: string[], correta: string, qtd: number) {
  const erradas = opcoes.filter(o => o !== correta);
  const selecionadas = erradas.slice(0, qtd - 1);
  return embaralhar([...selecionadas, correta]);
}

export default function EmotionsGame() {
  const router = useRouter();

  const [config, setConfig] = useState(CONFIG_NIVEL[1]);
  const [perguntas, setPerguntas] = useState(PERGUNTAS);
  const [atual, setAtual] = useState(0);
  const [selecionada, setSelecionada] = useState('');
  const [acertou, setAcertou] = useState<boolean | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    async function carregarNivel() {
      const nivel = await getNivel();
      const cfg = CONFIG_NIVEL[nivel];
      setConfig(cfg);
      setPerguntas(cfg.embaralhar ? embaralhar(PERGUNTAS) : PERGUNTAS);
    }
    carregarNivel();
  }, []);

  // ===== TOCAR SOM SIMPLES =====
  // toca um único arquivo de áudio
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

  // ===== TOCAR SEQUÊNCIA =====
  // toca a situação primeiro, depois pergunta como a pessoa está se sentindo
  async function tocarSequencia(arquivoSituacao: any) {
    try {
      if (sound) await sound.unloadAsync();

      // toca a situação primeiro
      const { sound: som1 } = await Audio.Sound.createAsync(arquivoSituacao);
      setSound(som1);
      await som1.playAsync();

      // quando terminar, toca a pergunta
      som1.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          const { sound: som2 } = await Audio.Sound.createAsync(
            require('../../assets/sounds/ttsMP3.Como ele está se sentindo.mp3')
          );
          setSound(som2);
          await som2.playAsync();
        }
      });
    } catch (e) {
      console.log('Erro ao tocar sequência:', e);
    }
  }

  // libera memória quando sai da tela
  useEffect(() => {
    return () => { if (sound) sound.unloadAsync(); };
  }, [sound]);

  // toca situação + pergunta automaticamente quando muda de pergunta
  useEffect(() => {
    if (perguntas.length > 0) tocarSequencia(perguntas[atual].audio);
  }, [atual, perguntas]);

  const pergunta = perguntas[atual];
  const opcoesFiltradas = filtrarOpcoes(pergunta.opcoes, pergunta.correta, config.qtdOpcoes);

  async function responder(opcao: string) {
    setSelecionada(opcao);

    if (opcao === pergunta.correta) {
      const novosAcertos = acertos + 1;
      setAcertos(novosAcertos);
      setAcertou(true);
      await tocarSom(require('../../assets/sounds/ttsMP3.Muito bem.mp3'));

      setTimeout(async () => {
        if (atual + 1 < perguntas.length) {
          setAtual(atual + 1);
          setSelecionada('');
          setAcertou(null);
        } else {
          await salvarProgresso('Emoções', novosAcertos, perguntas.length);
          router.replace('/reward?jogo=emotions' as any);
        }
      }, config.tempoFeedback);

    } else {
      setAcertou(false);
      await tocarSom(require('../../assets/sounds/ttsMP3.Tente de novo.mp3'));
      setTimeout(() => {
        setSelecionada('');
        setAcertou(null);
      }, config.tempoFeedback);
    }
  }

  function corDoBotao(opcao: string) {
    if (!selecionada) return '#fff';
    if (opcao === selecionada && acertou) return '#FBEAF0';
    if (opcao === selecionada && !acertou) return '#FAECE7';
    return '#fff';
  }

  function bordaDoBotao(opcao: string) {
    if (!selecionada) return '#ddd';
    if (opcao === selecionada && acertou) return '#D4537E';
    if (opcao === selecionada && !acertou) return '#D85A30';
    return '#ddd';
  }

  return (
    <View style={styles.container}>

      {/* progresso da sessão */}
      <Text style={styles.progresso}>{atual + 1} de {perguntas.length}</Text>
      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${((atual + 1) / perguntas.length) * 100}%` }]} />
      </View>

      {/* caixa com a situação */}
      <View style={styles.situacaoBox}>
        <Text style={styles.situacao}>{pergunta.situacao}</Text>
      </View>

      {/* botão para repetir situação + pergunta */}
      <TouchableOpacity style={styles.btnAudio} onPress={() => tocarSequencia(pergunta.audio)}>
        <Text style={styles.btnAudioTexto}>🔊 Ouvir situação</Text>
      </TouchableOpacity>

      {/* feedback após responder */}
      {acertou === true && <Text style={styles.feedbackCerto}>Muito bem!</Text>}
      {acertou === false && <Text style={styles.feedbackErro}>Tente de novo!</Text>}

      {/* grade de emoções filtradas pelo nível TEA */}
      <View style={styles.grade}>
        {opcoesFiltradas.map((opcao) => (
          <TouchableOpacity
            key={opcao}
            style={[styles.opcao, { backgroundColor: corDoBotao(opcao), borderColor: bordaDoBotao(opcao) }]}
            onPress={() => responder(opcao)}
            disabled={!!selecionada}
          >
            <Text style={styles.emoji}>{opcao}</Text>
            <Text style={styles.nomeEmocao}>{NOMES[opcao]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
        <Text style={styles.btnVoltarText}>Voltar</Text>
      </TouchableOpacity>

    </View>
  );
}

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBEAF0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  progresso: { fontSize: 13, color: '#72243E' },
  barraFundo: { width: '100%', height: 6, backgroundColor: '#F4C0D1', borderRadius: 3 },
  barraPreenchida: { height: 6, backgroundColor: '#D4537E', borderRadius: 3 },
  situacaoBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F4C0D1',
  },
  situacao: { fontSize: 18, fontWeight: '600', color: '#72243E', textAlign: 'center', lineHeight: 26 },
  btnAudio: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4537E',
    alignItems: 'center',
    width: '100%',
  },
  btnAudioTexto: { fontSize: 14, color: '#72243E', fontWeight: '500' },
  feedbackCerto: { fontSize: 16, color: '#D4537E', fontWeight: '600' },
  feedbackErro: { fontSize: 16, color: '#D85A30', fontWeight: '600' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  opcao: {
    width: 130,
    height: 110,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emoji: { fontSize: 48 },
  nomeEmocao: { fontSize: 12, fontWeight: '600', color: '#72243E' },
  btnVoltar: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4537E',
    width: '100%',
    alignItems: 'center',
  },
  btnVoltarText: { color: '#72243E', fontWeight: '600' },
});