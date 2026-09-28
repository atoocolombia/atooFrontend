import { Loader2, MessageCircle, Send, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  adminCloseSupportChat,
  adminFetchSupportChat,
  adminListSupportChats,
  adminReplySupportChat,
  type SupportChatSessionDetail,
  type SupportChatSessionListItem,
} from '../../../lib/adminSupportChatsApi';
import { SupportChatMarkdown } from '../../../lib/supportChatMarkdown';

type SupportChatsAdminViewProps = {
  initialSessionId?: string | null;
};

function statusLabel(status: SupportChatSessionListItem['status']): string {
  switch (status) {
    case 'human_requested':
      return 'Pendiente';
    case 'human_active':
      return 'En atención';
    case 'closed':
      return 'Cerrada';
    default:
      return 'IA';
  }
}

export function SupportChatsAdminView({ initialSessionId }: SupportChatsAdminViewProps) {
  const { theme } = useTheme();
  const [list, setList] = useState<SupportChatSessionListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialSessionId ?? null);
  const [detail, setDetail] = useState<SupportChatSessionDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      setList(await adminListSupportChats('open'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la lista');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDetail = useCallback(async (sessionId: string) => {
    setLoadingDetail(true);
    setError(null);
    try {
      setDetail(await adminFetchSupportChat(sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la conversación');
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
    const id = window.setInterval(() => void loadList(), 20_000);
    return () => window.clearInterval(id);
  }, [loadList]);

  useEffect(() => {
    if (initialSessionId) setSelectedId(initialSessionId);
  }, [initialSessionId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
    const id = window.setInterval(() => void loadDetail(selectedId), 8_000);
    return () => window.clearInterval(id);
  }, [selectedId, loadDetail]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [detail?.messages]);

  const card =
    theme === 'dark'
      ? 'bg-[#0D0F2E] border border-blue-600/20'
      : 'bg-white border border-gray-200 shadow-sm';

  const sendReply = async () => {
    if (!selectedId || !reply.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await adminReplySupportChat(selectedId, reply.trim());
      setDetail(updated);
      setReply('');
      void loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setBusy(false);
    }
  };

  const closeChat = async () => {
    if (!selectedId || busy) return;
    setBusy(true);
    try {
      await adminCloseSupportChat(selectedId);
      setSelectedId(null);
      setDetail(null);
      void loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cerrar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-[#1A1FE8]" />
          Chats de soporte (escalamiento IA)
        </h1>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Conversaciones cuando el cliente pide hablar con un humano. Responde aquí; el cliente ve tus mensajes en su
          chat de ayuda.
        </p>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4 min-h-[480px]">
        <aside className={`rounded-xl p-3 space-y-2 ${card}`}>
          <h2 className="text-sm font-semibold px-1">Abiertas</h2>
          {loadingList && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-[#1A1FE8]" />
            </div>
          )}
          {!loadingList && list.length === 0 && (
            <p className="text-sm opacity-70 px-1">No hay chats pendientes.</p>
          )}
          {list.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                selectedId === item.id ? 'bg-[#1A1FE8] text-white' : 'hover:bg-[#1A1FE8]/10'
              }`}
            >
              <div className="font-medium truncate">{item.clientName}</div>
              <div className="text-xs opacity-80 truncate">{item.clientEmail}</div>
              <div className="text-xs mt-1">{statusLabel(item.status)}</div>
            </button>
          ))}
        </aside>

        <section className={`rounded-xl flex flex-col min-h-[420px] ${card}`}>
          {!selectedId && (
            <div className="flex-1 flex items-center justify-center text-sm opacity-60 p-8">
              Selecciona una conversación o abre el enlace del correo de escalamiento.
            </div>
          )}
          {selectedId && loadingDetail && !detail && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
            </div>
          )}
          {selectedId && detail && (
            <>
              <div className="px-4 py-3 border-b border-inherit flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{detail.clientName}</p>
                  <p className="text-sm opacity-70">{detail.clientEmail}</p>
                  {detail.topicLabel && (
                    <p className="text-xs opacity-60 mt-1">Tema: {detail.topicLabel}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    {statusLabel(detail.status)}
                  </span>
                  {detail.status !== 'closed' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void closeChat()}
                      className="text-xs flex items-center gap-1 text-red-600 hover:underline disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Cerrar chat
                    </button>
                  )}
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm max-h-[50vh]">
                {detail.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-xl px-3 py-2 whitespace-pre-wrap ${
                      m.role === 'user'
                        ? theme === 'dark'
                          ? 'bg-white/10'
                          : 'bg-gray-100'
                        : m.role === 'agent'
                          ? 'ml-auto bg-emerald-600 text-white'
                          : 'bg-[#1A1FE8]/15 border border-[#1A1FE8]/30'
                    }`}
                  >
                    {m.role === 'agent' && (
                      <span className="text-[10px] uppercase tracking-wide opacity-80 block mb-1">
                        Equipo atoo
                      </span>
                    )}
                    {m.role === 'bot' ? <SupportChatMarkdown text={m.text} /> : m.text}
                  </div>
                ))}
              </div>

              {detail.status !== 'closed' && (
                <footer className="p-3 border-t border-inherit flex gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                    placeholder="Escribe tu respuesta al cliente…"
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm resize-none ${
                      theme === 'dark' ? 'bg-white/5 border-blue-600/30' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={busy || !reply.trim()}
                    onClick={() => void sendReply()}
                    className="self-end rounded-xl bg-[#1A1FE8] text-white p-3 disabled:opacity-40"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </footer>
              )}
            </>
          )}
        </section>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
