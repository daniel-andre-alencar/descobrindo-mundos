import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { CONFIG_NIVEL, getNivel, getTema, salvarProgresso, TEMAS } from '../../config';

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

function embaralhar<T>(array: T[]) { return [...array].sort(() => Math.random() - 0.5); }

function BotaoSilaba({ silaba, onPress, cor, borda, disabled, temaCor }: {
  silaba: string; onPress: () => void; cor: string; borda: string; disabled: boolean; temaCor: string;
}) {
  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  function aoTocar() {
    escala.value = withSequence(withTiming(0.85, { duration: 80 }), withSpring(1, { damping: 4 }));
    onPress();
  }

  return (
    <Animated.View style={estiloAnimado}>
      <TouchableOpacity style={[styles.silabaBotao, { backgroundColor: cor, borderColor: borda }]} onPress={aoTocar} disabled={disabled}>
        <Text style={[styles.silabaTexto, { color: temaCor }]}>{silaba}</Text>
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
  const [somLigado, setSomLigado] = useState(true);
  const [opcoes, setOpcoes] = useState<string[]>([]);
  const [tema, setTema] = useState(TEMAS.verde);

  const palavra = palavras[atual];
  const escalaCartao = useSharedValue(1);
  const estiloCartao = useAnimatedStyle(() => ({ transform: [{ scale: escalaCartao.value }] }));

  useEffect(() => {
    async function carregar() {
      const nivel = await getNivel();
      setConfig(CONFIG_NIVEL[nivel]);
      setPalavras(embaralhar(PALAVRAS));
      const som = await AsyncStorage.getItem('som');
      setSomLigado(som === null ? true : som === 'true');
      const chave = await getTema();
      setTema(TEMAS[chave]);
    }
    carregar();
  }, []);

  useEffect(() => {
    if (palavras.length > 0) {
      const p = palavras[atual];
      const erradas = p.opcoes.filter(o => o !== p.fim);
      setOpcoes(embaralhar([...erradas.slice(0, config.qtdOpcoes - 1), p.fim]));
      setSilabaEscolhida('');
      setAcertou(null);
    }
  }, [atual, palavras, config]);

  async function tocarSom(arquivo: any) {
    if (!somLigado) return;
    try {
      if (sound) await sound.unloadAsync();
      const { sound: novoSom } = await Audio.Sound.createAsync(arquivo);
      setSound(novoSom);
      await novoSom.playAsync();
    } catch (e) { console.log('Erro:', e); }
  }

  useEffect(() => { return () => { if (sound) sound.unloadAsync(); }; }, [sound]);

  async function escolherSilaba(silaba: string) {
    setSilabaEscolhida(silaba);
    if (silaba === palavra.fim) {
      setAcertou(true);
      escalaCartao.value = withSequence(withSpring(1.05), withSpring(1));
      await tocarSom(require('../../assets/sounds/ttsMP3.Muito bem.mp3'));
      setTimeout(async () => {
        const novosAcertos = acertos + 1;
        setAcertos(novosAcertos);
        if (atual + 1 < palavras.length) { setAtual(atual + 1); }
        else { await salvarProgresso('Sílabas', novosAcertos, palavras.length); router.replace('/reward?jogo=puzzle' as any); }
      }, 1200);
    } else {
      setAcertou(false);
      await tocarSom(require('../../assets/sounds/ttsMP3.Tente de novo.mp3'));
      setTimeout(() => { setSilabaEscolhida(''); setAcertou(null); }, 900);
    }
  }

  function corDoBotao(silaba: string) {
    if (!silabaEscolhida) return '#fff';
    if (silaba === silabaEscolhida && acertou) return '#E1F5EE';
    if (silaba === silabaEscolhida && !acertou) return '#FAECE7';
    return '#fff';
  }

  function bordaDoBotao(silaba: string) {
    if (!silabaEscolhida) return tema.borda;
    if (silaba === silabaEscolhida && acertou) return '#1D9E75';
    if (silaba === silabaEscolhida && !acertou) return '#D85A30';
    return tema.borda;
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.fundo }]}>
      <Text style={[styles.progresso, { color: tema.texto }]}>{atual + 1} de {palavras.length}</Text>
      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${((atual + 1) / palavras.length) * 100}%`, backgroundColor: tema.primaria }]} />
      </View>
      <Animated.View style={[styles.cartao, estiloCartao, acertou === true && { borderColor: '#1D9E75' }, acertou === false && { borderColor: '#D85A30' }]}>
        <View style={[styles.silabaFixa, { backgroundColor: tema.fundo }]}>
          <Text style={[styles.silabaFixaTexto, { color: tema.texto }]}>{palavra.inicio}</Text>
        </View>
        <Text style={styles.emojiPalavra}>{palavra.emoji}</Text>
        <View style={[styles.alvo, acertou === true && { backgroundColor: '#E1F5EE', borderColor: '#1D9E75', borderStyle: 'solid' }, acertou === false && { backgroundColor: '#FAECE7', borderColor: '#D85A30', borderStyle: 'solid' }]}>
          <Text style={[styles.alvoTexto, { color: tema.primaria }, acertou === true && { color: '#1D9E75' }, acertou === false && { color: '#D85A30' }]}>
            {silabaEscolhida || '?'}
          </Text>
        </View>
      </Animated.View>
      <Text style={[styles.instrucao, { color: tema.texto }]}>Toque na sílaba que completa a palavra!</Text>
      {acertou === true && <Text style={styles.feedbackCerto}>Muito bem! ⭐</Text>}
      {acertou === false && <Text style={styles.feedbackErro}>Tente de novo!</Text>}
      <View style={styles.grade}>
        {opcoes.map((silaba, index) => (
          <BotaoSilaba key={`${atual}-${index}`} silaba={silaba} onPress={() => escolherSilaba(silaba)} cor={corDoBotao(silaba)} borda={bordaDoBotao(silaba)} disabled={acertou === true} temaCor={tema.texto} />
        ))}
      </View>
      <TouchableOpacity style={[styles.btnVoltar, { borderColor: tema.primaria }]} onPress={() => router.back()}>
        <Text style={[styles.btnVoltarText, { color: tema.texto }]}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 14 },
  progresso: { fontSize: 13 },
  barraFundo: { width: '100%', height: 6, backgroundColor: '#ddd', borderRadius: 3 },
  barraPreenchida: { height: 6, borderRadius: 3 },
  cartao: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 12, borderWidth: 2, borderColor: '#ddd', width: '100%', justifyContent: 'center' },
  silabaFixa: { borderRadius: 10, padding: 10, minWidth: 60, alignItems: 'center' },
  silabaFixaTexto: { fontSize: 30, fontWeight: '700' },
  emojiPalavra: { fontSize: 64 },
  alvo: { width: 80, height: 60, borderRadius: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: '#ddd', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' },
  alvoTexto: { fontSize: 28, fontWeight: '700' },
  instrucao: { fontSize: 13, textAlign: 'center' },
  feedbackCerto: { fontSize: 20, color: '#1D9E75', fontWeight: '700' },
  feedbackErro: { fontSize: 20, color: '#D85A30', fontWeight: '700' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  silabaBotao: { borderRadius: 12, borderWidth: 2, paddingVertical: 16, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', minWidth: 90 },
  silabaTexto: { fontSize: 30, fontWeight: '700' },
  btnVoltar: { padding: 14, borderRadius: 12, borderWidth: 1, width: '100%', alignItems: 'center' },
  btnVoltarText: { fontWeight: '600' },
});