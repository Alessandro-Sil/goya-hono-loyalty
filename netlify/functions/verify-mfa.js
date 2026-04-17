let codeStore;
try {
  codeStore = require('./send-mfa').codeStore || (global.__mfaStore = global.__mfaStore || {});
} catch {
  codeStore = (global.__mfaStore = global.__mfaStore || {});
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  let email, code;
  try { ({ email, code } = JSON.parse(event.body || '{}')); } catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid body' }) }; }
  if (!email || !code) return { statusCode: 400, body: JSON.stringify({ ok: false, message: 'Dados incompletos.' }) };
  const entry = codeStore[email];
  if (!entry) return { statusCode: 400, body: JSON.stringify({ ok: false, message: 'Código não encontrado. Solicite um novo.' }) };
  if (Date.now() > entry.expiresAt) { delete codeStore[email]; return { statusCode: 400, body: JSON.stringify({ ok: false, message: 'Código expirado.' }) }; }
  if (entry.code !== String(code).trim()) return { statusCode: 400, body: JSON.stringify({ ok: false, message: 'Código incorreto.' }) };
  delete codeStore[email];
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
