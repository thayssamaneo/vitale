# Plataforma Web Vitale — Triagem Acessível de Sintomas e Apoio à Saúde

A **Plataforma Web Vitale** é uma aplicação web acessível, inclusiva e acolhedora voltada prioritariamente para o público idoso e seus cuidadores/familiares. O sistema permite gerenciar conta e contatos de emergência, sinalizar sintomas corporais com linguagem simples e clara, e receber recomendações imediatas de bem-estar com encaminhamento para as especialidades médicas adequadas.

---

## 🩺 Stack Tecnológica

* **Frontend:** [Next.js](https://nextjs.org/) (App Router), React 19, TypeScript e CSS moderno.
* **Estilização e Design System:** Tailwind CSS configurado com os tokens visuais exatos extraídos do **Stitch MCP** (Health Ecosystem Design System: paleta Teal clínico e Laranja de alerta, modo de alto contraste, superfícies quentes `#fff8f5`).
* **Backend & Autenticação:** [Firebase Authentication](https://firebase.google.com/docs/auth) (E-mail/Senha) e [Cloud Firestore](https://firebase.google.com/docs/firestore) estruturado a partir do MER clínico.
* **Segurança e Validação:** [Firebase Security Rules](firestore.rules) (conformidade com LGPD para proteção de dados sensíveis de saúde), validação de esquemas com [Zod](https://zod.dev/) e sanitização contra XSS.

---

## ♿ Diretrizes de Acessibilidade e UX Sênior (RNF-01)

Desenvolvido para mitigar a ansiedade gerontecnológica e barreiras cognitivas/sensoriais:
1. **WCAG 2.1 AA:** Relação de contraste rigorosa entre texto e plano de fundo (texto escuro `#1e1b19` sobre fundo claro `#fff8f5`, estados de erro com `#ba1a1a` e containers de destaque).
2. **Tipografia Acessível:**
   * Tamanho base mínimo de `18px` para textos corridos.
   * Ações e títulos em `20px+` a `42px`.
   * Indicador visual de foco `:focus-visible` com borda contrastante de `3px`.
3. **Áreas de Toque:**
   * Todos os botões, checkboxes e links interativos possuem dimensões mínimas de **`48x48px`** (a maioria `54px` a `56px`), com espaçamento generoso para evitar toques acidentais.
4. **Linguagem Humanizada:**
   * Rótulos descritivos sem jargões médicos difíceis.
   * Feedback inequívoco para cada ação (carregamento com animação e `role="status"`, alertas com `role="alert"` e `aria-live`).
   * Suporte a preferências de acessibilidade do sistema operacional (`prefers-reduced-motion`).

---

## 🗄️ Arquitetura de Dados (Cloud Firestore)

Estrutura NoSQL adaptada do Modelo Entidade-Relacionamento (MER):

1. **`users/{uid}`**
   * `nome`: string
   * `email`: string
   * `idade`: number (opcional)
   * `cpf`: string (opcional)
   * `cep`: string (opcional)
   * `data_cadastro`: timestamp
   * `ultima_atualizacao`: timestamp
   * `contatos_emergencia`: lista de `{ id, nome, telefone, parentesco, principal }`

2. **`especialidades/{id}`**
   * `id`: string (ex: `esp_cardiologia`, `esp_clinico_geral`)
   * `nome`: string
   * `descricao`: string explicativa em linguagem simples

3. **`sintomas/{id}`**
   * `id`: string (ex: `sin_aperto_peito`)
   * `especialidade_id`: string
   * `nome`: string
   * `descricao`: string amigável
   * `regiao_corporal`: `'cabeca' | 'olhos_ouvidos' | 'garganta' | 'peito' | 'estomago' | 'costas' | 'bracos' | 'pernas' | 'pes'`
   * `area_vital`: boolean (indica risco elevado e urgência)

4. **`recomendacoes/{id}`**
   * `id`: string
   * `sintoma_id`: string
   * `gravidade_alvo`: `'leve' | 'moderada' | 'grave'`
   * `titulo`: string
   * `descricao`: orientações práticas (respiração guiada, hidratação, postura)
   * `tipo`: `'respiracao' | 'postura' | 'hidratacao' | 'repouso' | 'urgencia' | 'observacao'`

5. **`avaliacoes_sintomas/{id}`**
   * `id`: string
   * `usuario_id`: string (`uid`)
   * `data_hora`: timestamp
   * `sintomas_selecionados`: lista de `{ sintoma_id, nome, area_vital, regiao_corporal, especialidade_id }`
   * `gravidade_geral`: `'leve' | 'moderada' | 'grave'`
   * `emergencia_acionada`: boolean
   * `observacoes`: string (opcional)

---

## 🗺️ Rotas da Aplicação

| Rota | Descrição | Proteção |
| :--- | :--- | :--- |
| `/` | Redirecionamento inteligente: envia para `/sintomas` se autenticado, ou `/login` se anônimo. | Pública |
| `/login` | Autenticação via Firebase Auth (E-mail/Senha) com layout bipartido acolhedor e link direto ao cadastro. | Pública |
| `/cadastro` | Registro com dados essenciais e obrigatoriedade de **Contato de Emergência Principal**. | Pública |
| `/sintomas` | Rota principal de triagem: seleção por região corporal (frente/costas) ou lista acessível, intensidade e envio. | Protegida (`ProtectedRoute`) |
| `/recomendacoes/[id]` | Resumo da triagem, especialidades indicadas, técnicas guiadas (cartão interativo de respiração) e **Alerta Crítico Web** com SAMU 192 e discagem/cópia do contato de emergência principal. | Protegida (`ProtectedRoute`) |
| `/perfil` | Edição dos dados cadastrais do paciente e CRUD completo dos contatos de emergência (adicionar, editar, definir principal e excluir com modal de confirmação). | Protegida (`ProtectedRoute`) |

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Node.js 18+ (recomendado Node 20 ou superior)
* npm, pnpm ou yarn

### 2. Variáveis de Ambiente
Copie ou crie o arquivo `.env.local` na raiz de `vitaleNext`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vitale-b5e74.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vitale-b5e74
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vitale-b5e74.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=882455064065
NEXT_PUBLIC_FIREBASE_APP_ID=seu-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-STJC5CSQ8P
```

### 3. Instalação e Execução
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Executar verificação de lint (sem erros/warnings)
npm run lint

# Executar build de produção
npm run build

# Executar o seed inicial do catálogo no Firestore
npm run seed
```

---

## 🔒 Regras de Segurança (`firestore.rules`)
O arquivo `firestore.rules` garante que:
* Dados pessoais e avaliações só podem ser lidos ou modificados pelo próprio titular autenticado (`request.auth.uid == userId`).
* O catálogo médico (`especialidades`, `sintomas`, `recomendacoes`) é estritamente **somente leitura** para usuários autenticados, prevenindo adulterações externas.
