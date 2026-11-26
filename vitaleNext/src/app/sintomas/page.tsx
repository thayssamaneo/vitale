'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { VitaleHeader } from '@/components/VitaleHeader';
import { VitaleFooter } from '@/components/VitaleFooter';
import { AnatomicalMap, RegiaoIcon } from '@/components/AnatomicalMap';
import { useAuth } from '@/contexts/AuthContext';
import {
  createSymptomEvaluation,
  fetchMedicalCatalog,
} from '@/lib/medicalService';
import { REGIOES_CORPORAIS, SINTOMAS_SEED } from '@/lib/seedData';
import { avaliacaoSintomasSchema } from '@/lib/validation';
import { Gravidade, RegiaoCorporalId, Sintoma } from '@/types/vitale';

const OPCOES_GRAVIDADE: Array<{
  valor: Gravidade;
  titulo: string;
  descricao: string;
  icone: string;
}> = [
  {
    valor: 'leve',
    titulo: 'Leve',
    descricao: 'Incômodo pequeno. Consigo realizar minhas atividades normalmente.',
    icone: 'sentiment_satisfied',
  },
  {
    valor: 'moderada',
    titulo: 'Moderada',
    descricao: 'Desconforto forte o bastante para atrapalhar o meu descanso ou dia.',
    icone: 'sentiment_neutral',
  },
  {
    valor: 'grave',
    titulo: 'Grave',
    descricao: 'Dor intensa, falta de ar ou mal-estar forte que exige ajuda rápida.',
    icone: 'emergency',
  },
];

// TelaSintomas: Rota protegida principal para triagem acessível de sintomas
export default function SintomasPage() {
  const { firebaseUser } = useAuth();
  const router = useRouter();

  const [modoVisao, setModoVisao] = useState<'frente' | 'costas'>('frente');
  const [catalogoSintomas, setCatalogoSintomas] = useState<Sintoma[]>(SINTOMAS_SEED);
  const [regioesSelecionadas, setRegioesSelecionadas] = useState<Set<RegiaoCorporalId>>(
    new Set()
  );
  const [sintomasSelecionadosIds, setSintomasSelecionadosIds] = useState<Set<string>>(
    new Set()
  );
  const [gravidade, setGravidade] = useState<Gravidade | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    fetchMedicalCatalog().then(({ sintomas }) => {
      if (ativo && sintomas.length > 0) {
        setCatalogoSintomas(sintomas);
      }
    });
    return () => {
      ativo = false;
    };
  }, []);

  // Alterna seleção de uma região corporal e limpa os sintomas dela se for desmarcada
  function toggleRegiao(regiao: RegiaoCorporalId) {
    setErroValidacao(null);
    setRegioesSelecionadas((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(regiao)) {
        proximo.delete(regiao);
        setSintomasSelecionadosIds((prevSint) => {
          const nextSint = new Set(prevSint);
          catalogoSintomas
            .filter((s) => s.regiao_corporal === regiao)
            .forEach((s) => nextSint.delete(s.id));
          return nextSint;
        });
      } else {
        proximo.add(regiao);
      }
      return proximo;
    });
  }

  function toggleSintoma(sintomaId: string) {
    setErroValidacao(null);
    setSintomasSelecionadosIds((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(sintomaId)) {
        proximo.delete(sintomaId);
      } else {
        proximo.add(sintomaId);
      }
      return proximo;
    });
  }

  function limparSelecoes() {
    setRegioesSelecionadas(new Set());
    setSintomasSelecionadosIds(new Set());
    setGravidade(null);
    setObservacoes('');
    setErroValidacao(null);
  }

  // Filtra sintomas das regiões escolhidas mantendo ordem intuitiva
  const sintomasDasRegioesSelecionadas = useMemo(() => {
    if (regioesSelecionadas.size === 0) return [];
    return catalogoSintomas.filter((s) =>
      regioesSelecionadas.has(s.regiao_corporal)
    );
  }, [catalogoSintomas, regioesSelecionadas]);

  const sintomasMarcados = useMemo(
    () => catalogoSintomas.filter((s) => sintomasSelecionadosIds.has(s.id)),
    [catalogoSintomas, sintomasSelecionadosIds]
  );

  const temAreaVital = sintomasMarcados.some((s) => s.area_vital);

  async function handleConcluirTriagem() {
    setErroValidacao(null);

    const parsed = avaliacaoSintomasSchema.safeParse({
      sintomasIds: Array.from(sintomasSelecionadosIds),
      gravidade: gravidade ?? undefined,
      observacoes,
    });

    if (!parsed.success) {
      const issues = parsed.error.issues;
      setErroValidacao(
        issues[0]?.message ||
          'Selecione ao menos um sintoma e informe a intensidade antes de continuar.'
      );
      return;
    }

    if (!firebaseUser) {
      setErroValidacao('Sua sessão expirou. Entre novamente para concluir a triagem.');
      return;
    }

    setEnviando(true);
    try {
      const avaliacaoId = await createSymptomEvaluation({
        usuarioId: firebaseUser.uid,
        sintomas: sintomasMarcados,
        gravidade: parsed.data.gravidade,
        observacoes: parsed.data.observacoes,
      });
      router.push(`/recomendacoes/${avaliacaoId}`);
    } catch (error) {
      setErroValidacao(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar sua triagem agora. Tente novamente em instantes.'
      );
      setEnviando(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-surface-container-low">
        <VitaleHeader variant="authenticated" />

        <main className="flex-1 w-full">
          <div className="max-w-[1280px] w-full mx-auto px-margin-mobile md:px-margin py-space-lg md:py-space-xl flex flex-col gap-space-lg">
            {/* Cabeçalho da Triagem + Alternador Frente/Costas */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-2 max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant text-[16px] font-semibold w-fit">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    healing
                  </span>
                  <span>Passo 1 de 2 • Sinalizar Sintomas</span>
                </span>
                <h1 className="text-[28px] md:text-[36px] leading-[36px] md:leading-[44px] font-bold text-on-surface tracking-tight">
                  Onde você sente dor ou desconforto?
                </h1>
                <p className="text-[18px] leading-[28px] text-on-surface-variant">
                  Toque nas partes do corpo no desenho ou nos cartões ao lado para escolher uma ou mais áreas.
                </p>
              </div>

              <div
                role="group"
                aria-label="Lado do corpo no desenho"
                className="flex items-center gap-2 bg-surface-container-lowest p-1.5 rounded-xl shadow-sm border border-outline-variant/40 self-start md:self-auto"
              >
                <button
                  type="button"
                  onClick={() => setModoVisao('frente')}
                  aria-pressed={modoVisao === 'frente'}
                  className={`min-h-[48px] px-4 rounded-lg text-[16px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    modoVisao === 'frente'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    accessibility_new
                  </span>
                  <span>Frente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModoVisao('costas')}
                  aria-pressed={modoVisao === 'costas'}
                  className={`min-h-[48px] px-4 rounded-lg text-[16px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    modoVisao === 'costas'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    person
                  </span>
                  <span>Costas</span>
                </button>
              </div>
            </header>

            {/* Grade Principal: Mapa Anatômico (5 cols) + Lista de Regiões (7 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5">
                <AnatomicalMap
                  modoVisao={modoVisao}
                  regioesSelecionadas={regioesSelecionadas}
                  onToggleRegiao={toggleRegiao}
                />
              </div>

              <section
                aria-label="Lista de regiões do corpo"
                className="lg:col-span-7 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between pb-1 px-1">
                  <h2 className="text-[22px] font-semibold text-on-surface">
                    Lista de regiões do corpo
                  </h2>
                  {regioesSelecionadas.size > 0 && (
                    <button
                      type="button"
                      onClick={limparSelecoes}
                      className="min-h-[48px] px-3 text-[16px] font-semibold text-primary hover:bg-primary-fixed/30 rounded-lg transition-colors cursor-pointer"
                    >
                      Limpar seleção
                    </button>
                  )}
                </div>

                {REGIOES_CORPORAIS.map((regiao) => {
                  const selecionada = regioesSelecionadas.has(regiao.id);
                  return (
                    <button
                      key={regiao.id}
                      type="button"
                      role="checkbox"
                      aria-checked={selecionada}
                      onClick={() => toggleRegiao(regiao.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-4 min-h-[78px] cursor-pointer ${
                        selecionada
                          ? 'bg-primary-container/10 border-primary shadow-md'
                          : 'bg-surface-container-lowest border-outline-variant/40 shadow-xs hover:shadow-md hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            selecionada
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-low text-primary'
                          }`}
                        >
                          <RegiaoIcon regiao={regiao.id} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-[20px] font-semibold ${
                              selecionada ? 'text-primary' : 'text-on-surface'
                            }`}
                          >
                            {regiao.titulo}
                          </span>
                          <span className="text-[16px] leading-[24px] text-on-surface-variant">
                            {regiao.resumo}
                          </span>
                        </div>
                      </div>

                      <span
                        aria-hidden="true"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          selecionada
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high text-transparent border border-outline-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px] font-bold">
                          check
                        </span>
                      </span>
                    </button>
                  );
                })}
              </section>
            </div>

            {/* Passo 2: Sintomas específicos das áreas selecionadas */}
            <section
              aria-labelledby="titulo-sintomas-especificos"
              className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/40 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2
                    id="titulo-sintomas-especificos"
                    className="text-[24px] leading-[32px] font-bold text-on-surface"
                  >
                    1. Marque o que você está sentindo
                  </h2>
                  <p className="text-[18px] text-on-surface-variant">
                    {regioesSelecionadas.size === 0
                      ? 'Escolha primeiro uma ou mais regiões do corpo acima para ver os sintomas.'
                      : 'Toque nos sintomas abaixo que descrevem o seu desconforto neste momento.'}
                  </p>
                </div>
                {sintomasMarcados.length > 0 && (
                  <span className="px-4 py-2 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[16px] font-bold w-fit">
                    {sintomasMarcados.length}{' '}
                    {sintomasMarcados.length === 1 ? 'sintoma marcado' : 'sintomas marcados'}
                  </span>
                )}
              </div>

              {sintomasDasRegioesSelecionadas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sintomasDasRegioesSelecionadas.map((sintoma) => {
                    const marcado = sintomasSelecionadosIds.has(sintoma.id);
                    return (
                      <button
                        key={sintoma.id}
                        type="button"
                        role="checkbox"
                        aria-checked={marcado}
                        onClick={() => toggleSintoma(sintoma.id)}
                        className={`p-5 rounded-xl border-2 text-left transition-all flex items-start justify-between gap-4 min-h-[84px] cursor-pointer ${
                          marcado
                            ? 'bg-primary-container/10 border-primary shadow-sm'
                            : 'bg-surface-container-low/60 border-outline-variant/60 hover:border-primary/60'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[18px] font-bold text-on-surface">
                              {sintoma.nome}
                            </span>
                            {sintoma.area_vital && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[16px] font-semibold">
                                <span
                                  className="material-symbols-outlined text-[18px]"
                                  aria-hidden="true"
                                >
                                  priority_high
                                </span>
                                Atenção prioritária
                              </span>
                            )}
                          </div>
                          <p className="text-[16px] leading-[24px] text-on-surface-variant">
                            {sintoma.descricao}
                          </p>
                        </div>

                        <span
                          aria-hidden="true"
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            marcado
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-lowest border-2 border-outline text-transparent'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[22px] font-bold">
                            check
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {temAreaVital && (
                <div
                  role="status"
                  className="p-4 rounded-xl bg-secondary-fixed/50 border border-secondary/40 text-on-secondary-fixed flex items-start gap-3"
                >
                  <span
                    className="material-symbols-outlined text-secondary text-[26px] shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    warning
                  </span>
                  <p className="text-[18px] leading-[26px] font-medium">
                    Você marcou um sintoma de atenção prioritária. Ao concluir, mostraremos as orientações de urgência e o telefone do seu contato de apoio.
                  </p>
                </div>
              )}
            </section>

            {/* Passo 3: Intensidade / Gravidade + Observações */}
            <section
              aria-labelledby="titulo-gravidade"
              className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/40 space-y-6"
            >
              <div>
                <h2
                  id="titulo-gravidade"
                  className="text-[24px] leading-[32px] font-bold text-on-surface"
                >
                  2. Qual é a intensidade do que você sente?
                </h2>
                <p className="text-[18px] text-on-surface-variant">
                  Escolha a opção que melhor representa como você está agora.
                </p>
              </div>

              <div
                role="radiogroup"
                aria-labelledby="titulo-gravidade"
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {OPCOES_GRAVIDADE.map((opcao) => {
                  const selecionada = gravidade === opcao.valor;
                  const ehGrave = opcao.valor === 'grave';
                  return (
                    <button
                      key={opcao.valor}
                      type="button"
                      role="radio"
                      aria-checked={selecionada}
                      onClick={() => {
                        setGravidade(opcao.valor);
                        setErroValidacao(null);
                      }}
                      className={`p-5 rounded-xl border-2 text-left transition-all flex flex-col gap-2 min-h-[120px] cursor-pointer ${
                        selecionada
                          ? ehGrave
                            ? 'bg-secondary-fixed/50 border-secondary-container shadow-md'
                            : 'bg-primary-container/10 border-primary shadow-md'
                          : 'bg-surface-container-low/60 border-outline-variant/60 hover:border-primary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[20px] font-bold flex items-center gap-2 ${
                            selecionada && ehGrave
                              ? 'text-secondary'
                              : selecionada
                                ? 'text-primary'
                                : 'text-on-surface'
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-[26px]"
                            aria-hidden="true"
                          >
                            {opcao.icone}
                          </span>
                          <span>{opcao.titulo}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                            selecionada
                              ? ehGrave
                                ? 'border-secondary bg-secondary text-on-secondary'
                                : 'border-primary bg-primary text-on-primary'
                              : 'border-outline bg-surface-container-lowest text-transparent'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </span>
                      </div>
                      <p className="text-[16px] leading-[24px] text-on-surface-variant">
                        {opcao.descricao}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="obs-triagem"
                  className="text-[18px] font-semibold text-on-surface"
                >
                  Quer contar mais algum detalhe? (Opcional)
                </label>
                <textarea
                  id="obs-triagem"
                  rows={3}
                  maxLength={500}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Exemplo: Começou hoje pela manhã após levantar da cama."
                  className="w-full min-h-[96px] p-4 bg-surface-container-low text-on-surface text-[18px] rounded-xl border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                />
              </div>
            </section>

            {/* Banner de Acolhimento (Stitch) */}
            <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed-variant">
                  <span className="material-symbols-outlined text-[32px]" aria-hidden="true">
                    health_and_safety
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[20px] font-semibold text-on-surface">
                    Cuidado integral e seguro
                  </span>
                  <p className="text-[16px] leading-[26px] text-on-surface-variant max-w-2xl">
                    Essas informações servem para orientar seu bem-estar inicial e indicar o médico adequado.
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <span className="block text-[16px] text-on-surface-variant">
                  Resumo atual:
                </span>
                <span className="text-[20px] font-bold text-primary">
                  {sintomasMarcados.length}{' '}
                  {sintomasMarcados.length === 1 ? 'sintoma' : 'sintomas'}
                  {gravidade ? ` • ${gravidade}` : ''}
                </span>
              </div>
            </div>

            {erroValidacao && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-5 rounded-xl bg-error-container border border-error/40 text-on-error-container flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-[26px] shrink-0" aria-hidden="true">
                  error
                </span>
                <p className="text-[18px] leading-[26px] font-semibold">{erroValidacao}</p>
              </div>
            )}

            {/* Botão Principal Prominente >= 60px (Stitch) */}
            <div className="w-full pb-8 flex flex-col items-center">
              <button
                type="button"
                disabled={enviando}
                onClick={handleConcluirTriagem}
                className="w-full md:max-w-2xl min-h-[60px] px-8 bg-primary hover:bg-primary-container text-on-primary text-[20px] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                <span>
                  {enviando
                    ? 'Preparando suas recomendações...'
                    : 'Concluir e ver recomendações'}
                </span>
                <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </main>

        <VitaleFooter />
      </div>
    </ProtectedRoute>
  );
}
