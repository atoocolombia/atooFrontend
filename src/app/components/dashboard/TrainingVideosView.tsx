import * as Dialog from '@radix-ui/react-dialog';
import { GraduationCap, Loader2, Lock, PlayCircle, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchClientTrainingVideos,
  fetchTrainingVideoBlobUrl,
  formatCop,
  requestTrainingPurchase,
  trainingVideoStreamUrl,
  trainingVideoThumbnailUrl,
  type TrainingVideoDto,
} from '../../../lib/trainingVideosApi';

function VideoPlayer({ video }: { video: TrainingVideoDto }) {
  const [src, setSrc] = useState(() => trainingVideoStreamUrl(video.id));
  const [loadingBlob, setLoadingBlob] = useState(false);

  useEffect(() => {
    return () => {
      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
    };
  }, [src]);

  if (video.youtubeEmbedUrl) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          title={video.title}
          src={video.youtubeEmbedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  const onError = () => {
    if (src.startsWith('blob:') || loadingBlob) return;
    setLoadingBlob(true);
    void fetchTrainingVideoBlobUrl(video.id)
      .then(setSrc)
      .finally(() => setLoadingBlob(false));
  };

  return (
    <div className="relative">
      {loadingBlob && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg z-10">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
      <video
        key={src}
        src={src}
        controls
        playsInline
        className="w-full rounded-lg bg-black aspect-video"
        onError={onError}
      />
    </div>
  );
}

function CourseTile({
  video,
  onOpen,
}: {
  video: TrainingVideoDto;
  onOpen: () => void;
}) {
  const { theme } = useTheme();
  const thumb = trainingVideoThumbnailUrl(video);
  const locked = !video.canWatch;

  const shell =
    theme === 'dark'
      ? 'bg-[#0D0F2E] border border-blue-600/20 hover:border-[#1A1FE8]/50'
      : 'bg-white border border-gray-200 shadow-sm hover:border-[#1A1FE8]/40 hover:shadow-md';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group text-left rounded-xl overflow-hidden transition-all ${shell} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1FE8]`}
    >
      <div className="relative aspect-video bg-gradient-to-br from-[#1A1FE8]/20 to-[#0D0F2E]/40">
        {thumb ? (
          <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-[#1A1FE8] opacity-80" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          {locked ? (
            <span className="rounded-full bg-black/55 p-3">
              <Lock className="w-7 h-7 text-white" />
            </span>
          ) : (
            <span className="rounded-full bg-[#1A1FE8]/90 p-3 opacity-90 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-7 h-7 text-white fill-white/20" />
            </span>
          )}
        </div>
        {video.kind === 'MANDATORY' ? (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-[#1A1FE8] text-white px-2 py-0.5 rounded">
            Obligatoria
          </span>
        ) : (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-white px-2 py-0.5 rounded">
            {formatCop(video.priceCop ?? 0)}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">{video.title}</h3>
        {video.description && (
          <p className="text-xs opacity-70 mt-1 line-clamp-2">{video.description}</p>
        )}
      </div>
    </button>
  );
}

function TrainingVideoModal({
  video,
  open,
  onOpenChange,
  onRefresh,
}: {
  video: TrainingVideoDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}) {
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) setMsg(null);
  }, [open, video?.id]);

  if (!video) return null;

  const panel =
    theme === 'dark' ? 'bg-[#0D0F2E] text-white border border-blue-600/20' : 'bg-white text-gray-900';

  const requestPurchase = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await requestTrainingPurchase(video.id);
      setMsg(res.message ?? 'Solicitud enviada. Te avisaremos cuando se confirme el pago.');
      onRefresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'No se pudo solicitar la compra');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] animate-in fade-in" />
        <Dialog.Content
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 z-[81] animate-in fade-in zoom-in-95 ${panel}`}
        >
          <Dialog.Close
            type="button"
            className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </Dialog.Close>

          <Dialog.Title className="text-xl font-bold pr-10">{video.title}</Dialog.Title>
          {video.description && (
            <Dialog.Description className="text-sm opacity-80 mt-2 mb-4">{video.description}</Dialog.Description>
          )}

          {video.canWatch ? (
            <VideoPlayer video={video} />
          ) : (
            <div className="rounded-lg bg-gray-100 dark:bg-white/5 p-8 flex flex-col items-center gap-3 text-center mt-2">
              <Lock className="w-10 h-10 opacity-50" />
              <p className="text-sm opacity-80">
                Capacitación opcional de pago. Solicita la compra; cuando atoo confirme tu pago podrás ver el
                video.
              </p>
              {video.purchaseStatus === 'PENDING' && (
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  Solicitud en revisión — pendiente de confirmación de pago.
                </p>
              )}
              {video.purchaseStatus !== 'PENDING' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void requestPurchase()}
                  className="rounded-lg bg-[#1A1FE8] text-white px-5 py-2.5 font-medium disabled:opacity-50"
                >
                  {busy ? 'Enviando…' : `Solicitar acceso · ${formatCop(video.priceCop ?? 0)}`}
                </button>
              )}
            </div>
          )}
          {msg && <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-3">{msg}</p>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CourseGrid({
  items,
  onSelect,
}: {
  items: TrainingVideoDto[];
  onSelect: (v: TrainingVideoDto) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {items.map((v) => (
        <CourseTile key={v.id} video={v} onOpen={() => onSelect(v)} />
      ))}
    </div>
  );
}

export function TrainingVideosView() {
  const { theme } = useTheme();
  const [videos, setVideos] = useState<TrainingVideoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TrainingVideoDto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchClientTrainingVideos();
      setVideos(list);
      setSelected((prev) => (prev ? list.find((v) => v.id === prev.id) ?? null : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las capacitaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openVideo = (v: TrainingVideoDto) => {
    setSelected(v);
    setModalOpen(true);
  };

  const mandatory = videos.filter((v) => v.kind === 'MANDATORY');
  const optional = videos.filter((v) => v.kind === 'OPTIONAL');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-[#1A1FE8]" />
          Capacitaciones
        </h1>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Elige un curso para ver el video completo. Las obligatorias son gratuitas; las opcionales requieren pago
          confirmado por atoo.
        </p>
      </header>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
        </div>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && videos.length === 0 && (
        <p className="text-sm opacity-70 flex items-center gap-2">
          <PlayCircle className="w-5 h-5" />
          Aún no hay capacitaciones publicadas. Si eres administrador, créalas en Admin → Capacitaciones
          (YouTube o archivo) y marca «Publicada».
        </p>
      )}

      {mandatory.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Obligatorias</h2>
          <CourseGrid items={mandatory} onSelect={openVideo} />
        </section>
      )}

      {optional.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Opcionales (de pago)</h2>
          <CourseGrid items={optional} onSelect={openVideo} />
        </section>
      )}

      <TrainingVideoModal
        video={selected}
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setSelected(null);
        }}
        onRefresh={() => void load()}
      />
    </div>
  );
}
