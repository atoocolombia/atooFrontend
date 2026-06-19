import { useEffect, useState } from 'react';
import { defaultLandingContent, type LandingContent } from '../app/data/landingContent';
import { fetchLandingContent } from './landingApi';

let cachedContent: LandingContent | null = null;
let fetchPromise: Promise<LandingContent | null> | null = null;

function loadLandingContent(): Promise<LandingContent | null> {
  if (cachedContent) return Promise.resolve(cachedContent);
  if (!fetchPromise) {
    fetchPromise = fetchLandingContent().then((data) => {
      if (data) cachedContent = data;
      return data;
    });
  }
  return fetchPromise;
}

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent>(cachedContent ?? defaultLandingContent());
  const [loading, setLoading] = useState(!cachedContent);

  useEffect(() => {
    let cancelled = false;
    loadLandingContent()
      .then((data) => {
        if (!cancelled && data) {
          setContent(data);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { content, loading };
}
