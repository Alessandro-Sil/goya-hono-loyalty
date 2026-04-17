/**
 * send-mfa.js
 * Gera código de 6 dígitos, armazena com TTL de 10min,
 * envia por e-mail via SendGrid.
 *
 * Variáveis de ambiente necessárias (configurar no Netlify):
 *   SENDGRID_API_KEY   — chave da API SendGrid
 *   FROM_EMAIL         — remetente verificado (ex: noreply@goyatravel.com.br)
 */

const ALLOWED_DOMAINS = ['copastur.com.br', 'goyatravel.com.br'];
const CODE_TTL_MS = 10 * 60 * 1000;

const codeStore = {};

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function validateDomain(email) {
  const domain = (email || '').split('@')[1] || '';
  return ALLOWED_DOMAINS.includes(domain);
}

async function sendEmail(to, code, apiKey, fromEmail) {
  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: fromEmail, name: 'Goya Hono · Loyalty Lab' },
    subject: `${code} — Seu código de acesso Goya Hono`,
    content: [{ type: 'text/html', value: `<!DOCTYPE html><html lang="pt-BR"><body style="margin:0;padding:0;background:#0a1a26;font-family:'Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1a26;padding:40px 20px;"><tr><td align="center"><table width="420" cellpadding="0" cellspacing="0" style="background:#0f2433;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:40px;"><tr><td align="center" style="padding-bottom:28px;"><p style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(200,220,235,0.4);margin:0 0 16px;">GOYA HONO · LOYALTY LAB</p></td></tr><tr><td align="center" style="padding:28px 0;"><div style="background:rgba(44,95,122,0.15);border:1px solid rgba(91,163,201,0.25);border-radius:4px;padding:20px 36px;display:inline-block;"><span style="font-size:36px;font-weight:700;letter-spacing:0.25em;color:#e8f0f5;">${code}</span></div></td></tr><tr><td align="center"><p style="font-size:12px;color:rgba(200,220,235,0.35);margin:0;">Este código expira em <strong>10 minutos</strong>.</p></td></tr></table></td></tr></table></body></html>` }]
  };
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.status === 202;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  let email;
  try { ({ email } = JSON.parse(event.body || '{}')); } catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid body' }) }; }
  if (!email || !validateDomain(email)) return { statusCode: 403, body: JSON.stringify({ ok: false, message: 'Domínio não autorizado.' }) };
  const code = generateCode();
  codeStore[email] = { code, expiresAt: Date.now() + CODE_TTL_MS };
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@goyatravel.com.br';
  if (!apiKey) { console.log(`[DEV] MFA code for ${email}: ${code}`); return { statusCode: 200, body: JSON.stringify({ ok: true, dev: true }) }; }
  const sent = await sendEmail(email, code, apiKey, fromEmail);
  return { statusCode: 200, body: JSON.stringify({ ok: sent }) };
};
