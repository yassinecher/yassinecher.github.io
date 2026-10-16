// Little hand-drawn marks next to the avatar's head, in the same hand as the intro note: they say
// how he feels. The wrapper is moved onto his head every frame by AvatarTracker (Scene.jsx).

const Heart = ({ style }) => (
  <svg viewBox="0 0 24 22" className="mood-heart absolute h-6 w-6 text-accent" style={style}>
    <path
      d="M12 20.5C7.4 17.4 2.6 13.6 2.2 8.6 1.9 5.2 4.4 2.6 7.3 2.8c2 .1 3.5 1.4 4.7 3.3 1.2-1.9 2.7-3.2 4.7-3.3 2.9-.2 5.4 2.4 5.1 5.8-.4 5-5.2 8.8-9.8 11.9z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const Drawing = ({ name }) => {
  if (name === "love")
    return (
      <span className="absolute -left-2 bottom-7 h-20 w-16">
        <Heart style={{ left: 2, bottom: 0, "--d": "0s", "--x": "-10px", "--r": "-12deg" }} />
        <Heart style={{ left: 26, bottom: 6, "--d": "0.7s", "--x": "8px", "--r": "10deg", transform: "scale(0.75)" }} />
        <Heart style={{ left: 12, bottom: 2, "--d": "1.4s", "--x": "-2px", "--r": "-4deg" }} />
      </span>
    );
  if (name === "excited")
    return (
      <svg viewBox="0 0 60 44" fill="none" className="mood-draw absolute -left-1 bottom-7 h-11 w-14 text-accent" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M8 34 L2 22" style={{ "--d": "0s" }} />
        <path d="M22 28 L22 8" style={{ "--d": "0.08s" }} />
        <path d="M36 34 L48 20" style={{ "--d": "0.16s" }} />
      </svg>
    );
  if (name === "interested")
    return (
      <span className="absolute left-1 bottom-8 flex gap-1.5 text-ink">
        {[0, 0.15, 0.3].map((d) => (
          <span key={d} className="mood-dot h-2 w-2 rounded-full bg-current" style={{ "--d": `${d}s` }} />
        ))}
      </span>
    );
  if (name === "annoyed")
    return (
      <svg viewBox="0 0 64 24" fill="none" className="mood-draw absolute left-0 bottom-7 h-6 w-16 text-ink" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14c4-9 7 9 11 0s7 9 11 0 7 9 11 0 7 9 11 0 7 9 11 0" style={{ "--d": "0s", "--len": 90 }} />
      </svg>
    );
  if (name === "startled")
    return (
      <svg viewBox="0 0 64 48" fill="none" className="mood-draw mood-shake absolute -left-2 bottom-7 h-12 w-16 text-accent" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        {/* the cross little "vein" mark, and an exclamation */}
        <path d="M8 14c5 1 7 3 8 8M30 14c-5 1-7 3-8 8M8 34c5-1 7-3 8-8M30 34c-5-1-7-3-8-8" style={{ "--d": "0s", "--len": 30 }} />
        <path d="M48 6 L46 30" style={{ "--d": "0.15s" }} />
        <path d="M45.5 40 L45.4 40.5" style={{ "--d": "0.3s", "--len": 4 }} />
      </svg>
    );
  // upset: a small scribbled storm cloud
  return (
    <svg viewBox="0 0 64 44" fill="none" className="mood-draw mood-shake absolute -left-2 bottom-6 h-11 w-16 text-ink" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 26c-6 0-8-8-2-10 0-7 9-9 12-4 3-6 13-6 15 1 7-1 10 7 4 11-1 2-3 2-5 2H12z" style={{ "--d": "0s", "--len": 120 }} />
      <path d="M20 33l-3 6M30 33l-3 6M40 33l-3 6" style={{ "--d": "0.25s" }} />
    </svg>
  );
};

export const MoodMarks = ({ mood }) => (
  <div id="avatar-mood" aria-hidden className="pointer-events-none fixed left-0 top-0 z-10" style={{ willChange: "transform" }}>
    {mood && (
      <div
        key={mood.name + mood.line}
        data-leaving={!!mood.leaving}
        className="mood absolute -top-[132px] left-[22px] md:-top-[150px] md:left-[30px]"
      >
        <Drawing name={mood.name} />
        <span className="block -rotate-6 whitespace-nowrap font-hand text-[22px] leading-none text-ink md:text-[28px]">
          {mood.line}
        </span>
      </div>
    )}
  </div>
);
