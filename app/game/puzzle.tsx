import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { CONFIG_NIVEL, getNivel, salvarProgresso } from '../../config';

// ===== PALAVRAS DO JOGO =====
const PALAVRAS = [
  { emoji: '🦆', inicio: 'PA', fim: 'TO', opcoes: ['TO', 'LA', 'PO', 'LE'] },
  { emoji: '🐱', inicio: 'GA', fim: 'TO', opcoes: ['LE', 'TO', 'PO', 'LA'] },
  { emoji: '🍬', inicio: 'BA', fim: 'LA', opcoes: ['TO', 'PO', 'LA', 'ÃO'] },
  { emoji: '🦁', inicio: 'LE', fim: 'ÃO', opcoes: ['LA', 'ÃO', 'TO', 'PO'] },
  { emoji: '🐸', inicio: 'SA', fim: 'PO', opcoes: ['PO', 'LA', 'TO', 'LE'] },
  { emoji: '🐭', inicio: 'RA', fim: 'TO', opcoes: ['LA', 'PO', 'TO', 'ÃO'] },
  { emoji: '🎩', inicio: 'CHA', fim: 'PÉU', opcoes: ['PÉU', 'LA', 'TO', 'PO'] },
  { emoji: '🥁', inicio: 'TAM', fim: 'BOR', opcoes: ['LA', 'BOR', 'TO', 'PO'] },
];

function embaralhar<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

// ===== BOTÃO DE SÍLABA ANIMADO =====
function BotaoSilaba({ silaba, onPress, cor, borda, disabled }: {
  silaba: string;
  onPress: () => void;
  cor: string;
  borda: string;
  disabled: boolean;
}) {
  const escala = useSharedValue(1);

  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  function aoTocar() {
    // animação de toque
    escala.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1, { damping: 4 })
    );
    onPress();
  }

  return (
    <Animated.View style={estiloAnimado}>
      <TouchableOpacity
        style={[styles.silabaBotao, { backgroundColor: cor, borderColor: borda }]}
        onPress={aoTocar}
        disabled={disabled}
      >
        <Text style={styles.silabaTexto}>{silaba}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PuzzleGame() {
  const router = useRouter();
  const [config, setConfig] = useState(CONFIG_NIVEL[1]);
  const [palavras, setPalavras] = useState(PALAVRAS);
  const [atual, setAtual] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [acertou, setAcertou] = useState<boolean | null>(null);
  const [silabaEscolhida, setSilabaEscolhida] = useState('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [opcoes, setOpcoes] = useState<string[]>([]);

  const palavra = palavras[atual];

  // animação do cartão quando acerta
  const escalaCartao = useSharedValue(1);
  const estiloCartao = useAnimatedStyle(() => ({
    transform: [{ scale: escalaCartao.value }],
  }));

  useEffect(() => {
    async function carregarNivel() {
      const nivel = await getNivel();
      setConfig(CONFIG_NIVEL[nivel]);
    }
    carregarNivel();
    setPalavras(embaralhar(PALAVRAS));
  }, []);

  // atualiza opções quando muda de palavra
  useEffect(() => {
    if (palavras.length > 0) {
      const p = palavras[atual];
      const erradas = p.opcoes.filter(o => o !== p.fim);
      const qtdErradas = config.qtdOpcoes - 1;
      setOpcoes(embaralhar([...erradas.slice(0, qtdErradas), p.fim]));
      setSilabaEscolhida('');
      setAcertou(null);
    }
  }, [atual, palavras, config]);

  async function tocarSom(arquivo: any) {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: novoSom } = await Audio.Sound.createAsync(arquivo);
      setSound(novoSom);
      await novoSom.playAsync();
    } catch (e) {
      console.log('Erro:', e);
    }
  }

  useEffect(() => {
    return () => { if (sound) sound.unloadAsync(); };
  }, [sound]);

  // chamada quando a criança toca em uma sílaba
  async function escolherSilaba(silaba: string) {
    setSilabaEscolhida(silaba);

    if (silaba === palavra.fim) {
      setAcertou(true);
      // anima o cartão
      escalaCartao.value = withSequence(
        withSpring(1.05),
        withSpring(1)
      );
      await tocarSom(require('../../assets/sounds/ttsMP3.Muito bem.mp3'));

      setTimeout(async () => {
        const novosAcertos = acertos + 1;
        setAcertos(novosAcertos);

        if (atual + 1 < palavras.length) {
          setAtual(atual + 1);
        } else {
          await salvarProgresso('Sílabas', novosAcertos, palavras.length);
          router.replace('/reward?jogo=puzzle' as any);
        }
      }, 1200);

    } else {
      setAcertou(false);
      await tocarSom(require('../../assets/sounds/ttsMP3.Tente de novo.mp3'));
      setTimeout(() => {
        setSilabaEscolhida('');
        setAcertou(null);
      }, 900);
    }
  }

  function corDoBotao(silaba: string) {
    if (!silabaEscolhida) return '#fff';
    if (silaba === silabaEscolhida && acertou) return '#E1F5EE';
    if (silaba === silabaEscolhida && !acertou) return '#FAECE7';
    return '#fff';
  }

  function bordaDoBotao(silaba: string) {
    if (!silabaEscolhida) return '#B4A8E8';
    if (silaba === silabaEscolhida && acertou) return '#1D9E75';
    if (silaba === silabaEscolhida && !acertou) return '#D85A30';
    return '#B4A8E8';
  }

  return (
    <View style={styles.container}>

      {/* progresso */}
      <Text style={styles.progresso}>{atual + 1} de {palavras.length}</Text>
      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${((atual + 1) / palavras.length) * 100}%` }]} />
      </View>

      {/* card da palavra com animação */}
      <Animated.View style={[
        styles.cartao,
        estiloCartao,
        acertou === true && { borderColor: '#1D9E75' },
        acertou === false && { borderColor: '#D85A30' },
      ]}>
        {/* sílaba inicial fixa */}
        <View style={styles.silabaFixa}>
          <Text style={styles.silabaFixaTexto}>{palavra.inicio}</Text>
        </View>

        {/* emoji da palavra */}
        <Text style={styles.emojiPalavra}>{palavra.emoji}</Text>

        {/* espaço para a sílaba escolhida */}
        <View style={[
          styles.alvo,
          acertou === true && { backgroundColor: '#E1F5EE', borderColor: '#1D9E75', borderStyle: 'solid' },
          acertou === false && { backgroundColor: '#FAECE7', borderColor: '#D85A30', borderStyle: 'solid' },
        ]}>
          <Text style={[
            styles.alvoTexto,
            acertou === true && { color: '#1D9E75' },
            acertou === false && { color: '#D85A30' },
          ]}>
            {silabaEscolhida || '?'}
          </Text>
        </View>
      </Animated.View>

      <Text style={styles.instrucao}>Toque na sílaba que completa a palavra!</Text>

      {/* feedback */}
      {acertou === true && <Text style={styles.feedbackCerto}>Muito bem! ⭐</Text>}
      {acertou === false && <Text style={styles.feedbackErro}>Tente de novo!</Text>}

      {/* botões de sílaba */}
      <View style={styles.grade}>
        {opcoes.map((silaba, index) => (
          <BotaoSilaba
            key={`${atual}-${index}`}
            silaba={silaba}
            onPress={() => escolherSilaba(silaba)}
            cor={corDoBotao(silaba)}
            borda={bordaDoBotao(silaba)}
            disabled={acertou === true}
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
    backgroundColor: '#EEEDFE',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  progresso: { fontSize: 13, color: '#3C3489' },
  barraFundo: { width: '100%', height: 6, backgroundColor: '#CECBF6', borderRadius: 3 },
  barraPreenchida: { height: 6, backgroundColor: '#7F77DD', borderRadius: 3 },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: '#B4A8E8',
    width: '100%',
    justifyContent: 'center',
  },
  silabaFixa: {
    backgroundColor: '#EEEDFE',
    borderRadius: 10,
    padding: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  silabaFixaTexto: {
    fontSize: 30,
    fontWeight: '700',
    color: '#3C3489',
  },
  emojiPalavra: { fontSize: 64 },
  alvo: {
    width: 80,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#7F77DD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F0FD',
  },
  alvoTexto: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7F77DD',
  },
  instrucao: { fontSize: 13, color: '#534AB7', textAlign: 'center' },
  feedbackCerto: { fontSize: 20, color: '#1D9E75', fontWeight: '700' },
  feedbackErro: { fontSize: 20, color: '#D85A30', fontWeight: '700' },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  silabaBotao: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  silabaTexto: {
    fontSize: 30,
    fontWeight: '700',
    color: '#3C3489',
  },
  btnVoltar: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7F77DD',
    width: '100%',
    alignItems: 'center',
  },
  btnVoltarText: { color: '#3C3489', fontWeight: '600' },
});