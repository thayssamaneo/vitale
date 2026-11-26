'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  cadastroSchema,
  formatCEP,
  formatCPF,
  formatTelefone,
} from '@/lib/validation';
import { VitaleHeader } from '@/components/VitaleHeader';
import { VitaleFooter } from '@/components/VitaleFooter';

type ErrosCadastro = Partial<
  Record<
    | 'nome'
    | 'email'
    | 'idade'
    | 'cpf'
    | 'cep'
    | 'senha'
    | 'contatoNome'
    | 'contatoTelefone'
    | 'contatoParentesco',
    string
  >
>;

// TelaCadastro: Registro completo no Firebase Auth + Firestore (com Contato de Emergência Principal obrigatório)
export default function CadastroPage() {
  const { firebaseUser, loading, firebaseReady, signUp } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [contatoNome, setContatoNome] = useState('');
  const [contatoTelefone, setContatoTelefone] = useState('');
  const [contatoParentesco, setContatoParentesco] = useState('');

  const [errosCampos, setErrosCampos] = useState<ErrosCadastro>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && firebaseUser && !sucesso && !enviando) {
      router.replace('/sintomas');
    }
  }, [loading, firebaseUser, sucesso, enviando, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroGeral(null);
    setErrosCampos({});

    const validacao = cadastroSchema.safeParse({
      nome,
      email,
      idade,
      cpf,
      cep,
      senha,
      contatoNome,
      contatoTelefone,
      contatoParentesco,
    });

    if (!validacao.success) {
      const f = validacao.error.flatten().fieldErrors;
      setErrosCampos({
        nome: f.nome?.[0],
        email: f.email?.[0],
        idade: f.idade?.[0],
        cpf: f.cpf?.[0],
        cep: f.cep?.[0],
        senha: f.senha?.[0],
        contatoNome: f.contatoNome?.[0],
        contatoTelefone: f.contatoTelefone?.[0],
        contatoParentesco: f.contatoParentesco?.[0],
      });
      setErroGeral('Confira os campos destacados em vermelho antes de concluir.');
      return;
    }

    setEnviando(true);
    try {
      const data = validacao.data;
      await signUp({
        nome: data.nome,
        email: data.email,
        idade: data.idade && data.idade.trim() !== '' ? Number(data.idade) : undefined,
        cpf: data.cpf && data.cpf.trim() !== '' ? data.cpf : undefined,
        cep: data.cep && data.cep.trim() !== '' ? data.cep : undefined,
        senha: data.senha,
        contatoEmergencia: {
          nome: data.contatoNome,
          telefone: data.contatoTelefone,
          parentesco: data.contatoParentesco,
        },
      });
      setSucesso(true);
      setTimeout(() => {
        router.replace('/sintomas');
      }, 1200);
    } catch (error) {
      setErroGeral(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar seu cadastro agora. Tente novamente.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <VitaleHeader variant="public" />

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-lg lg:py-space-xl">
          <div className="w-full max-w-6xl mx-auto rounded-2xl shadow-xl overflow-hidden bg-surface-container-lowest grid grid-cols-1 lg:grid-cols-12 min-h-[660px] border border-outline-variant/40">
            {/* Lado Esquerdo: Painel Acolhedor (Stitch) */}
            <section
              aria-label="Benefícios do cadastro Vitale"
              className="lg:col-span-5 bg-surface-container-low p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-fixed opacity-30 blur-3xl pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-tertiary-fixed opacity-20 blur-2xl pointer-events-none"
              />

              <div className="relative z-10 flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-fixed/50 w-fit">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[16px] font-semibold text-primary tracking-wide uppercase">
                    Cuidado &amp; Saúde
                  </span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-[32px] lg:text-[36px] leading-[42px] font-semibold text-on-surface tracking-tight">
                    Saúde integrada, humanizada e precisa.
                  </h2>
                  <p className="text-[18px] leading-[28px] text-on-surface-variant">
                    Na Vitale, conectamos você e seu cuidador ou familiar de confiança. Seu cadastro leva menos de 2 minutos e já deixa seu contato de emergência pronto caso você precise de apoio.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-8">
                <div className="p-5 rounded-xl bg-surface-container-lowest/90 shadow-sm border border-outline-variant/30 space-y-2">
                  <p className="text-[18px] font-semibold text-on-surface flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-primary text-[24px]"
                      aria-hidden="true"
                    >
                      verified_user
                    </span>
                    <span>Ambiente Seguro &amp; Ético</span>
                  </p>
                  <p className="text-[16px] leading-[26px] text-on-surface-variant">
                    Seus dados cadastrais são tratados com rigor e confidencialidade médica (LGPD).
                  </p>
                </div>
              </div>
            </section>

            {/* Lado Direito: Formulário de Cadastro */}
            <section
              aria-labelledby="titulo-cadastro"
              className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-8 lg:p-10 flex flex-col justify-center"
            >
              <div className="max-w-xl w-full mx-auto space-y-6">
                <div className="space-y-1">
                  <h1
                    id="titulo-cadastro"
                    className="text-[28px] sm:text-[32px] leading-[38px] font-bold text-on-surface tracking-tight"
                  >
                    Cadastro Vitale
                  </h1>
                  <p className="text-[18px] leading-[28px] text-on-surface-variant">
                    Preencha seus dados básicos e informe quem devemos avisar em uma emergência.
                  </p>
                </div>

                {!firebaseReady && (
                  <div
                    role="status"
                    className="p-4 rounded-xl bg-secondary-fixed/50 border border-secondary/30 text-on-secondary-fixed text-[16px]"
                  >
                    Configure as variáveis <code className="font-mono">NEXT_PUBLIC_FIREBASE_*</code>{' '}
                    em <code className="font-mono">.env.local</code> para salvar o cadastro no Firebase.
                  </div>
                )}

                {erroGeral && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="p-4 rounded-xl bg-error-container border border-error/30 text-on-error-container flex items-start gap-3"
                  >
                    <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5" aria-hidden="true">
                      error
                    </span>
                    <p className="text-[18px] leading-[26px] font-medium">{erroGeral}</p>
                  </div>
                )}

                {sucesso && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-5 rounded-xl bg-primary-fixed/40 border border-primary/40 text-on-surface space-y-1"
                  >
                    <div className="flex items-center gap-2 text-primary font-bold text-[18px]">
                      <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                        check_circle
                      </span>
                      <span>Cadastro recebido com sucesso!</span>
                    </div>
                    <p className="text-[16px] text-on-surface-variant">
                      Preparando seu ambiente de atendimento e levando você para a triagem...
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Bloco 1: Dados do Usuário */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label
                          htmlFor="cad-nome"
                          className="text-[16px] font-semibold text-on-surface"
                        >
                          Nome completo *
                        </label>
                        <input
                          id="cad-nome"
                          name="nome"
                          type="text"
                          autoComplete="name"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          placeholder="Seu nome completo"
                          aria-invalid={Boolean(errosCampos.nome)}
                          className="w-full min-h-[52px] px-4 bg-surface-container-low text-on-surface text-[18px] rounded-lg border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                        />
                        {errosCampos.nome && (
                          <p className="text-[16px] font-medium text-error">{errosCampos.nome}</p>
                        )}
                      </div>

                      <div className="sm:col-span-1 flex flex-col gap-1.5">
                        <label
                          htmlFor="cad-idade"
                          className="text-[16px] font-semibold text-on-surface"
                        >
                          Idade
                        </label>
                        <input
                          id="cad-idade"
                          name="idade"
                          type="number"
                          min={1}
                          max={125}
                          value={idade}
                          onChange={(e) => setIdade(e.target.value)}
                          placeholder="Ex: 68"
                          aria-invalid={Boolean(errosCampos.idade)}
                          className="w-full min-h-[52px] px-4 bg-surface-container-low text-on-surface text-[18px] rounded-lg border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                        />
                        {errosCampos.idade && (
                          <p className="text-[16px] font-medium text-error">{errosCampos.idade}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="cad-email"
                        className="text-[16px] font-semibold text-on-surface"
                      >
                        E-mail para entrar na Vitale *
                      </label>
                      <input
                        id="cad-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemplo@email.com"
                        aria-invalid={Boolean(errosCampos.email)}
                        className="w-full min-h-[52px] px-4 bg-surface-container-low text-on-surface text-[18px] rounded-lg border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                      />
                      {errosCampos.email && (
                        <p className="text-[16px] font-medium text-error">{errosCampos.email}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="cad-cpf"
                          className="text-[16px] font-semibold text-on-surface"
                        >
                          CPF (opcional)
                        </label>
                        <input
                          id="cad-cpf"
                          name="cpf"
                          type="text"
                          inputMode="numeric"
                          maxLength={14}
                          value={cpf}
                          onChange={(e) => setCpf(formatCPF(e.target.value))}
                          placeholder="000.000.000-00"
                          aria-invalid={Boolean(errosCampos.cpf)}
                          className="w-full min-h-[52px] px-4 bg-surface-container-low text-on-surface text-[18px] rounded-lg border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                        />
                        {errosCampos.cpf && (
                          <p className="text-[16px] font-medium text-error">{errosCampos.cpf}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="cad-cep"
                          className="text-[16px] font-semibold text-on-surface"
                        >
                          CEP (opcional)
                        </label>
                        <input
                          id="cad-cep"
                          name="cep"
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          value={cep}
                          onChange={(e) => setCep(formatCEP(e.target.value))}
                          placeholder="00000-000"
                          aria-invalid={Boolean(errosCampos.cep)}
                          className="w-full min-h-[52px] px-4 bg-surface-container-low text-on-surface text-[18px] rounded-lg border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                        />
                        {errosCampos.cep && (
                          <p className="text-[16px] font-medium text-error">{errosCampos.cep}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="cad-senha"
                        className="text-[16px] font-semibold text-on-surface"
                      >
                        Senha de acesso *
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="cad-senha"
                          name="senha"
                          type={mostrarSenha ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder="Mínimo de 6 letras ou números"
                          aria-invalid={Boolean(errosCampos.senha)}
                          className="w-full min-h-[52px] pl-4 pr-14 bg-surface-container-low text-on-surface text-[18px] rounded-lg border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha((prev) => !prev)}
                          aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                          className="absolute right-1.5 min-w-[48px] min-h-[48px] rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                            {mostrarSenha ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                      {errosCampos.senha && (
                        <p className="text-[16px] font-medium text-error">{errosCampos.senha}</p>
                      )}
                    </div>
                  </div>

                  {/* Bloco 2: Contato de Emergência Principal Obrigatório */}
                  <fieldset className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/50 border-l-4 border-l-secondary-container space-y-4">
                    <legend className="px-2 text-[18px] font-bold text-on-surface flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-secondary text-[22px]"
                        aria-hidden="true"
                      >
                        emergency
                      </span>
                      <span>Contato de Emergência Principal *</span>
                    </legend>
                    <p className="text-[16px] text-on-surface-variant leading-[24px]">
                      Pessoa de confiança que será mostrada em destaque caso algum sintoma precise de atenção urgente.
                    </p>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="cad-contato-nome"
                        className="text-[16px] font-semibold text-on-surface"
                      >
                        Nome do contato *
                      </label>
                      <input
                        id="cad-contato-nome"
                        name="contatoNome"
                        type="text"
                        value={contatoNome}
                        onChange={(e) => setContatoNome(e.target.value)}
                        placeholder="Ex: Maria Eduarda"
                        aria-invalid={Boolean(errosCampos.contatoNome)}
                        className="w-full min-h-[52px] px-4 bg-surface-container-lowest text-on-surface text-[18px] rounded-lg border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                      />
                      {errosCampos.contatoNome && (
                        <p className="text-[16px] font-medium text-error">
                          {errosCampos.contatoNome}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="cad-contato-tel"
                          className="text-[16px] font-semibold text-on-surface"
                        >
                          Telefone de emergência *
                        </label>
                        <input
                          id="cad-contato-tel"
                          name="contatoTelefone"
                          type="tel"
                          inputMode="tel"
                          maxLength={15}
                          value={contatoTelefone}
                          onChange={(e) => setContatoTelefone(formatTelefone(e.target.value))}
                          placeholder="(11) 98765-4321"
                          aria-invalid={Boolean(errosCampos.contatoTelefone)}
                          className="w-full min-h-[52px] px-4 bg-surface-container-lowest text-on-surface text-[18px] rounded-lg border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                        />
                        {errosCampos.contatoTelefone && (
                          <p className="text-[16px] font-medium text-error">
                            {errosCampos.contatoTelefone}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="cad-contato-parentesco"
                          className="text-[16px] font-semibold text-on-surface"
                        >
                          Parentesco do contato *
                        </label>
                        <div className="relative">
                          <select
                            id="cad-contato-parentesco"
                            name="contatoParentesco"
                            value={contatoParentesco}
                            onChange={(e) => setContatoParentesco(e.target.value)}
                            aria-invalid={Boolean(errosCampos.contatoParentesco)}
                            className="w-full min-h-[52px] px-4 pr-10 bg-surface-container-lowest text-on-surface text-[18px] rounded-lg border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Selecione o parentesco</option>
                            <option value="Filho(a)">Filho(a)</option>
                            <option value="Cônjuge / Companheiro(a)">
                              Cônjuge / Companheiro(a)
                            </option>
                            <option value="Cuidador(a)">Cuidador(a)</option>
                            <option value="Irmão(ã)">Irmão(ã)</option>
                            <option value="Pai / Mãe">Pai / Mãe</option>
                            <option value="Outro">Outro familiar ou amigo</option>
                          </select>
                          <span
                            className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[24px]"
                            aria-hidden="true"
                          >
                            arrow_drop_down
                          </span>
                        </div>
                        {errosCampos.contatoParentesco && (
                          <p className="text-[16px] font-medium text-error">
                            {errosCampos.contatoParentesco}
                          </p>
                        )}
                      </div>
                    </div>
                  </fieldset>

                  <button
                    type="submit"
                    disabled={enviando || sucesso}
                    className="group relative w-full min-h-[56px] rounded-xl bg-primary text-on-primary text-[20px] font-semibold flex items-center justify-center gap-3 shadow-md hover:bg-primary-container transition-all duration-200 cursor-pointer disabled:opacity-60"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-container rounded-l-xl"
                    />
                    <span>{enviando ? 'Criando sua conta...' : 'Finalizar Cadastro'}</span>
                    <span
                      className="material-symbols-outlined text-[24px] transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      arrow_forward
                    </span>
                  </button>
                </form>

                <div className="pt-4 border-t border-outline-variant/50 text-center">
                  <Link
                    href="/login"
                    className="w-full min-h-[52px] px-6 rounded-xl border-2 border-outline-variant text-on-surface hover:bg-surface-container-low text-[18px] font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                      arrow_back
                    </span>
                    <span>Já tenho cadastro • Voltar para Entrar</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <VitaleFooter />
    </div>
  );
}
