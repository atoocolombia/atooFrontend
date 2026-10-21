import { ImagePlus, Loader2, MessageCircle, Send, UserRound, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { buildWhatsAppSupportUrl } from '../../../lib/whatsappSupport';
import { fetchVehicleInspectionPlan } from '../../../lib/inspectionsApi';
import {
  askSupportChat,
  askSupportChatWithMedia,
  fetchSupportChatSession,
  isHumanSupportChatStatus,
  requestSupportHumanChat,
  fetchSupportTopics,
  SUPPORT_TOPICS_FALLBACK,
  type SupportChatAttachmentDto,
  type SupportChatMessageDto,
  type SupportChatSessionDto,
  type SupportTopic,
} from '../../../lib/supportChatApi';
import { SupportChatMarkdown } from '../../../lib/supportChatMarkdown';
import { SupportChatAttachment } from '../../../lib/SupportChatAttachment';
import {
  EMERGENCY_SITUATIONS,
  EMERGENCY_TOPIC_ID,
  fetchSupportEmergencyInfo,
  formatEmergencySafetyMessage,
  reportSupportEmergency,
  type EmergencyInfo,
} from '../../../lib/supportEmergencyApi';

interface ChatMessage {
  role: 'bot' | 'user' | 'agent';
  text: string;
  attachment?: SupportChatAttachmentDto | null;
}

type DashboardSupportChatProps = {
  userId?: string;
  /** Abre el panel al cargar (p. ej. desde notificación push). */
  openOnMount?: boolean;
};

function mapServerMessages(messages: SupportChatMessageDto[]): ChatMessage[] {
  return messages.map((m) => ({
    role: m.role,
    text: m.text,
    attachment: m.attachment ?? null,
  }));
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
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [emergencyPhase, setEmergencyPhase] = useState<'menu' | 'report' | 'chat'>('chat');
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null);
  const [emergencyReported, setEmergencyReported] = useState(false);
  const [reportSituation, setReportSituation] = useState<string>('accidente');
  const [reportLocation, setReportLocation] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSafe, setReportSafe] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const choosingTopicRef = useRef(false);

  const scrollToTopicPicker = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  const applySession = useCallback((session: SupportChatSessionDto | null) => {
    if (!session) return;
    setSessionId(session.id);
    setChatStatus(session.status);
    setEmergencyReported(Boolean(session.emergencyReported));
    if (session.topic === EMERGENCY_TOPIC_ID) {
      setEmergencyPhase(
        session.emergencyReported || session.messages.length > 1 ? 'chat' : 'menu',
      );
    }
    if (!choosingTopicRef.current) {
      if (session.topic) {
        setTopic(session.topic);
        setShowTopicPicker(false);
      } else {
        setTopic(null);
        setShowTopicPicker(true);
      }
    }
    setMessages(mapServerMessages(session.messages));
  }, []);

  const refreshSession = useCallback(async () => {
    const session = await fetchSupportChatSession();
    if (session) {
      applySession(session);
    } else if (!choosingTopicRef.current) {
      setTopic(null);
      setShowTopicPicker(true);
    }
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
    setError(null);
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
    void fetchSupportEmergencyInfo()
      .then(setEmergencyInfo)
      .catch(() => setEmergencyInfo(null));
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

  const openTopicPicker = () => {
    choosingTopicRef.current = true;
    setTopic(null);
    setShowTopicPicker(true);
    setQuestion('');
    setError(null);
    setEmergencyPhase('chat');
    scrollToTopicPicker();
  };

  const vehicleHint = (id: number): string | null => {
    if (id !== 1 && id !== 5) return null;
    if (vehicleLabel) {
      return `Usaré la información de tu ${vehicleLabel} según tus datos en atoo.`;
    }
    return 'Si tu vehículo ya está entregado, usamos esos datos al responder; si no, puede que debamos ayudarte por WhatsApp.';
  };

  const startTopic = (id: number) => {
    choosingTopicRef.current = false;
    setShowTopicPicker(false);
    setTopic(id);
    setError(null);
    const t = topics.find((x) => x.id === id);
    if (id === EMERGENCY_TOPIC_ID) {
      setEmergencyPhase('menu');
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: [
            `🆘 ${t?.label ?? 'Emergencia'}`,
            '',
            '**Primero:** protege tu vida y la de quienes estén contigo. Si hay peligro inmediato, llama al **123**.',
            '',
            'Elige una opción del menú de emergencia abajo.',
          ].join('\n'),
        },
      ]);
      return;
    }
    setEmergencyPhase('chat');
    const lines = [`Elegiste: ${t?.emoji ?? ''} ${t?.label ?? id}.`];
    const hint = vehicleHint(id);
    if (hint) lines.push(hint);
    lines.push('Escribe tu pregunta.');
    setMessages((prev) => [...prev, { role: 'bot', text: lines.join('\n\n') }]);
  };

  const showEmergencySafetyGuide = () => {
    const info = emergencyInfo;
    const text = info
      ? formatEmergencySafetyMessage(info)
      : 'Llama al **123** (emergencias). Tu seguridad es lo primero.';
    setEmergencyPhase('chat');
    setMessages((prev) => [...prev, { role: 'bot', text }]);
  };

  const startEmergencyReportForm = () => {
    setEmergencyPhase('report');
    setReportLocation('');
    setReportDescription('');
    setReportSafe(true);
    setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        text: 'Completa el reporte para avisar a atoo. **Si hay heridos o riesgo grave, llama primero al 123 o 125.**',
      },
    ]);
  };

  const startEmergencyAiChat = () => {
    setEmergencyPhase('chat');
    setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        text: 'Puedes preguntar a la IA sobre el manual de emergencia o enviar foto/video. Si necesitas trámite con la empresa, usa «Reportar accidente».',
      },
    ]);
  };

  const submitEmergencyReport = async () => {
    if (loading || topic !== EMERGENCY_TOPIC_ID) return;
    setLoading(true);
    setError(null);
    try {
      const session = await reportSupportEmergency({
        sessionId: sessionId ?? undefined,
        situation: reportSituation,
        location: reportLocation.trim(),
        description: reportDescription.trim(),
        clientSafe: reportSafe,
      });
      applySession(session);
      setEmergencyPhase('chat');
      setEmergencyReported(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const humanMode = isHumanSupportChatStatus(chatStatus ?? undefined);
  const emergencyQueueMode = emergencyReported && chatStatus === 'human_requested';
  const hasText = question.trim().length >= 3;
  const hasMedia = pendingFile !== null;
  const canAsk = topic !== null && (hasText || hasMedia) && !loading;

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const clearPendingFile = () => {
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onPickFile = (file: File | null) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      setError('Solo puedes subir fotos o videos.');
      return;
    }
    const maxBytes = isVideo ? 40 * 1024 * 1024 : 12 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(isVideo ? 'El video supera 40 MB.' : 'La foto supera 12 MB.');
      return;
    }
    setError(null);
    setPendingFile(file);
  };

  const handleSend = async () => {
    if (!canAsk || topic === null) return;
    const q = question.trim();
    const file = pendingFile;
    setQuestion('');
    clearPendingFile();
    setError(null);
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: q || (file?.type.startsWith('video/') ? '(Video adjunto)' : '(Foto adjunta)'),
      },
    ]);
    setLoading(true);
    try {
      const result = file
        ? await askSupportChatWithMedia({
            topic,
            question: q,
            sessionId: sessionId ?? undefined,
            file,
          })
        : await askSupportChat({ topic, question: q, sessionId: sessionId ?? undefined });
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

          {emergencyQueueMode && (
            <div className="px-3 py-2 text-xs bg-red-500/15 text-red-900 dark:text-red-100 border-b border-red-500/30">
              Reporte enviado a atoo. Seguimiento empresarial en horario laboral (lun–vie 8:00–18:00). Puedes
              seguir consultando la IA abajo.
            </div>
          )}
          {humanMode && !emergencyQueueMode && (
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
                {m.attachment && <SupportChatAttachment attachment={m.attachment} />}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />{' '}
                {humanMode ? 'Enviando…' : 'Consultando documentos…'}
              </div>
            )}

            {topic === EMERGENCY_TOPIC_ID && emergencyPhase === 'menu' && (
              <div className="grid gap-2 pt-2 border-t border-inherit">
                <p className="text-xs font-semibold text-red-600 dark:text-red-300">Menú de emergencia</p>
                <button
                  type="button"
                  onClick={showEmergencySafetyGuide}
                  className="text-left rounded-xl border border-red-500/40 px-3 py-2 hover:bg-red-500/10"
                >
                  🛡️ Seguridad y teléfonos en Bogotá (123, 125, 119…)
                </button>
                <button
                  type="button"
                  onClick={startEmergencyReportForm}
                  className="text-left rounded-xl border border-red-500/40 px-3 py-2 hover:bg-red-500/10"
                >
                  📋 Reportar accidente o situación grave (avisar a atoo)
                </button>
                <button
                  type="button"
                  onClick={startEmergencyAiChat}
                  className="text-left rounded-xl border border-inherit px-3 py-2 hover:bg-[#1A1FE8]/10"
                >
                  🤖 Consultar manual de emergencia con IA
                </button>
              </div>
            )}

            {(showTopicPicker || topic === null) && topics.length > 0 && (
              <div className="grid gap-2 pt-2">
                <p className="text-xs text-gray-500">Elige el tema de tu consulta:</p>
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => startTopic(t.id)}
                    className="text-left rounded-xl border border-inherit px-3 py-2 hover:bg-[#1A1FE8]/10 active:bg-[#1A1FE8]/20"
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <footer className="p-3 border-t border-inherit space-y-2">
            {topic === EMERGENCY_TOPIC_ID && emergencyPhase === 'report' && (
              <div className="space-y-2 text-sm">
                <label className="block text-xs opacity-80">
                  Tipo de situación
                  <select
                    value={reportSituation}
                    onChange={(e) => setReportSituation(e.target.value)}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 ${
                      theme === 'dark' ? 'bg-white/5 border-blue-600/30' : 'border-gray-200'
                    }`}
                  >
                    {EMERGENCY_SITUATIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs opacity-80">
                  Ubicación en Bogotá (barrio, dirección o referencia)
                  <input
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 ${
                      theme === 'dark' ? 'bg-white/5 border-blue-600/30' : 'border-gray-200'
                    }`}
                    placeholder="Ej.: Autopista Norte, calle 100…"
                  />
                </label>
                <label className="block text-xs opacity-80">
                  Qué ocurrió
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={3}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 resize-none ${
                      theme === 'dark' ? 'bg-white/5 border-blue-600/30' : 'border-gray-200'
                    }`}
                    placeholder="Describe el accidente, daños, si hay heridos…"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={reportSafe}
                    onChange={(e) => setReportSafe(e.target.checked)}
                  />
                  Confirmo que estoy a salvo en este momento
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-inherit py-2 text-sm"
                    onClick={() => setEmergencyPhase('menu')}
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    disabled={
                      loading ||
                      reportLocation.trim().length < 3 ||
                      reportDescription.trim().length < 10
                    }
                    onClick={() => void submitEmergencyReport()}
                    className="flex-1 rounded-xl bg-red-600 text-white py-2 text-sm font-medium disabled:opacity-40"
                  >
                    Enviar reporte a atoo
                  </button>
                </div>
              </div>
            )}

            {topic !== null && emergencyPhase !== 'menu' && emergencyPhase !== 'report' && (
              <>
                {pendingFile && pendingPreviewUrl && (
                  <div className="relative rounded-xl border border-inherit p-2">
                    {pendingFile.type.startsWith('video/') ? (
                      <video src={pendingPreviewUrl} controls className="max-h-32 rounded-lg w-full" />
                    ) : (
                      <img src={pendingPreviewUrl} alt="" className="max-h-32 rounded-lg object-contain" />
                    )}
                    <button
                      type="button"
                      className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1"
                      aria-label="Quitar archivo"
                      onClick={clearPendingFile}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="rounded-xl border border-inherit p-2 disabled:opacity-40"
                    aria-label="Adjuntar foto o video"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </button>
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSend();
                    }}
                    placeholder={
                      topic === EMERGENCY_TOPIC_ID
                        ? 'Pregunta de emergencia, foto o video…'
                        : humanMode
                          ? 'Mensaje o adjunto para el equipo…'
                          : 'Pregunta, foto o video…'
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
              </>
            )}
            <div className="flex flex-wrap justify-between gap-2 text-xs">
              <button
                type="button"
                className="underline opacity-70 min-h-10 px-1"
                onClick={openTopicPicker}
              >
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
