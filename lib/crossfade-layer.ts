/* Stacking for a cross-dissolve between frames that sit on top of each other.

   The naive version — fade the outgoing frame to 0 while the incoming rises to 1 — leaves
   both layers partly transparent through the middle of the dissolve, so whatever sits
   behind them shows through and the swap reads as a dark flicker. Instead only the
   incoming frame animates, held above an outgoing frame that stays fully opaque until it
   is completely covered.

   `settledIndex` is the last frame to finish dissolving; while it trails `activeIndex` it
   is the frame being dissolved away from. */
export function crossfadeLayer(index: number, activeIndex: number, settledIndex: number) {
  return {
    opacity: index === activeIndex || index === settledIndex ? 1 : 0,
    zIndex: index === activeIndex ? 3 : index === settledIndex ? 2 : 1,
  }
}
