import { Loader2, MessageCircle, Send, UserRound, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { buildWhatsAppSupportUrl } from '../../../lib/whatsappSupport';
import { fetchVehicleInspectionPlan } from '../../../lib/inspectionsApi';
import {
  askSupportChat,
  fetchSupportChatSession,
  isHumanSupportChatStatus,
  requestSupportHumanChat,
  fetchSupportTopics,
  SUPPORT_TOPICS_FALLBACK,
  type SupportChatMessageDto,
  type SupportChatSessionDto,
  type SupportTopic,
} from '../../../lib/supportChatApi';
import { SupportChatMarkdown } from '../../../lib/supportChatMarkdown';

interface ChatMessage {
  role: 'bot' | 'user' | 'agent';
  text: string;
}

type DashboardSupportChatProps = {
  userId?: string;
  /** Abre el panel al cargar (p. ej. desde notificación push). */
  openOnMount?: boolean;
};

function mapServerMessages(messages: SupportChatMessageDto[]): ChatMessage[] {
  return messages.map((m) => ({ role: m.role, text: m.text }));
}

export function DashboardSupportChat({ userId, openOnMount }: DashboardSupportChatProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState<SupportTopic[]>(SUPPORT_TOPICS_FALLBACK);
  const [vehicleLabel, setVehicleLabel] = useState<string | null>(null);
  const [topic, setTopic] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<SupportChatSessionDto['status'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const applySession = useCallback((session: SupportChatSessionDto | null) => {
    if (!session) return;
    setSessionId(session.id);
    setChatStatus(session.status);
    if (session.topic) setTopic(session.topic);
    setMessages(mapServerMessages(session.messages));
  }, []);

  const refreshSession = useCallback(async () => {
    const session = await fetchSupportChatSession();
    if (session) applySession(session);
    return session;
  }, [applySession]);

  useEffect(() => {
    if (openOnMount) setOpen(true);
  }, [openOnMount]);

  useEffect(() => {
    if (!userId) return;
    void refreshSession().catch(() => undefined);
  }, [userId, refreshSession]);

  useEffect(() => {
    if (!open) return;
    setError(null;
    void fetchSupportTopics()
      .then(setTopics)
      .catch(() => {
        /* Menú local ya visible */
      });
    void refreshSession().catch(() => {
      /* Sin sesión previa */
    });
    if (!userId) {
      setVehicleLabel(null);
      return;
    }
    void fetchVehicleInspectionPlan(userId)
      .then((plan) => setVehicleLabel(plan?.vehicleName ?? null))
      .catch(() => setVehicleLabel(null));
  }, [open, userId, refreshSession]);

  useEffect(() => {
    if (!isHumanSupportChatStatus(chatStatus ?? undefined)) return;
    const id = window.setInterval(() => {
      void refreshSession().catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(id);
  }, [chatStatus, refreshSession]);

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
    if (vehicleLabel) {
      return `Usaré la información de tu ${vehicleLabel} según tus datos en atoo.`;
    }
    return 'Si tu vehículo ya está entregado, usamos esos datos al responder; si no, puede que debamos ayudarte por WhatsApp.';
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

  const humanMode = isHumanSupportChatStatus(chatStatus ?? undefined);
  const canAsk = topic !== null && question.trim().length >= 3 && !loading;

  const handleSend = async () => {
    if (!canAsk || topic === null) return;
    const q = question.trim();
    setQuestion('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const result = await askSupportChat({ topic, question: q, sessionId: sessionId ?? undefined });
      if (result.session) {
        applySession(result.session);
      } else {
        if (result.sessionId) setSessionId(result.sessionId);
        if (result.status) setChatStatus(result.status);
        setMessages((prev) => [...prev, { role: 'bot', text: result.answer }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al consultar la IA';
      setError(msg);
      setMessages((prev) => [...prev, { role: 'bot', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHuman = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    const activeTopic = topic ?? 3;
    if (topic === null) {
      setTopic(activeTopic);
    }
    try {
      let result;
      try {
        result = await requestSupportHumanChat({
          sessionId: sessionId ?? undefined,
          topic: activeTopic,
        });
      } catch {
        result = await askSupportChat({
          topic: activeTopic,
          question: 'Quiero hablar con un humano.',
          sessionId: sessionId ?? undefined,
          requestHuman: true,
        });
        if (!result.session) {
          throw new Error('No se pudo conectar con soporte. Recarga la página e inténtalo de nuevo.');
        }
      }
      applySession(result.session);
      setMessages(mapServerMessages(result.session.messages));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo solicitar atención humana';
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

          {humanMode && (
            <div className="px-3 py-2 text-xs bg-amber-500/15 text-amber-800 dark:text-amber-200 border-b border-amber-500/30">
              Un agente de atoo atenderá esta conversación pronto. Puedes seguir escribiendo aquí.
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.length === 0 && (
              <p className="text-gray-500">
                Hola 👋 Elige un tema para empezar.
                {vehicleLabel && (
                  <>
                    {' '}
                    Vehículo registrado: <strong>{vehicleLabel}</strong>.
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
                    : m.role === 'agent'
                      ? 'bg-emerald-600 text-white'
                      : theme === 'dark'
                        ? 'bg-white/10'
                        : 'bg-gray-100'
                }`}
              >
                {m.role === 'agent' && (
                  <span className="text-[10px] block opacity-80 mb-1 uppercase tracking-wide">
                    Equipo atoo
                  </span>
                )}
                {m.role === 'bot' ? <SupportChatMarkdown text={m.text} /> : m.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />{' '}
                {humanMode ? 'Enviando…' : 'Consultando documentos…'}
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
                  placeholder={
                    humanMode ? 'Mensaje para el equipo atoo…' : 'Escribe tu pregunta…'
                  }
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
            <div className="flex flex-wrap justify-between gap-2 text-xs">
              <button type="button" className="underline opacity-70" onClick={resetFlow}>
                Cambiar tema
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleRequestHuman()}
                  className="inline-flex items-center gap-1 text-[#1A1FE8] font-medium disabled:opacity-50"
                >
                  <UserRound className="w-3.5 h-3.5" /> Hablar con una persona
                </button>
                <a
                  href={buildWhatsAppSupportUrl('dashboard')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-medium"
                >
                  WhatsApp
                </a>
              </div>
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
