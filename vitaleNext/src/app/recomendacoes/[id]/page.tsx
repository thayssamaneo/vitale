'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { VitaleHeader } from '@/components/VitaleHeader';
import { VitaleFooter } from '@/components/VitaleFooter';
import { BreathingExerciseCard } from '@/components/BreathingExerciseCard';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchEvaluationById,
  fetchMedicalCatalog,
} from '@/lib/medicalService';
import {
  ESPECIALIDADES_SEED,
  RECOMENDACOES_SEED,
  RECOMENDACAO_PADRAO_POSTURA,
  SINTOMAS_SEED,
} from '@/lib/seedData';
import {
  AvaliacaoSintomas,
  Especialidade,
  Gravidade,
  Recomendacao,
  Sintoma,
} from '@/types/vitale';

const LABEL_GRAVIDADE: Record<Gravidade, { texto: string; classe: string }> = {
  leve: {
    texto: 'Intensidade Leve',
    classe: 'bg-primary-fixed text-on-primary-fixed-variant',
  },
  moderada: {
    texto: 'Intensidade Moderada',
    classe: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  },
  grave: {
    texto: 'Intensidade Grave',
    classe: 'bg-error text-on-error',
  },
};

// TelaRecomendacoes: Exibe resumo, especialidades indicadas, técnicas de amenização e Alerta Crítico
export default function RecomendacoesPage() {
  const params = useParams<{ id: string }>();
  const avaliacaoId = typeof params?.id === 'string' ? params.id : '';
  const { firebaseUser, usuario } = useAuth();

  const [avaliacao, setAvaliacao] = useState<AvaliacaoSintomas | null>(null);
  const [especialidades, setEspecialidades] =
    useState<Especialidade[]>(ESPECIALIDADES_SEED);
  const [sintomasCatalogo, setSintomasCatalogo] =
    useState<Sintoma[]>(SINTOMAS_SEED);
  const [recomendacoesCatalogo, setRecomendacoesCatalogo] =
    useState<Recomendacao[]>(RECOMENDACOES_SEED);
  const [carregando, setCarregando] = useState(true);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [copiadoContato, setCopiadoContato] = useState(false);
  const [copiadoSamu, setCopiadoSamu] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!firebaseUser || !avaliacaoId) return;
      setCarregando(true);
      setErroBusca(null);

      try {
        const [evalDoc, catalog] = await Promise.all([
          fetchEvaluationById(avaliacaoId, firebaseUser.uid),
          fetchMedicalCatalog(),
        ]);

        if (!ativo) return;

        setEspecialidades(catalog.especialidades);
        setSintomasCatalogo(catalog.sintomas);
        setRecomendacoesCatalogo(catalog.recomendacoes);

        if (!evalDoc) {
          setErroBusca(
            'Não encontramos esta triagem na sua conta. Você pode iniciar uma nova avaliação abaixo.'
          );
        } else {
          setAvaliacao(evalDoc);
        }
      } catch {
        if (ativo) {
          setErroBusca('Não foi possível carregar suas recomendações agora.');
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [firebaseUser, avaliacaoId]);

  const contatoPrincipal = useMemo(() => {
    const lista = usuario?.contatos_emergencia || [];
    return lista.find((c) => c.principal) || lista[0] || null;
  }, [usuario]);

  // Resolve especialidades únicas com base nos sintomas selecionados
  const especialidadesIndicadas = useMemo(() => {
    if (!avaliacao) return [];
    const espIds = new Set<string>();

    for (const item of avaliacao.sintomas_selecionados) {
      if (item.especialidade_id) {
        espIds.add(item.especialidade_id);
      } else {
        const sin = sintomasCatalogo.find((s) => s.id === item.sintoma_id);
        if (sin) espIds.add(sin.especialidade_id);
      }
    }

    const encontradas = especialidades.filter((e) => espIds.has(e.id));
    if (encontradas.length === 0) {
      return especialidades.slice(0, 1);
    }
    return encontradas;
  }, [avaliacao, sintomasCatalogo, especialidades]);

  // Filtra recomendações pelos sintomas escolhidos e gravidade relatada
  const recomendacoesFiltradas = useMemo(() => {
    if (!avaliacao) return [];
    const idsSelecionados = new Set(
      avaliacao.sintomas_selecionados.map((s) => s.sintoma_id)
    );

    const exatas = recomendacoesCatalogo.filter(
      (rec) =>
        idsSelecionados.has(rec.sintoma_id) &&
        rec.gravidade_alvo === avaliacao.gravidade_geral
    );

    const porSintoma =
      exatas.length > 0
        ? exatas
        : recomendacoesCatalogo.filter((rec) =>
            idsSelecionados.has(rec.sintoma_id)
          );

    if (porSintoma.length === 0) {
      return [RECOMENDACAO_PADRAO_POSTURA];
    }
    return porSintoma;
  }, [avaliacao, recomendacoesCatalogo]);

  async function copiarNumero(numero: string, tipo: 'contato' | 'samu') {
    try {
      await navigator.clipboard.writeText(numero);
      if (tipo === 'contato') {
        setCopiadoContato(true);
        setTimeout(() => setCopiadoContato(false), 3000);
      } else {
        setCopiadoSamu(true);
        setTimeout(() => setCopiadoSamu(false), 3000);
      }
    } catch {
      // Fallback silencioso caso o navegador bloqueie clipboard
    }
  }

  const ehCritico = Boolean(
    avaliacao &&
      (avaliacao.emergencia_acionada ||
        avaliacao.gravidade_geral === 'grave' ||
        avaliacao.sintomas_selecionados.some((s) => s.area_vital))
  );

  const dataFormatada = avaliacao
    ? new Date(avaliacao.data_hora).toLocaleString('pt-BR', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : '';

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-surface">
        <VitaleHeader variant="authenticated" />

        <main className="flex-1 w-full">
          <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-lg lg:py-space-xl space-y-8">
            {carregando ? (
              <div
                role="status"
                aria-live="polite"
                className="bg-surface-container-lowest rounded-2xl p-10 text-center shadow-sm border border-outline-variant/40 flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full border-4 border-primary-fixed border-t-primary animate-spin" />
                <p className="text-[20px] font-semibold text-on-surface">
                  Organizando suas orientações de cuidado...
                </p>
              </div>
            ) : erroBusca || !avaliacao ? (
              <div className="bg-surface-container-lowest rounded-2xl p-8 text-center shadow-sm border border-outline-variant/40 max-w-2xl mx-auto space-y-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-error-container text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-[30px]" aria-hidden="true">
                    search_off
                  </span>
                </div>
                <h1 className="text-[26px] font-bold text-on-surface">
                  Triagem não localizada
                </h1>
                <p className="text-[18px] text-on-surface-variant">
                  {erroBusca}
                </p>
                <Link
                  href="/sintomas"
                  className="min-h-[54px] px-8 rounded-xl bg-primary text-on-primary text-[18px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                    add_circle
                  </span>
                  <span>Iniciar Nova Triagem</span>
                </Link>
              </div>
            ) : (
              <>
                {/* Cabeçalho de Contexto (Stitch) */}
                <header className="flex flex-col gap-3 items-center text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      verified_user
                    </span>
                    <span className="text-[16px] font-semibold uppercase tracking-wide">
                      Cuidado &amp; Apoio Imediato
                    </span>
                  </div>
                  <h1 className="text-[32px] md:text-[42px] leading-[40px] md:leading-[50px] font-bold text-on-surface">
                    Recomendações e Apoio
                  </h1>
                  <p className="text-[18px] md:text-[20px] leading-[30px] text-on-surface-variant max-w-3xl">
                    Veja abaixo o resumo da sua avaliação, os médicos indicados e orientações simples para o seu bem-estar.
                  </p>
                </header>

                {/* ALERTA CRÍTICO NA WEB (Alto Contraste Vermelho/Laranja quando área vital ou grave) */}
                {ehCritico && (
                  <section
                    role="alert"
                    aria-live="assertive"
                    aria-labelledby="titulo-alerta-critico"
                    className="w-full rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden border-2 border-error bg-error-container/45"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute top-0 left-0 w-3 h-full bg-error"
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pl-3">
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-start gap-4">
                          <span className="w-14 h-14 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
                            <span
                              className="material-symbols-outlined text-[32px]"
                              aria-hidden="true"
                            >
                              emergency
                            </span>
                          </span>
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-error text-on-error text-[16px] font-bold uppercase tracking-wide">
                              Atenção Médica Urgente
                            </span>
                            <h2
                              id="titulo-alerta-critico"
                              className="text-[24px] md:text-[30px] leading-[34px] font-bold text-on-error-container"
                            >
                              Procure atendimento de urgência (SAMU 192) e avise seu contato agora
                            </h2>
                          </div>
                        </div>

                        <p className="text-[18px] leading-[28px] text-on-surface font-medium">
                          Algum sintoma marcado exige avaliação médica imediata. Não espere os sintomas piorarem e evite sair sozinho(a).
                        </p>

                        <div className="flex flex-wrap gap-3 pt-1">
                          <a
                            href="tel:192"
                            className="min-h-[54px] px-6 rounded-xl bg-error text-on-error hover:bg-on-error-container text-[20px] font-bold inline-flex items-center justify-center gap-2 shadow-md transition-colors"
                          >
                            <span
                              className="material-symbols-outlined text-[24px]"
                              aria-hidden="true"
                            >
                              call
                            </span>
                            <span>Ligar para SAMU 192</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => copiarNumero('192', 'samu')}
                            className="min-h-[54px] px-5 rounded-xl bg-surface-container-lowest border-2 border-error text-on-error-container font-semibold text-[18px] hover:bg-surface-container-low inline-flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <span
                              className="material-symbols-outlined text-[22px]"
                              aria-hidden="true"
                            >
                              {copiadoSamu ? 'check' : 'content_copy'}
                            </span>
                            <span>{copiadoSamu ? '192 copiado!' : 'Copiar 192'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Destaque do Contato de Emergência Principal (Stitch) */}
                      <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 border-2 border-secondary-container shadow-md space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[16px] font-bold uppercase tracking-wide text-secondary">
                            Contato de Emergência Principal
                          </span>
                          <span className="material-symbols-outlined text-secondary text-[24px]" aria-hidden="true">
                            contact_phone
                          </span>
                        </div>

                        {contatoPrincipal ? (
                          <>
                            <div className="space-y-1">
                              <p className="text-[24px] font-bold text-on-surface">
                                {contatoPrincipal.nome}
                              </p>
                              <p className="inline-block px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[16px] font-semibold">
                                {contatoPrincipal.parentesco}
                              </p>
                            </div>

                            <p className="text-[28px] sm:text-[32px] font-bold text-secondary tracking-tight select-all">
                              {contatoPrincipal.telefone}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <a
                                href={`tel:${contatoPrincipal.telefone.replace(/\D/g, '')}`}
                                className="flex-1 min-h-[52px] px-4 rounded-xl bg-secondary-container text-on-primary hover:bg-secondary font-bold text-[18px] inline-flex items-center justify-center gap-2 transition-colors"
                              >
                                <span
                                  className="material-symbols-outlined text-[22px]"
                                  aria-hidden="true"
                                >
                                  phone_in_talk
                                </span>
                                <span>Ligar agora</span>
                              </a>

                              <button
                                type="button"
                                onClick={() =>
                                  copiarNumero(contatoPrincipal.telefone, 'contato')
                                }
                                className="flex-1 min-h-[52px] px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant font-semibold text-[16px] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                              >
                                <span
                                  className="material-symbols-outlined text-[20px]"
                                  aria-hidden="true"
                                >
                                  {copiadoContato ? 'check' : 'content_copy'}
                                </span>
                                <span>
                                  {copiadoContato ? 'Copiado!' : 'Copiar número'}
                                </span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-[18px] text-on-surface-variant">
                              Você ainda não possui um contato de emergência cadastrado.
                            </p>
                            <Link
                              href="/perfil"
                              className="min-h-[48px] px-4 rounded-xl bg-primary text-on-primary font-semibold text-[16px] inline-flex items-center gap-2"
                            >
                              <span>Cadastrar contato no Perfil</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Resumo da Avaliação Realizada */}
                <section
                  aria-labelledby="titulo-resumo-avaliacao"
                  className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/40 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
                    <div>
                      <h2
                        id="titulo-resumo-avaliacao"
                        className="text-[24px] font-bold text-on-surface"
                      >
                        Resumo da sua avaliação
                      </h2>
                      <p className="text-[16px] text-on-surface-variant">
                        Realizada em {dataFormatada}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-[16px] font-bold w-fit ${
                        LABEL_GRAVIDADE[avaliacao.gravidade_geral].classe
                      }`}
                    >
                      {LABEL_GRAVIDADE[avaliacao.gravidade_geral].texto}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[18px] font-semibold text-on-surface">
                      Sintomas relatados:
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {avaliacao.sintomas_selecionados.map((s) => (
                        <span
                          key={s.sintoma_id}
                          className={`px-4 py-2 rounded-xl text-[16px] font-semibold inline-flex items-center gap-2 ${
                            s.area_vital
                              ? 'bg-secondary-fixed text-on-secondary-fixed border border-secondary/30'
                              : 'bg-surface-container-low text-on-surface border border-outline-variant/50'
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-[20px]"
                            aria-hidden="true"
                          >
                            {s.area_vital ? 'priority_high' : 'check_circle'}
                          </span>
                          <span>{s.nome}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {avaliacao.observacoes && (
                    <div className="p-4 rounded-xl bg-surface-container-low space-y-1">
                      <span className="text-[16px] font-semibold text-on-surface">
                        Suas observações:
                      </span>
                      <p className="text-[18px] text-on-surface-variant">
                        {avaliacao.observacoes}
                      </p>
                    </div>
                  )}
                </section>

                {/* Especialidades Médicas Indicadas */}
                <section
                  aria-labelledby="titulo-especialidades"
                  className="space-y-4"
                >
                  <div>
                    <h2
                      id="titulo-especialidades"
                      className="text-[24px] md:text-[28px] font-bold text-on-surface"
                    >
                      Especialidades médicas indicadas
                    </h2>
                    <p className="text-[18px] text-on-surface-variant">
                      Com base nos sintomas marcados, estes são os profissionais mais indicados para avaliar você:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {especialidadesIndicadas.map((esp) => (
                      <article
                        key={esp.id}
                        className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/40 flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary-fixed/60 text-primary flex items-center justify-center shrink-0">
                            <span
                              className="material-symbols-outlined text-[26px]"
                              aria-hidden="true"
                            >
                              stethoscope
                            </span>
                          </div>
                          <h3 className="text-[20px] font-bold text-on-surface">
                            {esp.nome}
                          </h3>
                        </div>
                        <p className="text-[18px] leading-[28px] text-on-surface-variant">
                          {esp.descricao}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>

                {/* Técnicas de Amenização (Respiração Guiada + Recomendações Filtradas) */}
                <section
                  aria-labelledby="titulo-amenizacao"
                  className="space-y-5"
                >
                  <div>
                    <h2
                      id="titulo-amenizacao"
                      className="text-[24px] md:text-[28px] font-bold text-on-surface"
                    >
                      Enquanto você aguarda • Técnicas de Amenização
                    </h2>
                    <p className="text-[18px] text-on-surface-variant">
                      Orientações simples para trazer mais conforto e tranquilidade ao seu corpo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BreathingExerciseCard />

                    {recomendacoesFiltradas.map((rec) => (
                      <article
                        key={rec.id}
                        className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/40 flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                              <span
                                className="material-symbols-outlined text-[26px]"
                                aria-hidden="true"
                              >
                                {rec.tipo === 'hidratacao'
                                  ? 'water_drop'
                                  : rec.tipo === 'urgencia'
                                    ? 'emergency_home'
                                    : rec.tipo === 'repouso'
                                      ? 'bedtime'
                                      : 'chair'}
                              </span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[16px] font-semibold capitalize">
                              {rec.tipo}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-[20px] leading-[28px] font-bold text-on-surface">
                              {rec.titulo}
                            </h3>
                            <p className="text-[18px] leading-[28px] text-on-surface-variant">
                              {rec.descricao}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-outline-variant/30 flex items-center gap-2 text-on-surface-variant">
                          <span
                            className="material-symbols-outlined text-primary text-[20px]"
                            aria-hidden="true"
                          >
                            check_circle
                          </span>
                          <span className="text-[16px]">
                            Evite esforços bruscos ao se levantar
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                {/* Cartão de Apoio (para casos não críticos, mantém o contato visível com calma) */}
                {!ehCritico && contatoPrincipal && (
                  <section
                    aria-label="Contato de apoio cadastrado"
                    className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                        <span
                          className="material-symbols-outlined text-[26px]"
                          aria-hidden="true"
                        >
                          favorite
                        </span>
                      </span>
                      <div>
                        <p className="text-[18px] font-bold text-on-surface">
                          Seu contato de apoio: {contatoPrincipal.nome} ({contatoPrincipal.parentesco})
                        </p>
                        <p className="text-[16px] text-on-surface-variant">
                          Telefone: <strong>{contatoPrincipal.telefone}</strong> • Se os sintomas piorarem, ligue imediatamente.
                        </p>
                      </div>
                    </div>

                    <a
                      href={`tel:${contatoPrincipal.telefone.replace(/\D/g, '')}`}
                      className="min-h-[48px] px-5 rounded-xl border-2 border-primary text-primary hover:bg-primary-fixed/30 font-semibold text-[16px] inline-flex items-center gap-2 transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                        call
                      </span>
                      <span>Ligar para apoio</span>
                    </a>
                  </section>
                )}

                {/* Botões Finais de Navegação */}
                <div className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/sintomas"
                    className="w-full sm:w-auto min-h-[56px] px-8 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-[20px] font-semibold shadow-md inline-flex items-center justify-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                      refresh
                    </span>
                    <span>Iniciar Nova Triagem</span>
                  </Link>

                  <Link
                    href="/perfil"
                    className="w-full sm:w-auto min-h-[56px] px-6 rounded-xl border-2 border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-[18px] font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                      manage_accounts
                    </span>
                    <span>Gerenciar Contatos no Perfil</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>

        <VitaleFooter />
      </div>
    </ProtectedRoute>
  );
}
