/**
 * verify-login.js — Goya Hono · Loyalty Lab
 * Valida e-mail e senha no servidor com segurança.
 *
 * Variável de ambiente no Netlify:
 *   ADMIN_PASSWORD — senha de acesso ao Loyalty Lab
 */

const ALLOWED_DOMAINS = ['copastur.com.br', 'goyatravel.com.br'];

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let email, password;
  try {
    ({ email, password } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body inválido' }) };
  }

  const domain = (email || '').split('@')[1] || '';
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return { statusCode: 403, headers, body: JSON.stringify({ ok: false, message: 'Domínio não autorizado.' }) };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, message: 'Configuração ausente.' }) };
  }

  if (password !== adminPassword) {
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, message: 'Senha incorreta.' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
