<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>verify-login.js · Goya Hono</title>
<style>
  body { margin: 0; background: #0f2433; font-family: 'Courier New', monospace; padding: 24px; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .filename { color: rgba(200,220,235,0.4); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
  .btn-copy {
    background: #2C5F7A; border: none; color: #e8f0f5;
    font-family: 'Courier New', monospace; font-size: 12px;
    padding: 8px 18px; border-radius: 4px; cursor: pointer;
    letter-spacing: 0.08em; transition: background 0.2s;
  }
  .btn-copy:hover { background: #3a7a9c; }
  .btn-copy.copied { background: #3a7a6a; }
  pre {
    margin: 0; background: #08151f; border: 1px solid rgba(91,163,201,0.15);
    border-radius: 6px; padding: 20px; color: #c8dce8;
    font-size: 13px; line-height: 1.7; overflow-x: auto;
    white-space: pre-wrap; word-break: break-word;
  }
</style>
</head>
<body>
<div class="header">
  <span class="filename">netlify/functions/verify-login.js</span>
  <button class="btn-copy" onclick="copyCode()">Copiar tudo</button>
</div>
<pre id="code">const ALLOWED_DOMAINS = ['copastur.com.br', 'goyatravel.com.br'];

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
};</pre>

<script>
function copyCode() {
  const text = document.getElementById('code').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.btn-copy');
    btn.textContent = '✓ Copiado!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copiar tudo';
      btn.classList.remove('copied');
    }, 2000);
  });
}
</script>
</body>
</html>
