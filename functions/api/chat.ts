interface Env {
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `Sei DomusAI, l'assistente AI di DomusAdmin, un gestionale italiano per amministratori di condominio.
Rispondi in italiano con tono professionale, chiaro e pratico. Aiuta con spese, rate, scadenze, comunicazioni e procedure condominiali.
Non inventare dati del gestionale che non sono presenti nella conversazione. Per questioni legali o fiscali, indica sempre che serve la verifica di un professionista qualificato.
Mantieni le risposte concise e usa elenchi quando migliorano la leggibilita.`;

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const onRequestPost = async ({ request, env }: PagesContext) => {
  if (!env.AI_API_KEY && !env.ANTHROPIC_API_KEY) {
    return json({ error: 'Servizio AI non configurato: manca una chiave API.' }, 503);
  }

  let body: { messages?: ChatMessage[]; context?: string };
  try {
    body = await request.json() as { messages?: ChatMessage[]; context?: string };
  } catch {
    return json({ error: 'Richiesta non valida.' }, 400);
  }

  const messages = body.messages?.filter(
    message => (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string'
  ).slice(-20);

  if (!messages?.length) {
    return json({ error: 'Inserisci un messaggio.' }, 400);
  }

  const appContext = body.context?.slice(0, 30000);

  if (env.ANTHROPIC_API_KEY) {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
        max_tokens: 1200,
        temperature: 0.3,
        system: appContext
          ? `${SYSTEM_PROMPT}\n\nDati aggiornati del gestionale in formato JSON. Usali per rispondere, senza inventare informazioni:\n${appContext}`
          : SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!anthropicResponse.ok) {
      return json({ error: 'Anthropic non ha restituito una risposta.' }, 502);
    }

    const data = await anthropicResponse.json() as { content?: Array<{ type?: string; text?: string }> };
    const reply = data.content?.find(block => block.type === 'text')?.text;
    return reply ? json({ reply }) : json({ error: 'Risposta Anthropic vuota.' }, 502);
  }

  const baseUrl = (env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.AI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(appContext ? [{ role: 'system' as const, content: `Dati aggiornati del gestionale in formato JSON. Usali per rispondere, senza inventare informazioni:\n${appContext}` }] : []),
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    return json({ error: 'Il provider AI non ha restituito una risposta.' }, 502);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const reply = data.choices?.[0]?.message?.content;
  return reply ? json({ reply }) : json({ error: 'Risposta AI vuota.' }, 502);
};