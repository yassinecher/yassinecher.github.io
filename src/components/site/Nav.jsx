import { useSetAtom } from "jotai";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isMuted, setMuted, subscribeSound } from "../../lib/sound";
import { useLights } from "../../lib/theme";
import { homeSectionAtom } from "../../state";

// The home page sections, in order; the case-study pages link back into them.
export const SECTIONS = [
  { id: "intro", label: "Intro" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

export const useGoHome = () => {
  const navigate = useNavigate();
  const setHomeSection = useSetAtom(homeSectionAtom);
  return (section = 0) => {
    setHomeSection({ index: section, at: Date.now() });
    navigate("/");
  };
};

const useTunisTime = () => {
  const format = () =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Tunis" }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
};

// Sound on or off for the room (the guitar, the TV)
const SoundToggle = () => {
  const muted = useSyncExternalStore(subscribeSound, isMuted, () => false);
  return (
    <button
      onClick={() => setMuted(!muted)}
      aria-pressed={muted}
      aria-label={muted ? "Turn the sound on" : "Turn the sound off"}
      title={muted ? "Sound off" : "Sound on"}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line bg-card/70 text-muted backdrop-blur transition-colors hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        {muted ? (
          <path d="m22 9-6 6m0-6 6 6" />
        ) : (
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
        )}
      </svg>
    </button>
  );
};

const LightSwitch = () => {
  const { evening, toggle } = useLights();
  return (
    <button
      onClick={toggle}
      aria-pressed={evening}
      title={evening ? "Back to daylight" : "Switch to the evening lights"}
      className="group flex items-center gap-2 rounded-full border border-line bg-card/70 py-1 pl-1 pr-3 text-xs font-medium text-muted backdrop-blur transition-colors hover:text-ink"
    >
      <span className={`relative h-5 w-9 rounded-full transition-colors ${evening ? "bg-ink" : "bg-paper-2"}`}>
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full shadow-sm transition-all duration-300 ${
            evening ? "left-[18px] bg-[#ffd27a]" : "left-0.5 bg-white"
          }`}
        />
      </span>
      {evening ? "Evening" : "Daylight"}
    </button>
  );
};

// One header for the whole site. On the home page `onJump` scrolls to a section and `active` is
// the section on screen; elsewhere the same links go back to the home page at that section.
export const SiteNav = ({ active = -1, onJump }) => {
  const goHome = useGoHome();
  const jump = onJump ?? goHome;
  const { pathname } = useLocation();
  const onProjects = pathname.startsWith("/projects");
  const time = useTunisTime();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    // Read once per frame at most, not on every scroll event
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 20);
      });
    };
    setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line/80 bg-paper/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
        <button onClick={() => jump(0)} className="text-left leading-none">
          <span className="block font-serif text-2xl text-ink">Yassine Cherni</span>
          <span className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:block">
            Tunisia · {time}
          </span>
        </button>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {SECTIONS.slice(1).map((s, i) => (
            <button
              key={s.id}
              onClick={() => jump(i + 1)}
              data-active={active === i + 1}
              className={`link-draw pb-0.5 transition-colors ${active === i + 1 ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {s.label}
            </button>
          ))}
          <Link
            to="/projects"
            data-active={onProjects}
            className={`link-draw pb-0.5 transition-colors ${onProjects ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            All projects
          </Link>
          <div className="flex items-center gap-2">
            <SoundToggle />
            <LightSwitch />
          </div>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-full border border-line bg-card/80 px-4 py-2 text-sm font-medium md:hidden"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="border-t border-line px-5 pb-6 pt-2 md:hidden">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                jump(i);
                setOpen(false);
              }}
              className="flex w-full items-baseline justify-between border-b border-line py-4 text-left"
            >
              <span className="font-serif text-3xl">{s.label}</span>
              <span className="font-mono text-xs text-muted">0{i}</span>
            </button>
          ))}
          <div className="mt-4 flex items-center justify-between">
            <Link to="/projects" className="font-medium underline underline-offset-4">
              All projects
            </Link>
            <div className="flex items-center gap-2">
              <SoundToggle />
              <LightSwitch />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
