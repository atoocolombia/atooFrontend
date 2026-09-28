import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { buildWhatsAppSupportUrl } from '../../../lib/whatsappSupport';
import {
  askSupportChat,
  fetchSupportChatContext,
  fetchSupportTopics,
  type SupportChatContext,
  type SupportTopic,
} from '../../../lib/supportChatApi';
import { SupportChatMarkdown } from '../../../lib/supportChatMarkdown';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

export function DashboardSupportChat() {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState<SupportTopic[]>([]);
  const [vehicleContext, setVehicleContext] = useState<SupportChatContext | null>(null);
  const [topic, setTopic] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    void Promise.all([fetchSupportTopics(), fetchSupportChatContext()])
      .then(([loadedTopics, ctx]) => {
        setTopics(loadedTopics);
        setVehicleContext(ctx);
      })
      .catch(() => setError('No se pudo cargar el asistente'));
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const resetFlow = () => {
    setTopic(null);
    setQuestion('');
    setError(null);
  };

  const vehicleHint = (id: number): string | null => {
    if (id !== 1 && id !== 5) return null;
    if (vehicleContext?.vehicleLabel) {
      return `Usaré la información de tu ${vehicleContext.vehicleLabel} según tus datos en atoo.`;
    }
    return 'Aún no vemos tu modelo en el sistema; si preguntas del vehículo, puede que debamos ayudarte por WhatsApp.';
  };

  const startTopic = (id: number) => {
    setTopic(id);
    setError(null);
    const t = topics.find((x) => x.id === id);
    const lines = [`Elegiste: ${t?.emoji ?? ''} ${t?.label ?? id}.`];
    const hint = vehicleHint(id);
    if (hint) lines.push(hint);
    lines.push('Escribe tu pregunta.');
    setMessages((prev) => [...prev, { role: 'bot', text: lines.join('\n\n') }]);
  };

  const canAsk = topic !== null && question.trim().length >= 3 && !loading;

  const handleSend = async () => {
    if (!canAsk || topic === null) return;
    const q = question.trim();
    setQuestion('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const result = await askSupportChat({ topic, question: q });
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: result.answer },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al consultar la IA';
      setError(msg);
      setMessages((prev) => [...prev, { role: 'bot', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const panelClass =
    theme === 'dark'
      ? 'bg-[#0D0F2E] border-blue-600/30 text-white'
      : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          className={`w-[min(100vw-2rem,400px)] h-[min(70vh,520px)] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${panelClass}`}
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-inherit bg-[#1A1FE8] text-white">
            <span className="font-semibold">Asistente atoo</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.length === 0 && (
              <p className="text-gray-500">
                Hola 👋 Elige un tema para empezar.
                {vehicleContext?.vehicleLabel && (
                  <>
                    {' '}
                    Vehículo registrado: <strong>{vehicleContext.vehicleLabel}</strong>.
                  </>
                )}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={`max-w-[90%] rounded-xl px-3 py-2 whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'ml-auto bg-[#1A1FE8] text-white'
                    : theme === 'dark'
                      ? 'bg-white/10'
                      : 'bg-gray-100'
                }`}
              >
                {m.role === 'bot' ? <SupportChatMarkdown text={m.text} /> : m.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Consultando documentos…
              </div>
            )}

            {topic === null && topics.length > 0 && (
              <div className="grid gap-2 pt-2">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => startTopic(t.id)}
                    className="text-left rounded-xl border border-inherit px-3 py-2 hover:bg-[#1A1FE8]/10"
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <footer className="p-3 border-t border-inherit space-y-2">
            {topic !== null && (
              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleSend();
                  }}
                  placeholder="Escribe tu pregunta…"
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
                    theme === 'dark' ? 'bg-white/5 border-blue-600/30' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  disabled={!canAsk}
                  onClick={() => void handleSend()}
                  className="rounded-xl bg-[#1A1FE8] text-white p-2 disabled:opacity-40"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <button type="button" className="underline opacity-70" onClick={resetFlow}>
                Cambiar tema
              </button>
              <a
                href={buildWhatsAppSupportUrl('dashboard')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 font-medium"
              >
                Hablar por WhatsApp
              </a>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </footer>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-[#1A1FE8] hover:bg-[#1519c4] text-white rounded-full shadow-2xl px-5 py-4 font-semibold"
        aria-label="Abrir asistente atoo"
      >
        <MessageCircle className="w-7 h-7" />
        {open ? 'Cerrar ayuda' : 'Ayuda IA'}
      </button>
    </div>
  );
}
