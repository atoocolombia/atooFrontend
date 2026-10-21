import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiUrl, fetchWithCreds } from './http';
import type { SupportChatAttachmentDto } from './supportChatApi';

type Props = {
  attachment: SupportChatAttachmentDto;
  className?: string;
};

export function SupportChatAttachment({ attachment, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | undefined;
    setError(false);
    setSrc(null);
    void fetchWithCreds(apiUrl(attachment.url))
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el archivo');
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setError(true));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.url]);

  if (error) {
    return <p className="text-xs opacity-80">No se pudo cargar el adjunto.</p>;
  }

  if (!src) {
    return (
      <div className={`flex items-center gap-2 text-xs opacity-80 ${className ?? ''}`}>
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
      </div>
    );
  }

  if (attachment.kind === 'video') {
    return (
      <video
        src={src}
        controls
        playsInline
        className={`mt-2 max-w-full rounded-lg max-h-48 ${className ?? ''}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt="Adjunto del chat"
      className={`mt-2 max-w-full rounded-lg max-h-48 object-contain ${className ?? ''}`}
    />
  );
}
