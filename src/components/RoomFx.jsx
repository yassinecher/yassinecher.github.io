import { useEffect, useState } from "react";

// Little drawn effects on top of the room, where something happened: a puff of dust where you
// tapped him, sound waves "(( ))" when the guitar plays. The 3D scene asks for one with
// `roomFx(kind, x, y)` (screen coordinates); each lasts about a second.

export const roomFx = (kind, x, y) => window.dispatchEvent(new CustomEvent("room-fx", { detail: { kind, x, y } }));

// soft, warm-grey puffs, as from a dusty cushion, with a few specks thrown out
const Dust = () => (
  <svg viewBox="-50 -50 100 100" className="h-28 w-28" aria-hidden>
    <defs>
      <radialGradient id="puff">
        <stop offset="0" stopColor="rgb(232,224,210)" stopOpacity="0.95" />
        <stop offset="1" stopColor="rgb(226,216,200)" stopOpacity="0" />
      </radialGradient>
    </defs>
    {[
      [-12, -4, 14, 0],
      [10, -10, 12, 0.04],
      [6, 10, 13, 0.08],
      [-10, 12, 10, 0.06],
      [18, 6, 9, 0.1],
      [-20, -14, 8, 0.12],
    ].map(([cx, cy, r, d]) => (
      <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} fill="url(#puff)" className="fx-puff" style={{ "--d": `${d}s`, "--x": `${cx * 1.2}px`, "--y": `${cy * 1.2 - 8}px` }} />
    ))}
    {[
      [-34, -22],
      [32, -26],
      [-36, 18],
      [30, 26],
      [4, -36],
    ].map(([x, y]) => (
      <circle key={`s${x}${y}`} cx={x * 0.3} cy={y * 0.3} r="1.8" fill="rgb(226,216,200)" className="fx-speck" style={{ "--x": `${x}px`, "--y": `${y}px` }} />
    ))}
  </svg>
);

const Waves = () => (
  <svg viewBox="-60 -30 120 60" className="h-16 w-32 text-accent" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
    {[0, 0.12, 0.24].map((d, i) => (
      <g key={d} className="fx-wave" style={{ "--d": `${d}s`, "--i": i }}>
        <path d={`M${-14 - i * 10} -${12 + i * 5}c-${6 + i * 2} ${6 + i * 3}-${6 + i * 2} ${18 + i * 7} 0 ${24 + i * 10}`} />
        <path d={`M${14 + i * 10} -${12 + i * 5}c${6 + i * 2} ${6 + i * 3} ${6 + i * 2} ${18 + i * 7} 0 ${24 + i * 10}`} />
      </g>
    ))}
  </svg>
);

export const RoomFx = () => {
  const [effects, setEffects] = useState([]);
  useEffect(() => {
    let next = 0;
    const add = (e) => {
      const effect = { ...e.detail, id: next++ };
      setEffects((list) => [...list.slice(-5), effect]);
      setTimeout(() => setEffects((list) => list.filter((x) => x.id !== effect.id)), 1100);
    };
    window.addEventListener("room-fx", add);
    return () => window.removeEventListener("room-fx", add);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[36]">
      {effects.map((fx) => (
        <div key={fx.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: fx.x, top: fx.y }}>
          {fx.kind === "dust" ? <Dust /> : <Waves />}
        </div>
      ))}
    </div>
  );
};
