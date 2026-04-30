/**
 * verify-reset.js v3 — Goya Hono · Loyalty Lab
 * Valida o token HMAC — stateless, sem banco, sem blobs.
 *
 * Variáveis de ambiente no Netlify:
 *   RESET_SECRET — mesma string do send-reset.js
 */

const crypto = require('crypto');

function verifyToken(token, code, email, secret) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 4) return { valid: false, reason: 'token_malformed' };

    const [tEmail, tCode, tExpiresAt, tHmac] = parts;

    if (tEmail !== email) return { valid: false, reason: 'email_mismatch' };
    if (tCode !== String(code).trim()) return { valid: false, reason: 'code_invalid' };
    if (Date.now() > Number(tExpiresAt)) return { valid: false, reason: 'expired' };

    const payload = `${tEmail}|${tCode}|${tExpiresAt}`;
    const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(tHmac), Buffer.from(expectedHmac))) {
      return { valid: false, reason: 'hmac_invalid' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'error' };
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let email, code, token;
  try {
    ({ email, code, token } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body inválido' }) };
  }

  if (!email || !code || !token) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, message: 'Dados incompletos.' }) };
  }

  const secret = process.env.RESET_SECRET || 'GoyaHonoDefaultSecret2026';
  const result = verifyToken(token, code, email, secret);

  if (!result.valid) {
    const messages = {
      expired: 'Código expirado. Solicite um novo.',
      code_invalid: 'Código inválido. Verifique e tente novamente.',
      email_mismatch: 'E-mail não corresponde. Solicite um novo código.',
      hmac_invalid: 'Token inválido. Solicite um novo código.',
      token_malformed: 'Token corrompido. Solicite um novo código.',
      error: 'Erro ao validar. Tente novamente.'
    };
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, message: messages[result.reason] || 'Código inválido.' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, message: 'Código validado com sucesso.' })
  };
};
