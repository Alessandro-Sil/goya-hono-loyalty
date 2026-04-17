# Goya Hono · Premium Cards Intelligence

> Plataforma interna de inteligência de cartões premium para o programa de fidelidade Goya Hono — Goya Travel / Biosfera Copastur.

---

## Visão geral

Aplicação web com acesso restrito por convite, autenticação dupla (Netlify Identity + MFA via e-mail) e painel de inteligência de cartões premium. Desenvolvida para uso interno das equipes Copastur e Goya Travel.

**Stack:**
- Frontend estático — HTML, CSS, JavaScript vanilla
- Autenticação — Netlify Identity (invite only)
- MFA — código de 6 dígitos via SendGrid
- Serverless — Netlify Functions (Node.js)
- Deploy — Netlify (plano gratuito)

---

## Estrutura do repositório

```
goya-hono-loyalty/
├── index.html                     # App principal — Premium Cards Intelligence
├── login.html                     # Tela de login com MFA
├── netlify.toml                   # Configuração de deploy, rotas e headers
├── .env.example                   # Variáveis de ambiente necessárias
└── netlify/
    └── functions/
        ├── send-mfa.js            # Gera e envia código MFA via SendGrid
        └── verify-mfa.js          # Valida o código MFA
```

---

## Pré-requisitos

| Serviço | Plano | Custo |
|---|---|---|
| [Netlify](https://netlify.com) | Starter | Gratuito |
| [Netlify Identity](https://docs.netlify.com/security/secure-access-to-sites/identity/) | Starter | Gratuito (até 1.000 usuários) |
| [SendGrid](https://sendgrid.com) | Free | Gratuito (até 100 e-mails/dia) |

---

## Deploy

### Opção A — Via GitHub (recomendado)

1. Faça fork ou clone deste repositório
2. No painel Netlify: **Add new site → Import an existing project**
3. Conecte sua conta GitHub e selecione este repositório
4. Configurações de build:
   - **Build command:** *(deixar vazio)*
   - **Publish directory:** `.`
5. Clique em **Deploy site**

A partir deste ponto, todo `git push` na branch `main` dispara um novo deploy automaticamente.

### Opção B — Deploy manual (ZIP)

1. Compacte a pasta em `.zip`
2. No painel Netlify: **Add new site → Deploy manually**
3. Arraste o `.zip` para a área de upload

---

## Configuração pós-deploy

### 1. Ativar Netlify Identity

No painel do site: **Site configuration → Identity → Enable Identity**

- **Registration:** selecione **Invite only**
- Desative provedores externos (apenas e-mail/senha)

### 2. Variáveis de ambiente

**Site configuration → Environment variables → Add variable:**

| Variável | Valor |
|---|---|
| `SENDGRID_API_KEY` | Chave da API SendGrid (começa com `SG.`) |
| `FROM_EMAIL` | E-mail remetente verificado no SendGrid |

Após adicionar: **Deploys → Trigger deploy → Deploy site**

### 3. Convidar usuários

**Identity → Invite users** — inserir e-mails corporativos.

Domínios autorizados: `@copastur.com.br` e `@goyatravel.com.br`

---

## Fluxo de acesso

```
Acessa a URL
     ↓
Login (e-mail + senha via Netlify Identity)
     ↓
Código MFA de 6 dígitos enviado por e-mail (válido 10 min)
     ↓
Usuário digita o código
     ↓
Acesso liberado ao Premium Cards Intelligence
```

---

## Gerenciamento de usuários

| Ação | Caminho no Netlify |
|---|---|
| Convidar usuário | Identity → Invite users |
| Bloquear acesso | Identity → [usuário] → Block user |
| Remover usuário | Identity → [usuário] → Delete user |
| Ver último acesso | Identity → lista de usuários |

---

## Segurança

- Acesso restrito a domínios corporativos autorizados
- Autenticação de dois fatores obrigatória (MFA por e-mail)
- Headers de segurança configurados (`X-Frame-Options`, `X-XSS-Protection`, `X-Content-Type-Options`)
- Cache desabilitado em todas as rotas (`no-store, no-cache`)
- Registro por convite — nenhum usuário pode se cadastrar sozinho

> ⚠️ **Nota:** o `codeStore` do MFA usa memória em processo. Para ambientes com alta concorrência, migrar para [Netlify Blobs](https://docs.netlify.com/blobs/overview/) ou Redis.

---

## Licença

Uso interno — Biosfera Copastur / Goya Travel. Não distribuir externamente.
