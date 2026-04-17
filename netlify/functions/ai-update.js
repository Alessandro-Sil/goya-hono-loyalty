/**
 * ai-update.js
 * Proxy seguro para chamadas à API Anthropic.
 * A chave ANTHROPIC_API_KEY fica no servidor — nunca exposta ao browser.
 *
 * Variável de ambiente necessária (configurar no Netlify):
 *   ANTHROPIC_API_KEY — chave da API Anthropic
 */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada.' })
    };
  }

  const SYSTEM = `Você é um analista especializado em cartões de crédito premium do Brasil e estratégia de loyalty para alto padrão. Monitore as principais fontes (Melhores Cartões, Passageiro de Primeira, Alta Renda Blog, Pontos pra Voar, sites dos emissores) e gere updates sobre: mudanças de pontuação, novos emissores de superluxo, lançamentos, alertas regulatórios ou promoções especiais relevantes para executivos de alto padrão e programas de loyalty corporativos.

Responda APENAS em JSON, sem markdown:
{
  "data": "data atual",
  "items": [
    {
      "categoria": "mudanca|lancamento|alerta|insight",
      "titulo": "até 80 chars",
      "corpo": "2-3 linhas: o que mudou e por que importa para um programa de loyalty de alto padrão como o Goya Hono",
      "cartao": "nome do cartão ou 'Mercado geral'",
      "impacto_loyalty": "1 linha: implicação direta para programa de loyalty premium"
    }
  ]
}
Gere 4-6 items. Se não houver novidades verificadas, gere insights sobre tendências do mercado premium de loyalty.`;

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM,
        messages: [{
          role: 'user',
          content: 'Gere o briefing diário de mercado de cartões premium para o AI Committee Goya Loyalty Lab. Data de hoje: ' + today
        }]
      })
    });

    const data = await res.json();
    const raw = (data.content || []).map(i => i.text || '').join('').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao buscar dados: ' + e.message })
    };
  }
};
