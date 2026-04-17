# Goya Hono · Premium Cards Intelligence
## Guia de Publicação e Configuração

---

## Passo 1 — Criar conta no Netlify (gratuito)

1. Acesse **netlify.com** e clique em **Sign up**
2. Use sua conta Google ou GitHub
3. No painel, clique em **Add new site → Deploy manually**

---

## Passo 2 — Publicar o site

1. Compacte esta pasta inteira em um arquivo `.zip`
2. Arraste o `.zip` para a área de upload do Netlify
3. Aguarde ~30 segundos — seu site estará no ar com URL automática
4. Você pode renomear a URL em: **Site configuration → Change site name**
   - Sugestão: `goya-hono-loyalty` → fica `goya-hono-loyalty.netlify.app`

---

## Passo 3 — Ativar autenticação (Netlify Identity)

No painel do seu site no Netlify:

1. Vá em **Site configuration → Identity → Enable Identity**
2. Em **Registration preferences**, selecione **Invite only**
   - Isso garante que apenas quem você convidar pode criar conta
3. Em **External providers**, você pode deixar desativado (só e-mail/senha)
4. Em **Emails**, personalize os textos se quiser

---

## Passo 4 — Convidar os usuários (até 10)

Para cada pessoa do time:

1. Vá em **Identity → Invite users**
2. Digite o e-mail corporativo (ex: `alesssandro@copastur.com.br`)
3. O Netlify envia automaticamente um e-mail de convite
4. A pessoa clica no link, define sua senha e já pode acessar

**Domínios autorizados:** `@copastur.com.br` e `@goyatravel.com.br`
Qualquer outro domínio é bloqueado na tela de login.

---

## Passo 5 — Configurar envio de e-mail para dupla verificação (MFA)

O código de verificação é enviado via **SendGrid** (gratuito até 100 e-mails/dia).

### 5a. Criar conta SendGrid
1. Acesse **sendgrid.com** e crie uma conta gratuita
2. Vá em **Settings → API Keys → Create API Key**
3. Selecione **Restricted Access → Mail Send → Full Access**
4. Copie a chave gerada (começa com `SG.`)

### 5b. Verificar o e-mail remetente
1. No SendGrid: **Settings → Sender Authentication → Verify a Single Sender**
2. Use um e-mail que você controla (ex: `noreply@goyatravel.com.br` ou seu e-mail pessoal para testes)
3. Confirme pelo link enviado ao e-mail

### 5c. Configurar variáveis no Netlify
1. No painel Netlify: **Site configuration → Environment variables → Add variable**
2. Adicionar:
   - `SENDGRID_API_KEY` → sua chave do SendGrid (ex: `SG.xxxxxx`)
   - `FROM_EMAIL` → e-mail remetente verificado (ex: `noreply@goyatravel.com.br`)
3. Clique em **Save**
4. Vá em **Deploys → Trigger deploy → Deploy site** para aplicar as variáveis

---

## Como funciona o fluxo de acesso

```
Usuário acessa a URL
       ↓
Tela de login (login.html)
       ↓
Digite e-mail @copastur.com.br ou @goyatravel.com.br + senha
       ↓
Sistema verifica credenciais via Netlify Identity
       ↓
Código de 6 dígitos enviado para o e-mail (válido por 10 min)
       ↓
Usuário digita o código
       ↓
Acesso liberado ao Premium Cards Intelligence
```

---

## Gerenciar usuários

- **Bloquear acesso:** Netlify → Identity → clique no usuário → Block user
- **Remover acesso:** clique no usuário → Delete user
- **Redefinir senha:** o usuário usa "Esqueceu a senha?" na tela de login
- **Ver último acesso:** visível na lista de usuários da aba Identity

---

## Custos

| Serviço | Plano | Custo |
|---|---|---|
| Netlify | Starter | **Gratuito** (até 100GB banda/mês) |
| Netlify Identity | Starter | **Gratuito** (até 1.000 usuários) |
| SendGrid | Free | **Gratuito** (até 100 e-mails/dia) |

Para 10 usuários com uso normal, tudo cabe no plano gratuito.

---

## Suporte

Dúvidas técnicas: consultar documentação em
- docs.netlify.com
- docs.sendgrid.com/for-developers/sending-email/api-getting-started
