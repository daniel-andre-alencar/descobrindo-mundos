import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CONFIG_NIVEL, getNivel, salvarProgresso } from '../../config';

const PERGUNTAS = [
  { pergunta: 'Qual animal late?', opcoes: ['🐱', '🐶', '🐢', '🐟'], correta: '🐶', audio: require('../../assets/sounds/ttsMP3.Qual animal late.mp3') },
  { pergunta: 'Qual fruta é amarela?', opcoes: ['🍎', '🍇', '🍌', '🍓'], correta: '🍌', audio: require('../../assets/sounds/ttsMP3.Qual fruta é amarela.mp3') },
  { pergunta: 'Qual animal voa?', opcoes: ['🐶', '🐸', '🦅', '🐟'], correta: '🦅', audio: require('../../assets/sounds/ttsMP3.Qual animal voa.mp3') },
  { pergunta: 'Qual é o meio de transporte?', opcoes: ['🏠', '🚗', '🌳', '📱'], correta: '🚗', audio: require('../../assets/sounds/ttsMP3.Qual é o meio de transporte.mp3') },
];

function embaralhar<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

function filtrarOpcoes(opcoes: string[], correta: string, qtd: number) {
  const erradas = opcoes.filter(o => o !== correta);
  const selecionadas = erradas.slice(0, qtd - 1);
  return embaralhar([...selecionadas, correta]);
}

// ===== BOTÃO ANIMADO =====
// componente de botão que cresce quando tocado
function BotaoAnimado({ opcao, onPress, cor, borda, disabled }: {
  opcao: string;
  onPress: () => void;
  cor: string;
  borda: string;
  disabled: boolean;
}) {
  // valor compartilhado que controla o tamanho do botão
  const escala = useSharedValue(1);

  // estilo animado — muda o tamanho baseado no valor de escala
  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  function aoTocar() {
    // anima: encolhe e depois cresce de volta
    escala.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, { damping: 4 })
    );
    onPress();
  }

  return (
    <Animated.View style={estiloAnimado}>
      <TouchableOpacity
        style={[styles.opcao, { backgroundColor: cor, borderColor: borda }]}
        onPress={aoTocar}
        disabled={disabled}
      >
        <Text style={styles.emoji}>{opcao}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ===== FEEDBACK ANIMADO =====
// componente que aparece com animação quando acerta
function FeedbackAnimado({ visivel, texto, cor }: {
  visivel: boolean;
  texto: string;
  cor: string;
}) {
  const escala = useSharedValue(0);

  useEffect(() => {
    if (visivel) {
      // aparece com efeito de mola
      escala.value = withSpring(1, { damping: 4 });
    } else {
      escala.value = 0;
    }
  }, [visivel]);

  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
    opacity: escala.value,
  }));

  if (!visivel) return null;

  return (
    <Animated.View style={estiloAnimado}>
      <Text style={[styles.feedback, { color: cor }]}>{texto}</Text>
    </Animated.View>
  );
}

export default function AssociationGame() {
  const router = useRouter();
  const [config, setConfig] = useState(CONFIG_NIVEL[1]);
  const [perguntas, setPerguntas] = useState(PERGUNTAS);
  const [atual, setAtual] = useState(0);
  const [selecionada, setSelecionada] = useState('');
  const [acertou, setAcertou] = useState<boolean | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // animação da barra de progresso
  const larguraBarra = useSharedValue(0);
  const estiloBarra = useAnimatedStyle(() => ({
    width: `${larguraBarra.value}%`,
  }));

  useEffect(() => {
    async function carregarNivel() {
      const nivel = await getNivel();
      const cfg = CONFIG_NIVEL[nivel];
      setConfig(cfg);
      setPerguntas(cfg.embaralhar ? embaralhar(PERGUNTAS) : PERGUNTAS);
    }
    carregarNivel();
  }, []);

  // atualiza a barra de progresso com animação
  useEffect(() => {
    larguraBarra.value = withTiming(
      ((atual + 1) / PERGUNTAS.length) * 100,
      { duration: 400 }
    );
  }, [atual]);

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

  useEffect(() => {
    return () => { if (sound) sound.unloadAsync(); };
  }, [sound]);

  useEffect(() => {
    if (perguntas.length > 0) tocarSom(perguntas[atual].audio);
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
          await salvarProgresso('Associação', novosAcertos, perguntas.length);
          router.replace('/reward?jogo=association' as any);
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
    if (opcao === selecionada && acertou) return '#E1F5EE';
    if (opcao === selecionada && !acertou) return '#FAECE7';
    return '#fff';
  }

  function bordaDoBotao(opcao: string) {
    if (!selecionada) return '#ddd';
    if (opcao === selecionada && acertou) return '#1D9E75';
    if (opcao === selecionada && !acertou) return '#D85A30';
    return '#ddd';
  }

  return (
    <View style={styles.container}>

      <Text style={styles.progresso}>{atual + 1} de {perguntas.length}</Text>

      {/* barra de progresso animada */}
      <View style={styles.barraFundo}>
        <Animated.View style={[styles.barraPreenchida, estiloBarra]} />
      </View>

      <TouchableOpacity style={styles.btnAudio} onPress={() => tocarSom(pergunta.audio)}>
        <Text style={styles.btnAudioTexto}>🔊 Ouvir pergunta</Text>
      </TouchableOpacity>

      <Text style={styles.pergunta}>{pergunta.pergunta}</Text>

      {/* feedback animado de acerto */}
      <FeedbackAnimado visivel={acertou === true} texto="Muito bem! ⭐" cor="#1D9E75" />
      {/* feedback animado de erro */}
      <FeedbackAnimado visivel={acertou === false} texto="Tente de novo!" cor="#D85A30" />

      {/* grade de botões animados */}
      <View style={styles.grade}>
        {opcoesFiltradas.map((opcao) => (
          <BotaoAnimado
            key={opcao}
            opcao={opcao}
            onPress={() => responder(opcao)}
            cor={corDoBotao(opcao)}
            borda={bordaDoBotao(opcao)}
            disabled={!!selecionada}
          />
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
    backgroundColor: '#E1F5EE',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  progresso: { fontSize: 13, color: '#0F6E56' },
  barraFundo: { width: '100%', height: 6, backgroundColor: '#9FE1CB', borderRadius: 3 },
  barraPreenchida: { height: 6, backgroundColor: '#1D9E75', borderRadius: 3 },
  btnAudio: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D9E75',
    alignItems: 'center',
    width: '100%',
  },
  btnAudioTexto: { fontSize: 14, color: '#085041', fontWeight: '500' },
  pergunta: { fontSize: 22, fontWeight: '700', color: '#085041', textAlign: 'center' },
  feedback: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  opcao: { width: 120, height: 120, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 52 },
  btnVoltar: { marginTop: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1D9E75', width: '100%', alignItems: 'center' },
  btnVoltarText: { color: '#085041', fontWeight: '600' },
});