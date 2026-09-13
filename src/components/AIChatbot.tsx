import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Bot, ChevronDown, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useStore } from '@/store/appStore';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Ciao, sono l’assistente AI di DomusAdmin. Posso aiutarti a capire spese, rate, scadenze e procedure condominiali.',
};

const SUGGESTIONS = [
  'Quali rate sono ancora insolute?',
  'Come preparo un sollecito di pagamento?',
  'Spiegami la situazione dei miei condomini',
];

export default function AIChatbot() {
  const { condomini, rate, unita } = useStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (event?: FormEvent, preset?: string) => {
    event?.preventDefault();
    const content = (preset ?? input).trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: 'user' as const, content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          context: JSON.stringify({
            condomini: condomini.map(condo => ({ id: condo.id, nome: condo.nome, citta: condo.citta })),
            rate: rate.map(rata => ({
              descrizione: rata.descrizione,
              importo: rata.importo,
              pagato: rata.pagato,
              residuo: rata.importo - rata.pagato,
              stato: rata.stato,
              scadenza: rata.scadenza,
              condominio_id: rata.condominio_id,
              unita_id: rata.unita_id,
            })),
            unita: unita.map(unit => ({ id: unit.id, interno: unit.interno, proprietario: unit.proprietario, condominio_id: unit.condominio_id })),
          }),
        }),
      });
      const data = await response.json() as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Risposta AI non disponibile.');
      }
      setMessages(current => [...current, { role: 'assistant', content: data.reply! }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Si è verificato un errore.';
      setMessages(current => [...current, {
        role: 'assistant',
        content: `${message} Verifica la configurazione AI del progetto o riprova tra poco.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          className="flex h-[min(620px,calc(100vh-120px))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-up"
          aria-label="Assistente AI"
          data-testid="ai-chat-panel"
        >
          <header className="flex items-center justify-between bg-slate-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display text-sm font-bold">Assistente DomusAI</p>
                <p className="flex items-center gap-1 text-[10px] text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Chiudi assistente"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === 'user'
                  ? 'rounded-br-md bg-blue-600 text-white'
                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm'}`}>
                  {message.role === 'assistant' && <Bot className="mb-1 mr-1 inline-block h-3.5 w-3.5 text-blue-600" />}
                  {message.content}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Prova a chiedere</p>
                {SUGGESTIONS.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(undefined, suggestion)}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sto elaborando...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
              <textarea
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={1}
                placeholder="Scrivi una domanda..."
                className="max-h-24 min-h-9 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                aria-label="Messaggio per l’assistente AI"
                data-testid="ai-chat-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Invia messaggio"
                data-testid="ai-chat-send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="px-1 pt-2 text-[10px] text-slate-400">L’AI può commettere errori. Verifica sempre le informazioni importanti.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${open ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        aria-label={open ? 'Nascondi assistente AI' : 'Apri assistente AI'}
        aria-expanded={open}
        data-testid="ai-chat-toggle"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        <span>{open ? 'Riduci' : 'Chiedi all’AI'}</span>
      </button>
    </div>
  );
}
