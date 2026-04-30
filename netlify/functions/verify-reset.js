/**
 * verify-reset.js
 * Goya Hono · Loyalty Lab
 *
 * Valida o código OTP de reset e autentica o usuário
 * definindo uma senha nova via variável de ambiente.
 *
 * Variáveis de ambiente necessárias no Netlify:
 *   ADMIN_PASSWORD — senha global de acesso ao Loyalty Lab
 */

if (!global.__resetStore) global.__resetStore = {};
const resetStore = global.__resetStore;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let email, code, newPassword;
  try {
    ({ email, code, newPassword } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body inválido' }) };
  }

  if (!email || !code) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, message: 'E-mail e código são obrigatórios.' }) };
  }

  const stored = resetStore[email];

  if (!stored) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, message: 'Nenhum código encontrado para este e-mail. Solicite um novo.' }) };
  }

  if (Date.now() > stored.expiresAt) {
    delete resetStore[email];
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, message: 'Código expirado. Solicite um novo.' }) };
  }

  if (stored.code !== String(code).trim()) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, message: 'Código inválido. Verifique e tente novamente.' }) };
  }

  // Código válido — limpa o store e retorna sucesso com token de sessão
  delete resetStore[email];

  const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      message: 'Código validado com sucesso.',
      sessionToken,
      email
    })
  };
};
