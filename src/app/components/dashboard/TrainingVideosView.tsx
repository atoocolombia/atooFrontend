import { GraduationCap, Loader2, Lock, PlayCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchClientTrainingVideos,
  fetchTrainingVideoBlobUrl,
  formatCop,
  requestTrainingPurchase,
  trainingVideoStreamUrl,
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
        className="w-full rounded-lg bg-black max-h-[360px]"
        onError={onError}
      />
    </div>
  );
}

function VideoCard({
  video,
  onRefresh,
}: {
  video: TrainingVideoDto;
  onRefresh: () => void;
}) {
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const card =
    theme === 'dark'
      ? 'bg-[#0D0F2E] border border-blue-600/20'
      : 'bg-white border border-gray-200 shadow-sm';

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
    <article className={`rounded-2xl p-5 space-y-3 ${card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg">{video.title}</h3>
          {video.description && <p className="text-sm opacity-80 mt-1">{video.description}</p>}
        </div>
        {video.kind === 'MANDATORY' ? (
          <span className="text-xs font-semibold uppercase tracking-wide bg-[#1A1FE8]/15 text-[#1A1FE8] px-2 py-1 rounded">
            Obligatoria
          </span>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-900 px-2 py-1 rounded">
            {formatCop(video.priceCop ?? 0)}
          </span>
        )}
      </div>

      {video.canWatch ? (
        <VideoPlayer video={video} />
      ) : (
        <div className="rounded-lg bg-gray-100 dark:bg-white/5 p-8 flex flex-col items-center gap-3 text-center">
          <Lock className="w-10 h-10 opacity-50" />
          <p className="text-sm opacity-80">
            Capacitación opcional de pago. Solicita la compra; cuando atoo confirme tu pago podrás ver el video.
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
      {msg && <p className="text-sm text-emerald-600 dark:text-emerald-400">{msg}</p>}
    </article>
  );
}

export function TrainingVideosView() {
  const { theme } = useTheme();
  const [videos, setVideos] = useState<TrainingVideoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVideos(await fetchClientTrainingVideos());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las capacitaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
          Completa las capacitaciones obligatorias. Las opcionales tienen costo adicional; solicita acceso y te
          habilitamos el video al confirmar el pago.
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
          <PlayCircle className="w-5 h-5" /> Pronto publicaremos capacitaciones aquí.
        </p>
      )}

      {mandatory.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Obligatorias</h2>
          {mandatory.map((v) => (
            <VideoCard key={v.id} video={v} onRefresh={() => void load()} />
          ))}
        </section>
      )}

      {optional.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Opcionales (de pago)</h2>
          {optional.map((v) => (
            <VideoCard key={v.id} video={v} onRefresh={() => void load()} />
          ))}
        </section>
      )}
    </div>
  );
}
