'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  getFirebaseAuth,
  getFirebaseDb,
  isFirebaseConfigured,
} from '@/lib/firebase';
import { ContatoEmergencia, UsuarioVitale } from '@/types/vitale';

export interface DadosCadastroInput {
  nome: string;
  email: string;
  idade?: number;
  cpf?: string;
  cep?: string;
  senha: string;
  contatoEmergencia: {
    nome: string;
    telefone: string;
    parentesco: string;
  };
}

export interface DadosAtualizacaoPerfil {
  nome: string;
  idade?: number;
  cep?: string;
}

interface AuthContextValue {
  firebaseUser: User | null;
  usuario: UsuarioVitale | null;
  loading: boolean;
  firebaseReady: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (dados: DadosCadastroInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileData: (dados: DadosAtualizacaoPerfil) => Promise<void>;
  saveEmergencyContacts: (contatos: ContatoEmergencia[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Traduz códigos de erro do Firebase Auth para mensagens acolhedoras e claras em Português
export function traduzirErroFirebase(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha não conferem. Confira os dados digitados e tente novamente.';
    case 'auth/invalid-email':
      return 'O formato do e-mail parece incorreto. Verifique se digitou corretamente.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já possui uma conta na Vitale. Você pode entrar diretamente na tela de Login.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres para sua segurança.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar novamente.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet no momento. Verifique sua rede e tente outra vez.';
    default:
      return error instanceof Error && error.message
        ? error.message
        : 'Não foi possível concluir sua solicitação agora. Tente novamente em instantes.';
  }
}

function normalizeDateField(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<UsuarioVitale | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(isFirebaseConfigured));

  const loadUserDocument = useCallback(async (user: User): Promise<UsuarioVitale> => {
    const db = getFirebaseDb();
    const fallbackProfile: UsuarioVitale = {
      uid: user.uid,
      nome: user.displayName || 'Usuário Vitale',
      email: user.email || '',
      data_cadastro: new Date().toISOString(),
      contatos_emergencia: [],
    };

    if (!db) return fallbackProfile;

    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) {
        return fallbackProfile;
      }

      const data = snap.data();
      return {
        uid: user.uid,
        nome: (data.nome as string) || fallbackProfile.nome,
        email: (data.email as string) || fallbackProfile.email,
        idade: typeof data.idade === 'number' ? data.idade : undefined,
        cpf: typeof data.cpf === 'string' ? data.cpf : undefined,
        cep: typeof data.cep === 'string' ? data.cep : undefined,
        data_cadastro: normalizeDateField(data.data_cadastro),
        ultima_atualizacao: data.ultima_atualizacao
          ? normalizeDateField(data.ultima_atualizacao)
          : undefined,
        contatos_emergencia: Array.isArray(data.contatos_emergencia)
          ? (data.contatos_emergencia as ContatoEmergencia[])
          : [],
      };
    } catch {
      return fallbackProfile;
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const profile = await loadUserDocument(user);
        setUsuario(profile);
      } else {
        setUsuario(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserDocument]);

  const signIn = useCallback(async (email: string, senha: string) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error(
        'O Firebase ainda não foi configurado neste ambiente (.env.local).'
      );
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), senha);
      const profile = await loadUserDocument(cred.user);
      setFirebaseUser(cred.user);
      setUsuario(profile);
    } catch (error) {
      throw new Error(traduzirErroFirebase(error));
    }
  }, [loadUserDocument]);

  const signUp = useCallback(async (dados: DadosCadastroInput) => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    if (!auth || !db) {
      throw new Error(
        'O Firebase ainda não foi configurado neste ambiente (.env.local).'
      );
    }

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        dados.email.trim(),
        dados.senha
      );

      await updateProfile(cred.user, { displayName: dados.nome.trim() });

      const contatoPrincipal: ContatoEmergencia = {
        id: `contato_${Date.now()}`,
        nome: dados.contatoEmergencia.nome.trim(),
        telefone: dados.contatoEmergencia.telefone.trim(),
        parentesco: dados.contatoEmergencia.parentesco.trim(),
        principal: true,
      };

      const novoDocumento: Record<string, unknown> = {
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        data_cadastro: serverTimestamp(),
        ultima_atualizacao: serverTimestamp(),
        contatos_emergencia: [contatoPrincipal],
      };

      if (typeof dados.idade === 'number' && !Number.isNaN(dados.idade)) {
        novoDocumento.idade = dados.idade;
      }
      if (dados.cpf) {
        novoDocumento.cpf = dados.cpf;
      }
      if (dados.cep) {
        novoDocumento.cep = dados.cep;
      }

      await setDoc(doc(db, 'users', cred.user.uid), novoDocumento);

      const agora = new Date().toISOString();
      setFirebaseUser(cred.user);
      setUsuario({
        uid: cred.user.uid,
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        idade: dados.idade,
        cpf: dados.cpf,
        cep: dados.cep,
        data_cadastro: agora,
        ultima_atualizacao: agora,
        contatos_emergencia: [contatoPrincipal],
      });
    } catch (error) {
      throw new Error(traduzirErroFirebase(error));
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setUsuario(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return;
    const profile = await loadUserDocument(firebaseUser);
    setUsuario(profile);
  }, [firebaseUser, loadUserDocument]);

  const updateProfileData = useCallback(
    async (dados: DadosAtualizacaoPerfil) => {
      const db = getFirebaseDb();
      if (!firebaseUser || !db) {
        throw new Error('Sessão inválida. Entre novamente para atualizar seus dados.');
      }

      const payload: Record<string, unknown> = {
        nome: dados.nome.trim(),
        ultima_atualizacao: serverTimestamp(),
      };

      if (typeof dados.idade === 'number' && !Number.isNaN(dados.idade)) {
        payload.idade = dados.idade;
      }
      if (dados.cep !== undefined) {
        payload.cep = dados.cep;
      }

      await updateDoc(doc(db, 'users', firebaseUser.uid), payload);
      await updateProfile(firebaseUser, { displayName: dados.nome.trim() });

      setUsuario((prev) =>
        prev
          ? {
              ...prev,
              nome: dados.nome.trim(),
              idade: dados.idade ?? prev.idade,
              cep: dados.cep ?? prev.cep,
              ultima_atualizacao: new Date().toISOString(),
            }
          : prev
      );
    },
    [firebaseUser]
  );

  const saveEmergencyContacts = useCallback(
    async (contatos: ContatoEmergencia[]) => {
      const db = getFirebaseDb();
      if (!firebaseUser || !db) {
        throw new Error('Sessão inválida. Entre novamente para salvar contatos.');
      }

      // Garante que haja sempre um contato principal quando existir ao menos um contato
      const listaNormalizada =
        contatos.length > 0 && !contatos.some((c) => c.principal)
          ? contatos.map((c, index) => ({ ...c, principal: index === 0 }))
          : contatos;

      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        contatos_emergencia: listaNormalizada,
        ultima_atualizacao: serverTimestamp(),
      });

      setUsuario((prev) =>
        prev
          ? {
              ...prev,
              contatos_emergencia: listaNormalizada,
              ultima_atualizacao: new Date().toISOString(),
            }
          : prev
      );
    },
    [firebaseUser]
  );

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        usuario,
        loading,
        firebaseReady: isFirebaseConfigured,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updateProfileData,
        saveEmergencyContacts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return ctx;
}
