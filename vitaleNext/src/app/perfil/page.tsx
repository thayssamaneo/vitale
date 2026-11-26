'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { VitaleHeader } from '@/components/VitaleHeader';
import { VitaleFooter } from '@/components/VitaleFooter';
import { AccessibleModal } from '@/components/AccessibleModal';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserEvaluationHistory } from '@/lib/medicalService';
import {
  contatoEmergenciaSchema,
  formatCEP,
  formatTelefone,
  perfilDadosSchema,
} from '@/lib/validation';
import { AvaliacaoSintomas, ContatoEmergencia } from '@/types/vitale';

// TelaPerfil: Edição de dados pessoais e CRUD completo de Contatos de Emergência
export default function PerfilPage() {
  const { usuario, firebaseUser, updateProfileData, saveEmergencyContacts } =
    useAuth();

  // Estado dos dados pessoais
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [cep, setCep] = useState('');
  const [erroPerfil, setErroPerfil] = useState<string | null>(null);
  const [sucessoPerfil, setSucessoPerfil] = useState<string | null>(null);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  // Estado de formulário para adicionar ou editar contato de emergência
  const [formularioContatoAberto, setFormularioContatoAberto] = useState(false);
  const [editandoContatoId, setEditandoContatoId] = useState<string | null>(null);
  const [contatoNome, setContatoNome] = useState('');
  const [contatoTelefone, setContatoTelefone] = useState('');
  const [contatoParentesco, setContatoParentesco] = useState('');
  const [contatoPrincipal, setContatoPrincipal] = useState(false);
  const [erroContato, setErroContato] = useState<string | null>(null);
  const [sucessoContato, setSucessoContato] = useState<string | null>(null);
  const [salvandoContato, setSalvandoContato] = useState(false);

  // Modal de confirmação de exclusão
  const [contatoParaExcluir, setContatoParaExcluir] =
    useState<ContatoEmergencia | null>(null);
  const [excluindoContato, setExcluindoContato] = useState(false);

  // Histórico recente de triagens do usuário
  const [historico, setHistorico] = useState<AvaliacaoSintomas[]>([]);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setIdade(usuario.idade ? String(usuario.idade) : '');
      setCep(usuario.cep || '');
    }
  }, [usuario]);

  useEffect(() => {
    let ativo = true;
    if (!firebaseUser) return;
    fetchUserEvaluationHistory(firebaseUser.uid).then((lista) => {
      if (ativo) setHistorico(lista);
    });
    return () => {
      ativo = false;
    };
  }, [firebaseUser]);

  const contatos = usuario?.contatos_emergencia || [];

  async function handleSalvarDadosPessoais(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErroPerfil(null);
    setSucessoPerfil(null);

    const parsed = perfilDadosSchema.safeParse({ nome, idade, cep });
    if (!parsed.success) {
      setErroPerfil(
        parsed.error.issues[0]?.message || 'Confira os dados digitados.'
      );
      return;
    }

    setSalvandoPerfil(true);
    try {
      await updateProfileData({
        nome: parsed.data.nome,
        idade:
          parsed.data.idade && parsed.data.idade.trim() !== ''
            ? Number(parsed.data.idade)
            : undefined,
        cep: parsed.data.cep || '',
      });
      setSucessoPerfil('Seus dados pessoais foram atualizados com sucesso!');
    } catch (error) {
      setErroPerfil(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar suas alterações.'
      );
    } finally {
      setSalvandoPerfil(false);
    }
  }

  function abrirNovoContato() {
    setEditandoContatoId(null);
    setContatoNome('');
    setContatoTelefone('');
    setContatoParentesco('');
    setContatoPrincipal(contatos.length === 0);
    setErroContato(null);
    setSucessoContato(null);
    setFormularioContatoAberto(true);
  }

  function abrirEdicaoContato(contato: ContatoEmergencia) {
    setEditandoContatoId(contato.id);
    setContatoNome(contato.nome);
    setContatoTelefone(contato.telefone);
    setContatoParentesco(contato.parentesco);
    setContatoPrincipal(contato.principal);
    setErroContato(null);
    setSucessoContato(null);
    setFormularioContatoAberto(true);
  }

  function fecharFormularioContato() {
    setFormularioContatoAberto(false);
    setEditandoContatoId(null);
    setErroContato(null);
  }

  async function handleSalvarContato(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroContato(null);
    setSucessoContato(null);

    const parsed = contatoEmergenciaSchema.safeParse({
      nome: contatoNome,
      telefone: contatoTelefone,
      parentesco: contatoParentesco,
      principal: contatoPrincipal,
    });

    if (!parsed.success) {
      setErroContato(
        parsed.error.issues[0]?.message || 'Preencha todos os campos do contato.'
      );
      return;
    }

    setSalvandoContato(true);
    try {
      const novoItem: ContatoEmergencia = {
        id: editandoContatoId || `contato_${Date.now()}`,
        nome: parsed.data.nome,
        telefone: parsed.data.telefone,
        parentesco: parsed.data.parentesco,
        principal: parsed.data.principal || contatos.length === 0,
      };

      let novaLista: ContatoEmergencia[];
      if (editandoContatoId) {
        novaLista = contatos.map((c) =>
          c.id === editandoContatoId ? novoItem : c
        );
      } else {
        novaLista = [...contatos, novoItem];
      }

      if (novoItem.principal) {
        novaLista = novaLista.map((c) => ({
          ...c,
          principal: c.id === novoItem.id,
        }));
      }

      await saveEmergencyContacts(novaLista);
      setFormularioContatoAberto(false);
      setEditandoContatoId(null);
      setSucessoContato(
        editandoContatoId
          ? 'Contato atualizado com sucesso!'
          : 'Novo contato de emergência adicionado!'
      );
    } catch (error) {
      setErroContato(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o contato agora.'
      );
    } finally {
      setSalvandoContato(false);
    }
  }

  async function handleDefinirPrincipal(contatoId: string) {
    setErroContato(null);
    setSucessoContato(null);
    setSalvandoContato(true);
    try {
      const novaLista = contatos.map((c) => ({
        ...c,
        principal: c.id === contatoId,
      }));
      await saveEmergencyContacts(novaLista);
      setSucessoContato('Contato principal atualizado com sucesso!');
    } catch {
      setErroContato('Não foi possível alterar o contato principal.');
    } finally {
      setSalvandoContato(false);
    }
  }

  async function confirmarExclusaoContato() {
    if (!contatoParaExcluir) return;
    setExcluindoContato(true);
    setErroContato(null);
    setSucessoContato(null);

    try {
      const restante = contatos.filter((c) => c.id !== contatoParaExcluir.id);
      await saveEmergencyContacts(restante);
      setContatoParaExcluir(null);
      setSucessoContato('Contato removido da sua lista.');
    } catch {
      setErroContato('Não foi possível excluir este contato agora.');
    } finally {
      setExcluindoContato(false);
    }
  }

  const iniciais = (usuario?.nome || 'V')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-surface">
        <VitaleHeader variant="authenticated" />

        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto w-full px-margin-mobile lg:px-margin py-space-lg lg:py-space-xl space-y-8">
            {/* Cabeçalho da Página (Stitch Configurações do Usuário) */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 bg-surface-container-high px-3.5 py-1.5 rounded-full text-primary">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    manage_accounts
                  </span>
                  <span className="text-[16px] font-semibold uppercase tracking-wide">
                    Meu Perfil &amp; Conta
                  </span>
                </div>
                <h1 className="text-[32px] md:text-[42px] leading-[40px] md:leading-[50px] font-bold text-on-surface tracking-tight">
                  Configurações do Usuário
                </h1>
                <p className="text-[18px] leading-[28px] text-on-surface-variant">
                  Atualize seu nome, dados de cadastro e mantenha seus contatos de emergência sempre atualizados.
                </p>
              </div>

              <Link
                href="/sintomas"
                className="min-h-[52px] px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-[18px] font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-colors self-start md:self-auto"
              >
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                  arrow_back
                </span>
                <span>Voltar para Triagem</span>
              </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Coluna Esquerda (4 cols): Identidade + Histórico Recente */}
              <aside className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/40 flex flex-col items-center text-center relative overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 w-32 h-32 bg-primary-fixed/40 rounded-full blur-2xl pointer-events-none"
                  />
                  <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center text-[32px] font-bold mb-4 shadow-sm">
                    {iniciais}
                  </div>
                  <h2 className="text-[22px] font-bold text-on-surface">
                    {usuario?.nome || 'Paciente Vitale'}
                  </h2>
                  <p className="text-[16px] text-on-surface-variant mb-4 break-all">
                    {usuario?.email}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-[16px] font-semibold">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      verified_user
                    </span>
                    <span>Conta Protegida (LGPD)</span>
                  </div>
                </div>

                {/* Histórico Rápido de Triagens */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/40 space-y-4">
                  <h3 className="text-[20px] font-bold text-on-surface flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-primary text-[24px]"
                      aria-hidden="true"
                    >
                      history
                    </span>
                    <span>Últimas Triagens</span>
                  </h3>

                  {historico.length === 0 ? (
                    <p className="text-[16px] text-on-surface-variant">
                      Você ainda não registrou nenhuma triagem nesta conta.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {historico.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={`/recomendacoes/${item.id}`}
                            className="block p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/30"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[16px] font-bold text-on-surface capitalize">
                                Gravidade {item.gravidade_geral}
                              </span>
                              <span className="text-[16px] text-primary font-semibold">
                                Ver
                              </span>
                            </div>
                            <p className="text-[16px] text-on-surface-variant truncate">
                              {item.sintomas_selecionados.map((s) => s.nome).join(', ')}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </aside>

              {/* Coluna Direita (8 cols): Dados Pessoais + CRUD Contatos de Emergência */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                {/* Seção 1: Dados Pessoais */}
                <section
                  aria-labelledby="titulo-dados-pessoais"
                  className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/40 space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[18px]">
                      1
                    </div>
                    <div>
                      <h2
                        id="titulo-dados-pessoais"
                        className="text-[22px] font-bold text-on-surface"
                      >
                        Dados Pessoais
                      </h2>
                      <p className="text-[16px] text-on-surface-variant">
                        Mantenha seu nome e dados básicos atualizados.
                      </p>
                    </div>
                  </div>

                  {erroPerfil && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl bg-error-container text-on-error-container text-[16px] font-medium"
                    >
                      {erroPerfil}
                    </div>
                  )}

                  {sucessoPerfil && (
                    <div
                      role="status"
                      className="p-4 rounded-xl bg-primary-fixed/40 text-on-primary-fixed-variant text-[16px] font-semibold flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                        check_circle
                      </span>
                      <span>{sucessoPerfil}</span>
                    </div>
                  )}

                  <form onSubmit={handleSalvarDadosPessoais} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-8 flex flex-col gap-1.5">
                        <label
                          htmlFor="perfil-nome"
                          className="text-[16px] font-semibold text-on-surface"
                        >
                          Nome Completo *
                        </label>
                        <input
                          id="perfil-nome"
                          type="text"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="w-full min-h-[52px] px-4 bg-surface-container-low text-on-surface text-[18px] rounded-xl border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>

                      <div className="md:col-span-4 flex flex-col gap-1.5">
                        <label
                          htmlFor="perfil-idade"
                          className="text-[16px] font-semibold text-on-surface"
                        >
                          Idade
                        </label>
                        <input
                          id="perfil-idade"
                          type="number"
                          min={1}
                          max={125}
                          value={idade}
                          onChange={(e) => setIdade(e.target.value)}
                          placeholder="Ex: 68"
                          className="w-full min-h-[52px] px-4 bg-surface-container-low text-on-surface text-[18px] rounded-xl border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>

                      <div className="md:col-span-7 flex flex-col gap-1.5">
                        <label
                          htmlFor="perfil-email"
                          className="text-[16px] font-semibold text-on-surface flex items-center justify-between"
                        >
                          <span>E-mail cadastrado</span>
                          <span className="text-primary font-medium text-[16px]">
                            Protegido
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            id="perfil-email"
                            type="email"
                            readOnly
                            value={usuario?.email || ''}
                            className="w-full min-h-[52px] pl-4 pr-11 bg-surface-container text-on-surface-variant text-[18px] rounded-xl border border-outline-variant/60 cursor-not-allowed"
                          />
                          <span
                            className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline text-[22px]"
                            aria-hidden="true"
                          >
                            lock
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-5 flex flex-col gap-1.5">
                        <label
                          htmlFor="perfil-cep"
                          className="text-[16px] font-semibold text-on-surface"
                        >
                          CEP
                        </label>
                        <input
                          id="perfil-cep"
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          value={cep}
                          onChange={(e) => setCep(formatCEP(e.target.value))}
                          placeholder="00000-000"
                          className="w-full min-h-[52px] px-4 bg-surface-container-low text-on-surface text-[18px] rounded-xl border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={salvandoPerfil}
                        className="w-full sm:w-auto min-h-[52px] px-8 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-[18px] font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                          check
                        </span>
                        <span>
                          {salvandoPerfil ? 'Salvando...' : 'Salvar dados pessoais'}
                        </span>
                      </button>
                    </div>
                  </form>
                </section>

                {/* Seção 2: CRUD Completo de Contatos de Emergência (Stitch Coral Accent) */}
                <section
                  aria-labelledby="titulo-contatos-emergencia"
                  className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/40 relative overflow-hidden space-y-6"
                >
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-0 bottom-0 w-2 bg-secondary-container"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-[18px]">
                        2
                      </div>
                      <div>
                        <h2
                          id="titulo-contatos-emergencia"
                          className="text-[22px] font-bold text-on-surface"
                        >
                          Contatos de Emergência
                        </h2>
                        <p className="text-[16px] text-on-surface-variant">
                          Pessoas de confiança que aparecem em destaque em caso de urgência.
                        </p>
                      </div>
                    </div>

                    {!formularioContatoAberto && (
                      <button
                        type="button"
                        onClick={abrirNovoContato}
                        className="min-h-[52px] px-5 rounded-xl bg-secondary-container hover:bg-secondary text-on-primary font-semibold text-[16px] inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
                      >
                        <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                          person_add
                        </span>
                        <span>Adicionar contato</span>
                      </button>
                    )}
                  </div>

                  {erroContato && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl bg-error-container text-on-error-container text-[16px] font-medium"
                    >
                      {erroContato}
                    </div>
                  )}

                  {sucessoContato && (
                    <div
                      role="status"
                      className="p-4 rounded-xl bg-primary-fixed/40 text-on-primary-fixed-variant text-[16px] font-semibold flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                        check_circle
                      </span>
                      <span>{sucessoContato}</span>
                    </div>
                  )}

                  {/* Formulário para Adicionar ou Editar Contato */}
                  {formularioContatoAberto && (
                    <form
                      onSubmit={handleSalvarContato}
                      noValidate
                      className="p-5 rounded-xl bg-surface-container-low border-2 border-primary/40 space-y-4"
                    >
                      <h3 className="text-[20px] font-bold text-on-surface">
                        {editandoContatoId
                          ? 'Editar contato de emergência'
                          : 'Novo contato de emergência'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <label
                            htmlFor="contato-form-nome"
                            className="text-[16px] font-semibold text-on-surface"
                          >
                            Nome do contato *
                          </label>
                          <input
                            id="contato-form-nome"
                            type="text"
                            value={contatoNome}
                            onChange={(e) => setContatoNome(e.target.value)}
                            placeholder="Ex: Maria Eduarda"
                            className="w-full min-h-[52px] px-4 bg-surface-container-lowest text-on-surface text-[18px] rounded-xl border border-outline-variant focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="contato-form-tel"
                            className="text-[16px] font-semibold text-on-surface"
                          >
                            Telefone com DDD *
                          </label>
                          <input
                            id="contato-form-tel"
                            type="tel"
                            inputMode="tel"
                            maxLength={15}
                            value={contatoTelefone}
                            onChange={(e) =>
                              setContatoTelefone(formatTelefone(e.target.value))
                            }
                            placeholder="(11) 98765-4321"
                            className="w-full min-h-[52px] px-4 bg-surface-container-lowest text-on-surface text-[18px] rounded-xl border border-outline-variant focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="contato-form-parentesco"
                            className="text-[16px] font-semibold text-on-surface"
                          >
                            Parentesco / Vínculo *
                          </label>
                          <select
                            id="contato-form-parentesco"
                            value={contatoParentesco}
                            onChange={(e) => setContatoParentesco(e.target.value)}
                            className="w-full min-h-[52px] px-4 bg-surface-container-lowest text-on-surface text-[18px] rounded-xl border border-outline-variant focus:border-primary focus:outline-none cursor-pointer"
                          >
                            <option value="">Selecione uma opção</option>
                            <option value="Filho(a)">Filho(a)</option>
                            <option value="Cônjuge / Companheiro(a)">
                              Cônjuge / Companheiro(a)
                            </option>
                            <option value="Cuidador(a)">Cuidador(a)</option>
                            <option value="Irmão(ã)">Irmão(ã)</option>
                            <option value="Pai / Mãe">Pai / Mãe</option>
                            <option value="Outro">Outro familiar ou amigo</option>
                          </select>
                        </div>
                      </div>

                      <label className="flex items-center gap-3 min-h-[48px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contatoPrincipal}
                          onChange={(e) => setContatoPrincipal(e.target.checked)}
                          className="w-6 h-6 accent-primary rounded cursor-pointer"
                        />
                        <span className="text-[18px] font-medium text-on-surface">
                          Definir como contato principal de emergência
                        </span>
                      </label>

                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={fecharFormularioContato}
                          className="min-h-[48px] px-5 rounded-xl border-2 border-outline-variant text-on-surface font-semibold text-[16px] hover:bg-surface-container cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={salvandoContato}
                          className="min-h-[48px] px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-[18px] cursor-pointer disabled:opacity-60"
                        >
                          {salvandoContato ? 'Salvando...' : 'Salvar contato'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Lista de Contatos de Emergência */}
                  {contatos.length === 0 ? (
                    <div className="p-6 rounded-xl bg-surface-container-low text-center space-y-2">
                      <p className="text-[18px] font-semibold text-on-surface">
                        Nenhum contato de emergência cadastrado.
                      </p>
                      <p className="text-[16px] text-on-surface-variant">
                        Adicione pelo menos um familiar ou cuidador para situações de urgência.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {contatos.map((contato) => (
                        <li
                          key={contato.id}
                          className={`p-5 rounded-xl border-2 transition-all flex flex-col gap-4 ${
                            contato.principal
                              ? 'bg-secondary-fixed/25 border-secondary-container/60'
                              : 'bg-surface-container-low/70 border-outline-variant/50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[20px] font-bold text-on-surface">
                                  {contato.nome}
                                </span>
                                {contato.principal && (
                                  <span className="px-3 py-0.5 rounded-full bg-secondary-container text-on-primary text-[16px] font-bold">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <p className="text-[18px] text-on-surface-variant">
                                {contato.parentesco} •{' '}
                                <strong className="text-on-surface">
                                  {contato.telefone}
                                </strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-outline-variant/30">
                            {!contato.principal && (
                              <button
                                type="button"
                                disabled={salvandoContato}
                                onClick={() => handleDefinirPrincipal(contato.id)}
                                className="min-h-[48px] px-4 rounded-xl border-2 border-secondary text-secondary hover:bg-secondary-fixed/40 font-semibold text-[16px] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <span
                                  className="material-symbols-outlined text-[20px]"
                                  aria-hidden="true"
                                >
                                  star
                                </span>
                                <span>Definir como Principal</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => abrirEdicaoContato(contato)}
                              className="min-h-[48px] px-4 rounded-xl border-2 border-primary text-primary hover:bg-primary-fixed/30 font-semibold text-[16px] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <span
                                className="material-symbols-outlined text-[20px]"
                                aria-hidden="true"
                              >
                                edit
                              </span>
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setContatoParaExcluir(contato)}
                              className="min-h-[48px] px-4 rounded-xl border-2 border-error/50 text-error hover:bg-error-container/50 font-semibold text-[16px] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <span
                                className="material-symbols-outlined text-[20px]"
                                aria-hidden="true"
                              >
                                delete
                              </span>
                              <span>Excluir</span>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="flex justify-center sm:justify-start pb-6">
                  <Link
                    href="/sintomas"
                    className="min-h-[54px] px-8 rounded-xl border-2 border-primary bg-surface-container-lowest text-primary hover:bg-primary-fixed/30 text-[18px] font-semibold inline-flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                      arrow_back
                    </span>
                    <span>Voltar para Triagem</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <VitaleFooter />

        {/* Modal de Confirmação de Exclusão */}
        <AccessibleModal
          aberto={Boolean(contatoParaExcluir)}
          titulo="Remover contato de emergência?"
          mensagem={
            contatoParaExcluir
              ? `Você tem certeza que deseja remover "${contatoParaExcluir.nome}" da sua lista de contatos de emergência?`
              : ''
          }
          textoConfirmar="Sim, excluir contato"
          textoCancelar="Não, manter contato"
          carregando={excluindoContato}
          onConfirmar={confirmarExclusaoContato}
          onCancelar={() => setContatoParaExcluir(null)}
        />
      </div>
    </ProtectedRoute>
  );
}
