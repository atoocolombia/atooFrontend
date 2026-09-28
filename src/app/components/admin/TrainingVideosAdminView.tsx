import { Loader2, Trash2, Video } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  adminApproveTrainingPurchase,
  adminCreateTrainingVideo,
  adminDeleteTrainingVideo,
  adminFetchTrainingPurchases,
  adminFetchTrainingVideos,
  adminUpdateTrainingVideo,
  formatCop,
  type TrainingPurchaseAdminDto,
  type TrainingVideoDto,
  type TrainingVideoKind,
} from '../../../lib/trainingVideosApi';

export function TrainingVideosAdminView() {
  const { theme } = useTheme();
  const [videos, setVideos] = useState<TrainingVideoDto[]>([]);
  const [purchases, setPurchases] = useState<TrainingPurchaseAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'videos' | 'purchases'>('videos');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<TrainingVideoKind>('MANDATORY');
  const [priceCop, setPriceCop] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [published, setPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const card =
    theme === 'dark'
      ? 'bg-[#0D0F2E] border border-blue-600/20 text-white'
      : 'bg-white border border-gray-200 text-gray-900';

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [v, p] = await Promise.all([adminFetchTrainingVideos(), adminFetchTrainingPurchases()]);
      setVideos(v);
      setPurchases(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar capacitaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Selecciona un video MP4 o WebM');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await adminCreateTrainingVideo({
        file,
        title: title.trim(),
        description: description.trim() || undefined,
        kind,
        priceCop: kind === 'OPTIONAL' ? Number(priceCop.replace(/\D/g, '')) : undefined,
        sortOrder: Number(sortOrder) || 0,
        published,
      });
      setTitle('');
      setDescription('');
      setPriceCop('');
      setFile(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el video');
    } finally {
      setUploading(false);
    }
  };

  const togglePublished = async (video: TrainingVideoDto) => {
    try {
      await adminUpdateTrainingVideo(video.id, { published: !video.published });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta capacitación y su archivo?')) return;
    try {
      await adminDeleteTrainingVideo(id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  const approvePurchase = async (id: string) => {
    try {
      await adminApproveTrainingPurchase(id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aprobar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('videos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'videos' ? 'bg-[#1A1FE8] text-white' : 'bg-gray-200 dark:bg-white/10'
          }`}
        >
          Videos
        </button>
        <button
          type="button"
          onClick={() => setTab('purchases')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'purchases' ? 'bg-[#1A1FE8] text-white' : 'bg-gray-200 dark:bg-white/10'
          }`}
        >
          Solicitudes de pago ({purchases.filter((p) => p.status === 'PENDING').length})
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {tab === 'videos' && (
        <>
          <form onSubmit={(e) => void handleUpload(e)} className={`rounded-xl p-6 space-y-4 ${card}`}>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5" /> Subir capacitación
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                Título
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-white/5"
                />
              </label>
              <label className="block text-sm">
                Orden
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-white/5"
                />
              </label>
            </div>
            <label className="block text-sm">
              Descripción (opcional)
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-white/5"
              />
            </label>
            <div className="flex flex-wrap gap-4 items-end">
              <label className="text-sm">
                Tipo
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as TrainingVideoKind)}
                  className="mt-1 block rounded-lg border px-3 py-2 dark:bg-white/5"
                >
                  <option value="MANDATORY">Obligatoria</option>
                  <option value="OPTIONAL">Opcional (de pago)</option>
                </select>
              </label>
              {kind === 'OPTIONAL' && (
                <label className="text-sm">
                  Precio (COP)
                  <input
                    required
                    inputMode="numeric"
                    value={priceCop}
                    onChange={(e) => setPriceCop(e.target.value)}
                    placeholder="Ej. 150000"
                    className="mt-1 block rounded-lg border px-3 py-2 dark:bg-white/5"
                  />
                </label>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                Publicada
              </label>
            </div>
            <label className="block text-sm">
              Video (MP4 / WebM, máx. ~200 MB)
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-[#1A1FE8] text-white px-5 py-2.5 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Subir capacitación
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
            </div>
          ) : (
            <ul className="space-y-3">
              {videos.map((v) => (
                <li key={v.id} className={`rounded-xl p-4 flex flex-wrap justify-between gap-3 ${card}`}>
                  <div>
                    <p className="font-semibold">{v.title}</p>
                    <p className="text-sm opacity-70">
                      {v.kind === 'MANDATORY' ? 'Obligatoria' : `Opcional · ${formatCop(v.priceCop ?? 0)}`}
                      {' · '}
                      {v.published ? 'Publicada' : 'Borrador'}
                    </p>
                    {v.description && <p className="text-sm mt-1">{v.description}</p>}
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => void togglePublished(v)}
                      className="text-sm px-3 py-1.5 rounded-lg border"
                    >
                      {v.published ? 'Ocultar' : 'Publicar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(v.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
              {videos.length === 0 && (
                <p className="text-sm opacity-70">Aún no hay capacitaciones subidas.</p>
              )}
            </ul>
          )}
        </>
      )}

      {tab === 'purchases' && (
        <ul className="space-y-3">
          {purchases.map((p) => (
            <li key={p.id} className={`rounded-xl p-4 flex flex-wrap justify-between gap-3 ${card}`}>
              <div>
                <p className="font-medium">{p.videoTitle}</p>
                <p className="text-sm opacity-70">
                  {p.userEmail} · {formatCop(p.amountCop)} · {p.status}
                </p>
              </div>
              {p.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => void approvePurchase(p.id)}
                  className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium"
                >
                  Confirmar pago / desbloquear
                </button>
              )}
            </li>
          ))}
          {purchases.length === 0 && (
            <p className="text-sm opacity-70">No hay solicitudes de compra.</p>
          )}
        </ul>
      )}
    </div>
  );
}
