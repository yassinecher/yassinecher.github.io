// Soft, slowly drifting colour fields behind the transparent 3D canvas. Each home section has its
// own palette, so the page changes mood as you scroll.
const PALETTES = [
  ["#fcd34d", "#fda4af", "#93c5fd"], // About: amber, rose, sky
  ["#93c5fd", "#c4b5fd", "#fcd34d"], // Stack: sky, violet, amber
  ["#6ee7b7", "#93c5fd", "#fde68a"], // Experience: emerald, sky, amber
  ["#c4b5fd", "#f9a8d4", "#fcd34d"], // Projects: violet, pink, amber
  ["#fdba74", "#fcd34d", "#fda4af"], // Contact: orange, amber, rose
];

export const Backdrop = ({ section = 0 }) => {
  const [a, b, c] = PALETTES[section] || PALETTES[0];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-paper">
      <div className="blob blob-1" style={{ backgroundColor: a }} />
      <div className="blob blob-2" style={{ backgroundColor: b }} />
      <div className="blob blob-3" style={{ backgroundColor: c }} />
      <div className="absolute inset-0 dot-grid" />
    </div>
  );
};
