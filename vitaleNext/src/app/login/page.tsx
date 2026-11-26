'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema } from '@/lib/validation';
import { VitaleHeader } from '@/components/VitaleHeader';
import { VitaleFooter } from '@/components/VitaleFooter';

// TelaLogin: Autenticação acessível via E-mail e Senha (Layout bipartido Stitch)
export default function LoginPage() {
  const { firebaseUser, loading, firebaseReady, signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [errosCampos, setErrosCampos] = useState<{ email?: string; senha?: string }>({});
  const [enviando, setEnviando] = useState(false);

  // Redireciona usuários já autenticados para a tela principal de sintomas
  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace('/sintomas');
    }
  }, [loading, firebaseUser, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroGeral(null);
    setErrosCampos({});

    const resultado = loginSchema.safeParse({ email, senha });
    if (!resultado.success) {
      const fieldErrors = resultado.error.flatten().fieldErrors;
      setErrosCampos({
        email: fieldErrors.email?.[0],
        senha: fieldErrors.senha?.[0],
      });
      return;
    }

    setEnviando(true);
    try {
      await signIn(resultado.data.email, resultado.data.senha);
      router.replace('/sintomas');
    } catch (error) {
      setErroGeral(
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar. Confira seu e-mail e senha.'
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
          <div className="w-full max-w-6xl mx-auto rounded-2xl shadow-xl overflow-hidden bg-surface-container-lowest grid grid-cols-1 lg:grid-cols-12 min-h-[620px] border border-outline-variant/40">
            {/* Painel Esquerdo: Acolhimento e Segurança (Stitch Layout Bipartido) */}
            <section
              aria-label="Apresentação da Plataforma Vitale"
              className="lg:col-span-5 bg-surface-container-low p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-fixed opacity-30 blur-3xl pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-tertiary-fixed opacity-25 blur-2xl pointer-events-none"
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
                    Saúde integrada, humanizada e simples para você.
                  </h2>
                  <p className="text-[18px] leading-[28px] text-on-surface-variant">
                    Na Vitale, você informa o que está sentindo em poucos cliques e recebe orientações claras de bem-estar, indicação médica e apoio rápido do seu familiar de confiança.
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
                    Seus dados de saúde e contatos de emergência são protegidos com sigilo e respeito.
                  </p>
                </div>
              </div>
            </section>

            {/* Painel Direito: Formulário de Login */}
            <section
              aria-labelledby="titulo-login"
              className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-8 lg:p-10 flex flex-col justify-center"
            >
              <div className="max-w-xl w-full mx-auto space-y-6">
                <div className="space-y-2">
                  <h1
                    id="titulo-login"
                    className="text-[28px] sm:text-[32px] leading-[38px] font-bold text-on-surface tracking-tight"
                  >
                    Entrar na sua conta
                  </h1>
                  <p className="text-[18px] leading-[28px] text-on-surface-variant">
                    Informe seu e-mail e senha para começar a triagem de sintomas.
                  </p>
                </div>

                {!firebaseReady && (
                  <div
                    role="status"
                    className="p-4 rounded-xl bg-secondary-fixed/50 border border-secondary/30 text-on-secondary-fixed text-[16px] leading-[24px]"
                  >
                    <strong>Configuração pendente:</strong> defina as variáveis{' '}
                    <code className="font-mono">NEXT_PUBLIC_FIREBASE_*</code> em{' '}
                    <code className="font-mono">.env.local</code> para ativar o login no Firebase.
                  </div>
                )}

                {erroGeral && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="p-4 rounded-xl bg-error-container border border-error/30 text-on-error-container flex items-start gap-3"
                  >
                    <span
                      className="material-symbols-outlined text-[24px] shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      error
                    </span>
                    <p className="text-[18px] leading-[26px] font-medium">{erroGeral}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="login-email"
                      className="text-[18px] font-semibold text-on-surface"
                    >
                      E-mail
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@email.com"
                      aria-invalid={Boolean(errosCampos.email)}
                      aria-describedby={errosCampos.email ? 'erro-login-email' : undefined}
                      className="w-full min-h-[54px] px-4 bg-surface-container-low text-on-surface text-[18px] rounded-lg border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
                    />
                    {errosCampos.email && (
                      <p
                        id="erro-login-email"
                        className="text-[16px] font-medium text-error flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                          info
                        </span>
                        <span>{errosCampos.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="login-senha"
                      className="text-[18px] font-semibold text-on-surface"
                    >
                      Senha
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="login-senha"
                        name="senha"
                        type={mostrarSenha ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Digite sua senha"
                        aria-invalid={Boolean(errosCampos.senha)}
                        aria-describedby={errosCampos.senha ? 'erro-login-senha' : undefined}
                        className="w-full min-h-[54px] pl-4 pr-14 bg-surface-container-low text-on-surface text-[18px] rounded-lg border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline"
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
                      <p
                        id="erro-login-senha"
                        className="text-[16px] font-medium text-error flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                          info
                        </span>
                        <span>{errosCampos.senha}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="group relative w-full min-h-[56px] rounded-xl bg-primary text-on-primary text-[20px] font-semibold flex items-center justify-center gap-3 shadow-md hover:bg-primary-container transition-all duration-200 cursor-pointer disabled:opacity-60"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-container rounded-l-xl"
                    />
                    <span>{enviando ? 'Entrando na sua conta...' : 'Entrar'}</span>
                    <span
                      className="material-symbols-outlined text-[24px] transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      arrow_forward
                    </span>
                  </button>
                </form>

                {/* Área evidente para direcionar ao Cadastro */}
                <div className="pt-4 border-t border-outline-variant/50 space-y-3">
                  <p className="text-[18px] text-on-surface-variant text-center font-medium">
                    Primeira vez por aqui?
                  </p>
                  <Link
                    href="/cadastro"
                    className="w-full min-h-[54px] px-6 rounded-xl border-2 border-primary bg-surface-container-lowest text-primary hover:bg-primary-fixed/30 text-[20px] font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                      person_add
                    </span>
                    <span>Criar minha conta agora</span>
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
