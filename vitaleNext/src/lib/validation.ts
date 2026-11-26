import { z } from 'zod';

// Remove caracteres potencialmente perigosos para prevenir injeções e XSS básico em textos livres
export function sanitizeText(value: string): string {
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

// Máscara acessível para telefone brasileiro (fixo ou celular)
export function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Máscara para CPF (000.000.000-00)
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// Máscara para CEP (00000-000)
export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

// Esquema de validação da tela de Login
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Digite o seu e-mail.')
    .email('Digite um e-mail válido (exemplo: nome@email.com).'),
  senha: z
    .string()
    .min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

// Esquema de validação do Contato de Emergência
export const contatoEmergenciaSchema = z.object({
  nome: z
    .string()
    .transform(sanitizeText)
    .refine((v) => v.length >= 2, 'Informe o nome do contato de emergência.'),
  telefone: z
    .string()
    .trim()
    .refine(
      (v) => v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 11,
      'Informe um telefone válido com DDD (ex: (11) 98765-4321).'
    ),
  parentesco: z
    .string()
    .transform(sanitizeText)
    .refine((v) => v.length >= 2, 'Escolha o grau de parentesco ou vínculo.'),
  principal: z.boolean().default(false),
});

// Esquema de validação da tela de Cadastro (inclui contato de emergência principal obrigatório)
export const cadastroSchema = z.object({
  nome: z
    .string()
    .transform(sanitizeText)
    .refine((v) => v.length >= 3, 'Digite seu nome completo (pelo menos 3 letras).'),
  email: z
    .string()
    .trim()
    .min(1, 'Digite o seu e-mail.')
    .email('Digite um e-mail válido (exemplo: nome@email.com).'),
  idade: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.trim() === '' || (/^\d+$/.test(v.trim()) && Number(v) >= 1 && Number(v) <= 125),
      'Informe uma idade válida entre 1 e 125 anos.'
    ),
  cpf: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.trim() === '' || v.replace(/\D/g, '').length === 11,
      'O CPF deve conter 11 números.'
    ),
  cep: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.trim() === '' || v.replace(/\D/g, '').length === 8,
      'O CEP deve conter 8 números.'
    ),
  senha: z
    .string()
    .min(6, 'Crie uma senha com pelo menos 6 caracteres.'),
  contatoNome: z
    .string()
    .transform(sanitizeText)
    .refine((v) => v.length >= 2, 'Informe o nome do contato de emergência principal.'),
  contatoTelefone: z
    .string()
    .trim()
    .refine(
      (v) => v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 11,
      'Informe o telefone do contato com DDD (ex: (11) 98765-4321).'
    ),
  contatoParentesco: z
    .string()
    .transform(sanitizeText)
    .refine((v) => v.length >= 2, 'Selecione o parentesco do contato de emergência.'),
});

// Esquema de edição dos dados pessoais no Perfil
export const perfilDadosSchema = z.object({
  nome: z
    .string()
    .transform(sanitizeText)
    .refine((v) => v.length >= 3, 'O nome precisa ter pelo menos 3 letras.'),
  idade: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.trim() === '' || (/^\d+$/.test(v.trim()) && Number(v) >= 1 && Number(v) <= 125),
      'Informe uma idade válida entre 1 e 125 anos.'
    ),
  cep: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.trim() === '' || v.replace(/\D/g, '').length === 8,
      'O CEP deve conter 8 números.'
    ),
});

// Esquema de envio da triagem de sintomas
export const avaliacaoSintomasSchema = z.object({
  sintomasIds: z
    .array(z.string().min(1))
    .min(1, 'Marque pelo menos um sintoma que você está sentindo antes de continuar.'),
  gravidade: z.enum(['leve', 'moderada', 'grave'], {
    message: 'Selecione a intensidade do desconforto (Leve, Moderada ou Grave).',
  }),
  observacoes: z
    .string()
    .max(500, 'Escreva no máximo 500 caracteres nas observações.')
    .optional()
    .transform((v) => (v ? sanitizeText(v) : '')),
});
