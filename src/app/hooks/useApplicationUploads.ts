import { useState } from 'react';
import { ApiError } from '../../lib/api';
import { uploadUserDocument, type UserDocumentMeta } from '../../lib/documentsApi';

export function useApplicationUploads(
  userId: string,
  onDocumentUploaded: (doc: UserDocumentMeta) => void,
) {
  const [uploadingKinds, setUploadingKinds] = useState<Set<string>>(() => new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const upload = async (documentKind: string, file: File) => {
    setUploadingKinds((prev) => new Set(prev).add(documentKind));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[documentKind];
      return next;
    });

    try {
      const doc = await uploadUserDocument(userId, documentKind, file);
      onDocumentUploaded(doc);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo subir el archivo. Inténtalo de nuevo.';
      setErrors((prev) => ({ ...prev, [documentKind]: message }));
    } finally {
      setUploadingKinds((prev) => {
        const next = new Set(prev);
        next.delete(documentKind);
        return next;
      });
    }
  };

  return {
    isUploading: (kind: string) => uploadingKinds.has(kind),
    getError: (kind: string) => errors[kind] ?? null,
    upload,
  };
}
