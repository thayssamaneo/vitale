import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import {
  ESPECIALIDADES_SEED,
  RECOMENDACOES_SEED,
  SINTOMAS_SEED,
} from '@/lib/seedData';
import {
  AvaliacaoSintomas,
  Especialidade,
  Gravidade,
  Recomendacao,
  Sintoma,
  SintomaSelecionadoResumo,
} from '@/types/vitale';

// Converte Timestamp do Firestore ou string para ISO string legível
function normalizeTimestamp(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

/**
 * Tenta popular o catálogo inicial caso o banco esteja vazio e as regras permitam.
 * Se as regras de segurança bloquearem escrita pelo cliente (produção LGPD), falha silenciosamente
 * e a aplicação utiliza o catálogo inicial em memória como contingência.
 */
export async function seedMedicalCollectionsIfEmpty(): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const sintomasSnap = await getDocs(query(collection(db, 'sintomas'), limit(1)));
    if (!sintomasSnap.empty) {
      return false;
    }

    await Promise.all([
      ...ESPECIALIDADES_SEED.map((esp) =>
        setDoc(doc(db, 'especialidades', esp.id), esp)
      ),
      ...SINTOMAS_SEED.map((sin) => setDoc(doc(db, 'sintomas', sin.id), sin)),
      ...RECOMENDACOES_SEED.map((rec) =>
        setDoc(doc(db, 'recomendacoes', rec.id), rec)
      ),
    ]);
    return true;
  } catch {
    // Em produção, `firestore.rules` mantém coleções de catálogo como somente leitura.
    return false;
  }
}

// Busca o catálogo de sintomas e especialidades no Firestore (com fallback seguro)
export async function fetchMedicalCatalog(): Promise<{
  especialidades: Especialidade[];
  sintomas: Sintoma[];
  recomendacoes: Recomendacao[];
}> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      especialidades: ESPECIALIDADES_SEED,
      sintomas: SINTOMAS_SEED,
      recomendacoes: RECOMENDACOES_SEED,
    };
  }

  try {
    const [espSnap, sinSnap, recSnap] = await Promise.all([
      getDocs(collection(db, 'especialidades')),
      getDocs(collection(db, 'sintomas')),
      getDocs(collection(db, 'recomendacoes')),
    ]);

    if (sinSnap.empty || espSnap.empty) {
      await seedMedicalCollectionsIfEmpty();
      return {
        especialidades: ESPECIALIDADES_SEED,
        sintomas: SINTOMAS_SEED,
        recomendacoes: RECOMENDACOES_SEED,
      };
    }

    const especialidades = espSnap.docs.map((d) => ({
      ...(d.data() as Omit<Especialidade, 'id'>),
      id: d.id,
    }));

    const sintomas = sinSnap.docs.map((d) => ({
      ...(d.data() as Omit<Sintoma, 'id'>),
      id: d.id,
    }));

    const recomendacoes = recSnap.empty
      ? RECOMENDACOES_SEED
      : recSnap.docs.map((d) => ({
          ...(d.data() as Omit<Recomendacao, 'id'>),
          id: d.id,
        }));

    return { especialidades, sintomas, recomendacoes };
  } catch {
    return {
      especialidades: ESPECIALIDADES_SEED,
      sintomas: SINTOMAS_SEED,
      recomendacoes: RECOMENDACOES_SEED,
    };
  }
}

// Cria um registro de avaliação de sintomas na coleção `avaliacoes_sintomas`
export async function createSymptomEvaluation(params: {
  usuarioId: string;
  sintomas: Sintoma[];
  gravidade: Gravidade;
  observacoes?: string;
}): Promise<string> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error(
      'Serviço do banco de dados indisponível. Verifique as variáveis de ambiente do Firebase.'
    );
  }

  const sintomasSelecionados: SintomaSelecionadoResumo[] = params.sintomas.map(
    (s) => ({
      sintoma_id: s.id,
      nome: s.nome,
      area_vital: Boolean(s.area_vital),
      regiao_corporal: s.regiao_corporal,
      especialidade_id: s.especialidade_id,
    })
  );

  const emergenciaAcionada =
    params.gravidade === 'grave' ||
    sintomasSelecionados.some((s) => s.area_vital);

  const docRef = await addDoc(collection(db, 'avaliacoes_sintomas'), {
    usuario_id: params.usuarioId,
    data_hora: serverTimestamp(),
    sintomas_selecionados: sintomasSelecionados,
    gravidade_geral: params.gravidade,
    emergencia_acionada: emergenciaAcionada,
    observacoes: params.observacoes?.trim() || '',
  });

  return docRef.id;
}

// Busca uma avaliação específica validando se pertence ao usuário autenticado
export async function fetchEvaluationById(
  avaliacaoId: string,
  usuarioId: string
): Promise<AvaliacaoSintomas | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const snap = await getDoc(doc(db, 'avaliacoes_sintomas', avaliacaoId));
  if (!snap.exists()) return null;

  const data = snap.data();
  if (data.usuario_id !== usuarioId) {
    return null;
  }

  return {
    id: snap.id,
    usuario_id: data.usuario_id as string,
    data_hora: normalizeTimestamp(data.data_hora),
    sintomas_selecionados:
      (data.sintomas_selecionados as SintomaSelecionadoResumo[]) || [],
    gravidade_geral: (data.gravidade_geral as Gravidade) || 'leve',
    emergencia_acionada: Boolean(data.emergencia_acionada),
    observacoes: (data.observacoes as string) || '',
  };
}

// Lista histórico recente de avaliações do usuário (para exibição opcional no perfil)
export async function fetchUserEvaluationHistory(
  usuarioId: string
): Promise<AvaliacaoSintomas[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, 'avaliacoes_sintomas'),
      where('usuario_id', '==', usuarioId),
      orderBy('data_hora', 'desc'),
      limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        usuario_id: data.usuario_id as string,
        data_hora: normalizeTimestamp(data.data_hora),
        sintomas_selecionados:
          (data.sintomas_selecionados as SintomaSelecionadoResumo[]) || [],
        gravidade_geral: (data.gravidade_geral as Gravidade) || 'leve',
        emergencia_acionada: Boolean(data.emergencia_acionada),
        observacoes: (data.observacoes as string) || '',
      };
    });
  } catch {
    return [];
  }
}
