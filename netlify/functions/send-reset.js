/**
 * send-reset.js
 * Goya Hono · Loyalty Lab
 * 
 * Envia código OTP de 6 dígitos para reset de senha via SendGrid.
 * Independente do Netlify Identity — funciona 100% via serverless.
 *
 * Variáveis de ambiente necessárias no Netlify:
 *   SENDGRID_API_KEY  — chave da API SendGrid
 *   FROM_EMAIL        — remetente verificado (ex: noreply@goyatravel.com.br)
 *   ADMIN_PASSWORD    — senha admin para reset (ex: GoyaHono2026!)
 */

const ALLOWED_DOMAINS = ['copastur.com.br', 'goyatravel.com.br'];
const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutos

// Store em memória — funciona para uso interno (time pequeno)
if (!global.__resetStore) global.__resetStore = {};
const resetStore = global.__resetStore;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function validateDomain(email) {
  const domain = (email || '').split('@')[1] || '';
  return ALLOWED_DOMAINS.includes(domain);
}

async function sendResetEmail(to, code, apiKey, fromEmail) {
  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: fromEmail, name: 'Goya Hono · Loyalty Lab' },
    subject: `${code} — Redefinição de senha · Goya Hono`,
    content: [{
      type: 'text/html',
      value: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Redefinição de Senha · Goya Hono</title>
</head>
<body style="margin:0;padding:0;background:#08151f;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#08151f;padding:48px 20px;">
  <tr><td align="center">
    <table width="440" cellpadding="0" cellspacing="0" style="background:#0f2433;border:1px solid rgba(255,255,255,0.07);border-radius:8px;overflow:hidden;">
      
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0f2433 0%,#162e42 100%);padding:36px 40px 28px;border-bottom:1px solid rgba(91,163,201,0.12);">
        <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(200,220,235,0.35);font-weight:400;">GOYA HONO</p>
        <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(200,220,235,0.45);font-weight:300;">LOYALTY LAB · ACESSO RESTRITO</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 8px;font-size:15px;font-weight:500;color:#c8dce8;letter-spacing:0.01em;">Redefinição de senha</p>
        <p style="margin:0 0 28px;font-size:13px;color:rgba(200,220,235,0.5);line-height:1.7;">
          Recebemos uma solicitação para redefinir a senha da conta associada a <strong style="color:rgba(200,220,235,0.7);">${to}</strong>.<br>
          Use o código abaixo para continuar:
        </p>

        <!-- Código OTP -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:4px 0 28px;">
            <div style="background:rgba(44,95,122,0.12);border:1px solid rgba(91,163,201,0.2);border-radius:6px;padding:22px 40px;display:inline-block;">
              <span style="font-size:38px;font-weight:700;letter-spacing:0.28em;color:#e8f0f5;font-family:'Courier New',monospace;">${code}</span>
            </div>
          </td></tr>
        </table>

        <p style="margin:0 0 6px;font-size:12px;color:rgba(200,220,235,0.35);text-align:center;line-height:1.6;">
          Este código expira em <strong style="color:rgba(200,220,235,0.5);">15 minutos</strong>.
        </p>
        <p style="margin:0;font-size:12px;color:rgba(200,220,235,0.25);text-align:center;line-height:1.6;">
          Se você não solicitou esta redefinição, ignore este e-mail.
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.05);">
        <p style="margin:0;font-size:10px;color:rgba(200,220,235,0.2);text-align:center;letter-spacing:0.06em;">
          @copastur.com.br · @goyatravel.com.br
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
    }]
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return res.status === 202;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body inválido' }) };
  }

  if (!email || !validateDomain(email)) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ ok: false, message: 'Domínio não autorizado. Use seu e-mail @copastur.com.br ou @goyatravel.com.br' })
    };
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Configuração de e-mail ausente' }) };
  }

  const code = generateCode();
  const expiresAt = Date.now() + CODE_TTL_MS;

  resetStore[email] = { code, expiresAt };

  const sent = await sendResetEmail(email, code, apiKey, fromEmail);

  if (!sent) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, message: 'Falha ao enviar e-mail. Tente novamente.' }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, message: 'Código enviado com sucesso.' })
  };
};
