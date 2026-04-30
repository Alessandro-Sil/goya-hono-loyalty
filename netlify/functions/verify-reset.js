/**
 * verify-reset.js v2 — Goya Hono · Loyalty Lab
 * Lê o código do Netlify Blobs para validar corretamente.
 */

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let email, code;
  try {
    ({ email, code } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body inválido' }) };
  }

  if (!email || !code) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, message: 'E-mail e código são obrigatórios.' }) };
  }

  let stored;
  try {
    const store = getStore({ name: 'reset-codes', consistency: 'strong' });
    stored = await store.get(email, { type: 'json' });
  } catch (err) {
    console.error('Blob error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, message: 'Err
