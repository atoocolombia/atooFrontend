/** Cintilla diagonal «Agotado» sobre la imagen del vehículo en la landing. */
export function SoldOutRibbon() {
  return (
    <div className="absolute top-0 left-0 z-20 w-36 h-36 overflow-hidden pointer-events-none">
      <span className="absolute top-5 -left-10 block w-44 -rotate-45 bg-red-600 text-white text-xs font-bold uppercase tracking-wider text-center py-2 shadow-lg ring-2 ring-white/30">
        Agotado
      </span>
    </div>
  );
}
