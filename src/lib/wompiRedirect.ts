/** URL actual del portal + ?wompi=return para volver a la misma pantalla tras Wompi. */
export function buildWompiReturnUrl(): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set('wompi', 'return');
  return url.toString();
}