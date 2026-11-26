// Tipos de domínio da Plataforma Web Vitale (alinhados ao MER no Cloud Firestore)

export type Gravidade = 'leve' | 'moderada' | 'grave';

export type RegiaoCorporalId =
  | 'cabeca'
  | 'olhos_ouvidos'
  | 'garganta'
  | 'peito'
  | 'estomago'
  | 'costas'
  | 'bracos'
  | 'pernas'
  | 'pes';

export interface ContatoEmergencia {
  id: string;
  nome: string;
  telefone: string;
  parentesco: string;
  principal: boolean;
}

export interface UsuarioVitale {
  uid: string;
  nome: string;
  email: string;
  idade?: number;
  cpf?: string;
  cep?: string;
  data_cadastro: string; // ISO string ou timestamp formatado para exibição segura no cliente
  ultima_atualizacao?: string;
  contatos_emergencia: ContatoEmergencia[];
}

export interface Especialidade {
  id: string;
  nome: string;
  descricao: string;
}

export interface Sintoma {
  id: string;
  especialidade_id: string;
  nome: string;
  descricao: string;
  regiao_corporal: RegiaoCorporalId;
  area_vital: boolean;
}

export interface Recomendacao {
  id: string;
  sintoma_id: string;
  gravidade_alvo: Gravidade;
  titulo: string;
  descricao: string;
  tipo: 'respiracao' | 'postura' | 'hidratacao' | 'repouso' | 'urgencia' | 'observacao';
}

export interface SintomaSelecionadoResumo {
  sintoma_id: string;
  nome: string;
  area_vital: boolean;
  regiao_corporal?: RegiaoCorporalId;
  especialidade_id?: string;
}

export interface AvaliacaoSintomas {
  id: string;
  usuario_id: string;
  data_hora: string;
  sintomas_selecionados: SintomaSelecionadoResumo[];
  gravidade_geral: Gravidade;
  emergencia_acionada: boolean;
  observacoes?: string;
}
