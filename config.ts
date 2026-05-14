import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== CONFIGURAÇÕES POR NÍVEL =====
// define o comportamento do jogo para cada nível TEA
export const CONFIG_NIVEL = {
  1: {
    qtdOpcoes: 4,        // quantas opções aparecem
    embaralhar: true,    // embaralha as perguntas
    tempoFeedback: 800,  // tempo em ms antes de ir para próxima pergunta
  },
  2: {
    qtdOpcoes: 3,
    embaralhar: false,
    tempoFeedback: 1200,
  },
  3: {
    qtdOpcoes: 2,
    embaralhar: false,
    tempoFeedback: 1500,
  },
};

// lê o nível salvo pelo responsável
export async function getNivel(): Promise<1 | 2 | 3> {
  const salvo = await AsyncStorage.getItem('nivel_tea');
  const nivel = Number(salvo);
  if (nivel === 1 || nivel === 2 || nivel === 3) return nivel;
  return 1; // padrão é nível 1 se não tiver salvo
}
// ===== FUNÇÕES DE PROGRESSO =====

// salva quando a criança completa um jogo
export async function salvarProgresso(jogo: string, acertos: number, total: number) {
  try {
    // pega o histórico já salvo
    const historico = await AsyncStorage.getItem('progresso');
    const dados = historico ? JSON.parse(historico) : [];

    // adiciona nova entrada com data e hora
    dados.push({
      jogo,
      acertos,
      total,
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    // salva de volta
    await AsyncStorage.setItem('progresso', JSON.stringify(dados));
  } catch (e) {
    console.log('Erro ao salvar progresso:', e);
  }
}

// lê todo o histórico salvo
export async function getProgresso() {
  try {
    const historico = await AsyncStorage.getItem('progresso');
    return historico ? JSON.parse(historico) : [];
  } catch (e) {
    return [];
  }
}

// limpa todo o histórico
export async function limparProgresso() {
  await AsyncStorage.removeItem('progresso');
}