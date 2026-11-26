import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection, limit, query } from "firebase/firestore";

/**
 * Script de seed inicial para popular as coleções `especialidades`, `sintomas` e `recomendacoes`
 * no Cloud Firestore caso estejam vazias.
 *
 * Uso: node scripts/seedFirestore.mjs
 * Observação: utilize temporariamente regras que permitam escrita administrativa ou o emulador local.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("Erro: defina as variáveis NEXT_PUBLIC_FIREBASE_* no arquivo .env.local antes de executar o seed.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ESPECIALIDADES = [
  { id: "esp_clinico_geral", nome: "Clínico Geral", descricao: "Médico que faz a avaliação completa da sua saúde e orienta o melhor cuidado inicial." },
  { id: "esp_cardiologia", nome: "Cardiologia", descricao: "Especialista que cuida do coração, da pressão arterial e da circulação." },
  { id: "esp_neurologia", nome: "Neurologia", descricao: "Especialista que avalia dores de cabeça fortes, tonturas, equilíbrio e formigamentos." },
  { id: "esp_pneumologia", nome: "Pneumologia", descricao: "Especialista focado na respiração, pulmões e tosse persistente." },
  { id: "esp_gastro", nome: "Gastroenterologia", descricao: "Especialista que cuida do estômago, intestino, azia e digestão." },
  { id: "esp_ortopedia", nome: "Ortopedia", descricao: "Especialista que trata dores na coluna, articulações, joelhos, ombros e pés." },
  { id: "esp_otorrino_oftalmo", nome: "Oftalmologia e Otorrino", descricao: "Especialistas que cuidam da visão, audição, garganta e equilíbrio do ouvido." },
  { id: "esp_angiologia", nome: "Angiologia", descricao: "Especialista que avalia inchaço nas pernas, varizes e circulação nos pés." },
];

const SINTOMAS = [
  { id: "sin_dor_cabeca", especialidade_id: "esp_clinico_geral", nome: "Dor de cabeça ou peso na testa", descricao: "Sensação de aperto, latejamento ou cansaço na cabeça.", regiao_corporal: "cabeca", area_vital: false },
  { id: "sin_tontura_forte", especialidade_id: "esp_neurologia", nome: "Tontura forte ou perda de equilíbrio", descricao: "Sensação de que tudo está girando ou risco de queda ao levantar.", regiao_corporal: "cabeca", area_vital: true },
  { id: "sin_vista_embacada", especialidade_id: "esp_otorrino_oftalmo", nome: "Vista embaçada repentina ou ardência", descricao: "Dificuldade para enxergar com clareza ou desconforto nos olhos.", regiao_corporal: "olhos_ouvidos", area_vital: false },
  { id: "sin_zumbido_ouvido", especialidade_id: "esp_otorrino_oftalmo", nome: "Zumbido ou dor no ouvido", descricao: "Barulho constante no ouvido ou diminuição da audição.", regiao_corporal: "olhos_ouvidos", area_vital: false },
  { id: "sin_dor_engolir", especialidade_id: "esp_otorrino_oftalmo", nome: "Dor ao engolir ou rouquidão", descricao: "Garganta arranhando, seca ou dolorida ao beber água ou comer.", regiao_corporal: "garganta", area_vital: false },
  { id: "sin_torcicolo", especialidade_id: "esp_ortopedia", nome: "Rigidez ou dor no pescoço (torcicolo)", descricao: "Dificuldade para virar a cabeça para os lados.", regiao_corporal: "garganta", area_vital: false },
  { id: "sin_aperto_peito", especialidade_id: "esp_cardiologia", nome: "Dor ou aperto no peito", descricao: "Sensação de peso, pressão ou queimação no centro ou lado esquerdo do peito.", regiao_corporal: "peito", area_vital: true },
  { id: "sin_falta_ar", especialidade_id: "esp_pneumologia", nome: "Falta de ar ou cansaço para respirar", descricao: "Respiração curta mesmo em repouso ou ao caminhar poucos passos.", regiao_corporal: "peito", area_vital: true },
  { id: "sin_tosse_peito", especialidade_id: "esp_pneumologia", nome: "Tosse seca ou com catarro", descricao: "Tosse frequente que incomoda ao falar ou deitar.", regiao_corporal: "peito", area_vital: false },
  { id: "sin_azia_queimacao", especialidade_id: "esp_gastro", nome: "Azia, queimação ou má digestão", descricao: "Desconforto na boca do estômago após as refeições.", regiao_corporal: "estomago", area_vital: false },
  { id: "sin_nausea_colica", especialidade_id: "esp_gastro", nome: "Enjoo ou dor na barriga", descricao: "Vontade de vomitar, cólica abdominal ou estufamento.", regiao_corporal: "estomago", area_vital: false },
  { id: "sin_dor_lombar", especialidade_id: "esp_ortopedia", nome: "Dor na coluna ou na região lombar", descricao: "Pontadas ou travamento nas costas ao levantar da cadeira ou cama.", regiao_corporal: "costas", area_vital: false },
  { id: "sin_dormencia_bracos", especialidade_id: "esp_neurologia", nome: "Dormência ou fraqueza repentina no braço", descricao: "Perda de força súbita para segurar objetos ou formigamento em um dos braços.", regiao_corporal: "bracos", area_vital: true },
  { id: "sin_dor_punho_ombro", especialidade_id: "esp_ortopedia", nome: "Dor nos ombros, cotovelos ou mãos", descricao: "Desconforto nas juntas dos braços ao fazer movimentos do dia a dia.", regiao_corporal: "bracos", area_vital: false },
  { id: "sin_dor_joelhos", especialidade_id: "esp_ortopedia", nome: "Dor ou estalos nos joelhos", descricao: "Dificuldade para dobrar o joelho, subir escadas ou caminhar.", regiao_corporal: "pernas", area_vital: false },
  { id: "sin_inchaco_pernas", especialidade_id: "esp_angiologia", nome: "Inchaço ou peso nas pernas", descricao: "Pernas cansadas, inchadas no fim do dia ou sensíveis ao toque.", regiao_corporal: "pernas", area_vital: false },
  { id: "sin_formigamento_pes", especialidade_id: "esp_angiologia", nome: "Formigamento ou queimação nos pés", descricao: "Sensação de agulhadas ou calor constante na planta dos pés.", regiao_corporal: "pes", area_vital: false },
  { id: "sin_dor_calcanhar", especialidade_id: "esp_ortopedia", nome: "Dor no calcanhar ou tornozelo", descricao: "Incômodo ao pisar no chão pela manhã ou ao andar.", regiao_corporal: "pes", area_vital: false },
];

const RECOMENDACOES = [
  { id: "rec_cabeca_leve", sintoma_id: "sin_dor_cabeca", gravidade_alvo: "leve", titulo: "Repouso em ambiente calmo e pouca luz", descricao: "Sente-se ou deite-se em um local silencioso, longe de telas brilhantes, e beba um copo de água fresca.", tipo: "repouso" },
  { id: "rec_cabeca_mod", sintoma_id: "sin_dor_cabeca", gravidade_alvo: "moderada", titulo: "Compressa morna ou fria na testa e hidratação", descricao: "Coloque um pano úmido e fresco na testa por 15 minutos e evite esforços até a dor diminuir.", tipo: "hidratacao" },
  { id: "rec_tontura_grave", sintoma_id: "sin_tontura_forte", gravidade_alvo: "grave", titulo: "Sente-se imediatamente e apoie as costas", descricao: "Não tente caminhar sozinho para evitar quedas. Fixe o olhar em um ponto parado e chame seu contato de apoio.", tipo: "urgencia" },
  { id: "rec_peito_grave", sintoma_id: "sin_aperto_peito", gravidade_alvo: "grave", titulo: "Interrompa qualquer atividade e peça ajuda médica", descricao: "Permaneça sentado com as costas apoiadas, afrouxe roupas apertadas e acione o SAMU (192) ou seu familiar.", tipo: "urgencia" },
  { id: "rec_falta_ar_mod", sintoma_id: "sin_falta_ar", gravidade_alvo: "moderada", titulo: "Postura inclinada para frente com apoio nos braços", descricao: "Sente-se na beira de uma cadeira firme, apoie os cotovelos nos joelhos e puxe o ar suavemente pelo nariz.", tipo: "respiracao" },
  { id: "rec_falta_ar_grave", sintoma_id: "sin_falta_ar", gravidade_alvo: "grave", titulo: "Respiração pausada e atendimento imediato", descricao: "Mantenha-se sentado em local ventilado e solicite auxílio urgente pelo telefone 192 ou contato principal.", tipo: "urgencia" },
  { id: "rec_tosse_leve", sintoma_id: "sin_tosse_peito", gravidade_alvo: "leve", titulo: "Pequenos goles de água morna ou chá suave", descricao: "Manter a garganta hidratada ajuda a acalmar a irritação da tosse. Evite ambientes com poeira.", tipo: "hidratacao" },
  { id: "rec_azia_leve", sintoma_id: "sin_azia_queimacao", gravidade_alvo: "leve", titulo: "Evite deitar logo após se alimentar", descricao: "Permaneça sentado com o tronco ereto por pelo menos 40 minutos e tome pequenos goles de água em temperatura ambiente.", tipo: "postura" },
  { id: "rec_nausea_mod", sintoma_id: "sin_nausea_colica", gravidade_alvo: "moderada", titulo: "Hidratação fracionada e repouso abdominal", descricao: "Tome goles pequenos de água aos poucos, sem pressa, e evite alimentos gordurosos ou muito condimentados hoje.", tipo: "hidratacao" },
  { id: "rec_lombar_leve", sintoma_id: "sin_dor_lombar", gravidade_alvo: "leve", titulo: "Apoio lombar ao sentar", descricao: "Coloque uma almofada pequena atrás da curva das costas ao sentar e levante-se devagar apoiando as mãos.", tipo: "postura" },
  { id: "rec_bracos_grave", sintoma_id: "sin_dormencia_bracos", gravidade_alvo: "grave", titulo: "Atenção urgente aos sinais neurológicos", descricao: "Fraqueza ou dormência repentina exige avaliação médica imediata. Avise seu contato de emergência ou ligue 192.", tipo: "urgencia" },
  { id: "rec_pernas_leve", sintoma_id: "sin_inchaco_pernas", gravidade_alvo: "leve", titulo: "Eleve suavemente as pernas ao descansar", descricao: "Ao sentar no sofá ou deitar, apoie os pés sobre uma almofada macia para facilitar o retorno da circulação.", tipo: "postura" },
  { id: "rec_pes_leve", sintoma_id: "sin_formigamento_pes", gravidade_alvo: "leve", titulo: "Calçados confortáveis e observação da pele", descricao: "Use meias sem costura apertada, evite sapatos duros e verifique se há vermelhidão ou machucados nos pés.", tipo: "observacao" },
];

async function runSeed() {
  const existing = await getDocs(query(collection(db, "sintomas"), limit(1)));
  if (!existing.empty) {
    console.log("Catálogo já populado no Firestore. Nenhuma alteração necessária.");
    return;
  }

  for (const esp of ESPECIALIDADES) {
    await setDoc(doc(db, "especialidades", esp.id), esp);
  }
  for (const sin of SINTOMAS) {
    await setDoc(doc(db, "sintomas", sin.id), sin);
  }
  for (const rec of RECOMENDACOES) {
    await setDoc(doc(db, "recomendacoes", rec.id), rec);
  }

  console.log("Seed concluído: especialidades, sintomas e recomendações gravados no Firestore.");
}

runSeed().catch((err) => {
  console.error("Falha ao executar seed:", err);
  process.exit(1);
});
