import { ValidationError, useForm } from "@formspree/react";
import { PerformanceMonitor, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useAtom } from "jotai";
import Lenis from "lenis";
import { Suspense, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { education, experience, languages, profile, stack } from "../data/profile";
import { projects as allProjects } from "../data/projects";
import { cvUrl, useCvAvailable } from "../lib/useCv";
import { AvatarTracker, Scene } from "../scene/Scene";
import { homeSectionAtom } from "../state";

const SECTIONS = [
  { id: "intro", label: "Intro" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

const featured = allProjects.filter((p) => p.featured);

const projectUrl = (p) => {
  const link = p.links.find((l) => l.label.toLowerCase().includes("live")) || p.links[0];
  return link ? link.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : p.slug;
};

// ---------------------------------------------------------------------------------------------

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

const Label = ({ index, children }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
    {index && <span className="text-accent">{index}</span>}
    {index && " — "}
    {children}
  </p>
);

const LightSwitch = ({ on, onToggle }) => (
  <button
    onClick={onToggle}
    aria-pressed={on}
    title={on ? "Turn the room lights off" : "Turn the room lights on"}
    className="group flex items-center gap-2 rounded-full border border-line bg-card/70 py-1 pl-1 pr-3 text-xs font-medium text-muted backdrop-blur transition-colors hover:text-ink"
  >
    <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-ink" : "bg-paper-2"}`}>
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full shadow-sm transition-all duration-300 ${
          on ? "left-[18px] bg-[#ffd27a]" : "left-0.5 bg-white"
        }`}
      />
    </span>
    {on ? "Evening" : "Daylight"}
  </button>
);

const Nav = ({ active, onJump, evening, toggleEvening }) => {
  const time = useTunisTime();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line/80 bg-paper/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
        <button onClick={() => onJump(0)} className="text-left leading-none">
          <span className="block font-serif text-2xl text-ink">Yassine Cherni</span>
          <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.18em] text-muted mt-1">
            Tunisia · {time}
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {SECTIONS.slice(1).map((s, i) => (
            <button
              key={s.id}
              onClick={() => onJump(i + 1)}
              data-active={active === i + 1}
              className={`link-draw pb-0.5 transition-colors ${active === i + 1 ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {s.label}
            </button>
          ))}
          <Link to="/projects" className="link-draw pb-0.5 text-muted hover:text-ink">
            All projects
          </Link>
          <LightSwitch on={evening} onToggle={toggleEvening} />
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-full border border-line bg-card/80 px-4 py-2 text-sm font-medium"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-line px-5 pb-6 pt-2">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                onJump(i);
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
            <LightSwitch on={evening} onToggle={toggleEvening} />
          </div>
        </div>
      )}
    </header>
  );
};

// ---------------------------------------------------------------------------------------------

const Loader = ({ onDone }) => {
  const { progress, active } = useProgress();
  const [gone, setGone] = useState(false);
  const done = progress >= 100 && !active;
  useEffect(() => {
    if (done) {
      onDone?.();
      const id = setTimeout(() => setGone(true), 700);
      return () => clearTimeout(id);
    }
  }, [done]);
  if (gone) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper transition-opacity duration-700 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <p className="font-serif text-5xl md:text-7xl">Yassine Cherni</p>
      <div className="mt-6 h-px w-56 bg-line">
        <div className="h-px bg-ink transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Tidying the desk · {Math.round(progress)}%</p>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------

const Section = ({ index, innerRef, children, className = "" }) => (
  <section
    ref={innerRef}
    id={SECTIONS[index].id}
    className={`relative flex min-h-screen items-end md:items-center px-5 md:px-10 ${className}`}
  >
    <div className="pointer-events-auto mx-auto w-full max-w-[1400px] pb-10 md:pb-0">
      <div className="max-w-[540px] rounded-3xl bg-paper/90 p-5 backdrop-blur-sm md:bg-transparent md:p-0 md:backdrop-blur-none">
        {children}
      </div>
    </div>
  </section>
);

const Intro = ({ onJump }) => (
  <>
    <div data-reveal style={{ "--d": "0ms" }}>
      <Label>Portfolio · {new Date().getFullYear()}</Label>
    </div>
    <h1 data-reveal-lines className="mt-5 font-serif text-[clamp(3rem,6.2vw,5.8rem)] leading-[0.95] tracking-[-0.01em]">
      <span className="line-mask">
        <span style={{ "--d": "120ms" }}>I build software</span>
      </span>
      <span className="line-mask">
        <span style={{ "--d": "260ms" }}>
          <em className="text-accent">end to end.</em>
        </span>
      </span>
    </h1>
    <p data-reveal style={{ "--d": "450ms" }} className="mt-6 max-w-[440px] text-[17px] leading-relaxed text-muted">
      Hi, I'm Yassine, a full-stack engineer from Tunisia. Spring Boot services, Next.js and Angular front ends, AI
      features, and the pipelines that ship them.
    </p>
    <div data-reveal style={{ "--d": "600ms" }} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
      <button
        onClick={() => onJump(3)}
        className="group rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-paper transition-transform hover:-translate-y-0.5"
      >
        See my work <span className="inline-block transition-transform group-hover:translate-y-0.5">↓</span>
      </button>
      <a href={`mailto:${profile.email}`} className="link-draw text-[15px] font-medium">
        or write to me
      </a>
    </div>
  </>
);

const About = () => (
  <>
    <div data-reveal>
      <Label index="01">About</Label>
    </div>
    <h2 data-reveal style={{ "--d": "100ms" }} className="mt-4 font-serif text-[clamp(2.4rem,4.4vw,4rem)] leading-[1]">
      From the database schema <em className="text-accent">to the last pixel.</em>
    </h2>
    <p data-reveal style={{ "--d": "200ms" }} className="mt-5 text-[16px] leading-relaxed text-muted">
      Engineering degree in computer science at ESPRIT (2023–2026), freelancing since 2019. For my final-year project
      at Medianet I designed and shipped their startup-incubation platform: six Spring Boot services, two Next.js apps,
      AI pitch analysis and the CI/CD that deploys it.
    </p>
    <dl data-reveal style={{ "--d": "300ms" }} className="mt-7 divide-y divide-line border-y border-line">
      {stack.map((group) => (
        <div key={group.group} className="grid grid-cols-[110px_1fr] gap-4 py-3 text-[14px]">
          <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted pt-0.5">{group.group}</dt>
          <dd className="text-ink">{group.items.join(" · ")}</dd>
        </div>
      ))}
      <div className="grid grid-cols-[110px_1fr] gap-4 py-3 text-[14px]">
        <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted pt-0.5">Languages</dt>
        <dd>{languages.map((l) => `${l.name} (${l.level})`).join(" · ")}</dd>
      </div>
    </dl>
  </>
);

const Experience = ({ openProject }) => (
  <>
    <div data-reveal>
      <Label index="02">Experience</Label>
    </div>
    <h2 data-reveal style={{ "--d": "100ms" }} className="mt-4 font-serif text-[clamp(2.4rem,4.4vw,4rem)] leading-[1]">Where I've worked.</h2>
    <ol data-reveal style={{ "--d": "200ms" }} className="mt-7 border-t border-line">
      {experience.map((job) => (
        <li key={job.title} className="grid grid-cols-[92px_1fr] gap-4 border-b border-line py-3.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted pt-1">{job.period}</span>
          <div>
            <p className="text-[15px] font-medium leading-snug">{job.title}</p>
            <p className="text-[14px] text-muted">{job.org}</p>
            {job.project && (
              <button onClick={() => openProject(job.project)} className="link-draw mt-1 text-[13px] font-medium text-accent-ink">
                Read the case study →
              </button>
            )}
          </div>
        </li>
      ))}
    </ol>
    <p className="mt-4 text-[13px] text-muted">
      {education.map((e) => `${e.title}, ${e.org} (${e.period})`).join(" · ")}
    </p>
  </>
);

const Work = ({ selected, setSelected, openProject }) => {
  const project = featured[selected];
  return (
    <>
        <div data-reveal>
        <Label index="03">Selected work</Label>
      </div>
      <p data-reveal style={{ "--d": "100ms" }} className="mt-3 text-[14px] text-muted">
        Pick a project: it opens on the monitor. <span className="hidden md:inline">(↑ ↓ work too)</span>
      </p>
      <ol data-reveal style={{ "--d": "200ms" }} className="mt-5 border-t border-line">
        {featured.map((p, i) => (
          <li key={p.slug} className="border-b border-line">
            <button
              onMouseEnter={() => setSelected(i)}
              onFocus={() => setSelected(i)}
              onClick={() => (i === selected ? openProject(p.slug) : setSelected(i))}
              className="group flex w-full items-baseline gap-4 py-3 text-left"
            >
              <span className={`font-mono text-[11px] ${i === selected ? "text-accent" : "text-muted"}`}>0{i + 1}</span>
              <span
                className={`font-serif text-[clamp(1.7rem,2.6vw,2.4rem)] leading-none transition-colors ${
                  i === selected ? "text-ink" : "text-muted/70 group-hover:text-ink"
                }`}
              >
                {p.title}
              </span>
              <span className={`ml-auto text-sm transition-opacity ${i === selected ? "opacity-100" : "opacity-0"}`}>→</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-5 min-h-[92px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {project.year} · {project.context}
        </p>
        <p className="mt-1 text-[15px] leading-relaxed">{project.tagline}.</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            onClick={() => openProject(project.slug)}
            className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Read the case study
          </button>
          <Link to="/projects" className="link-draw text-[14px] font-medium">
            All {allProjects.length} projects
          </Link>
        </div>
      </div>
    </>
  );
};

const Contact = ({ mailRef }) => {
  const [state, handleSubmit] = useForm("mgegpwwl");
  const [copied, setCopied] = useState(false);
  const cvAvailable = useCvAvailable();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  // Mirror the form onto the monitor in the room
  const mirror = (key) => (e) => {
    mailRef.current[key] = e.target.value;
  };
  const field =
    "w-full border-0 border-b border-line bg-transparent px-0 py-2.5 text-[15px] placeholder:text-muted/60 focus:border-ink focus:outline-hidden focus:ring-0 transition-colors";

  return (
    <>
      <div data-reveal>
      <Label index="04">Contact</Label>
    </div>
      <h2 data-reveal style={{ "--d": "100ms" }} className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.95]">
        Let's build <em className="text-accent">something.</em>
      </h2>
      <p className="mt-5 text-[16px] leading-relaxed text-muted">
        Hiring for a full-stack role, or have a project in mind? Write below and watch it land on my screen.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button onClick={copy} className="group flex items-center gap-3 rounded-full border border-ink px-5 py-2.5 text-[15px] font-medium transition-colors hover:bg-ink hover:text-paper">
          {profile.email}
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted group-hover:text-paper/70">
            {copied ? "copied" : "copy"}
          </span>
        </button>
        {cvAvailable && (
          <a href={cvUrl} download className="link-draw text-[15px] font-medium">
            Download CV
          </a>
        )}
      </div>

      {state.succeeded ? (
        <p className="mt-8 font-serif text-2xl">Thanks, I'll get back to you soon.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <input aria-label="Name" name="name" required placeholder="Your name" className={field} onChange={mirror("name")} />
          <input aria-label="Email" type="email" name="email" required placeholder="Your email" className={field} onChange={mirror("email")} />
          <textarea aria-label="Message" name="message" required rows={3} placeholder="What are you working on?" className={`${field} sm:col-span-2 resize-none`} onChange={mirror("message")} />
          <ValidationError className="text-sm text-accent-ink sm:col-span-2" errors={state.errors} />
          <button
            disabled={state.submitting}
            className="justify-self-start rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {state.submitting ? "Sending…" : "Send message"}
          </button>
        </form>
      )}

      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="link-draw">LinkedIn ↗</a>
        <a href={profile.github} target="_blank" rel="noreferrer" className="link-draw">GitHub ↗</a>
        <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="link-draw">{profile.phone}</a>
      </div>
      <p className="mt-10 text-[12px] leading-relaxed text-muted">
        Room model and baked lighting from{" "}
        <a href="https://github.com/brunosimon/my-room-in-3d" target="_blank" rel="noreferrer" className="underline underline-offset-2">
          Bruno Simon's “My Room in 3D”
        </a>
        . Built with React Three Fiber.
      </p>
    </>
  );
};

// ---------------------------------------------------------------------------------------------

export const Home = () => {
  const navigate = useNavigate();
  const [requested, setRequested] = useAtom(homeSectionAtom);
  const sectionEls = useRef([]);
  const progressRef = useRef(0);
  const nightRef = useRef(0);
  // What the monitor shows: { project } in the work section, { mail } (the contact form) in contact
  const screenRef = useRef({});
  const mailRef = useRef({ name: "", email: "", message: "" });
  const pointerRef = useRef({ x: 0, y: 0 });
  const lookRef = useRef(0); // 1 = the avatar turns to look at you (contact section)
  const [active, setActive] = useState(0);
  // Evening light by default when it is evening in Tunis
  const [evening, setEvening] = useState(() => {
    const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Africa/Tunis" }).format(new Date()));
    return hour >= 19 || hour < 6;
  });
  const [ready, setReady] = useState(false);
  const [dpr, setDpr] = useState(() => Math.min(1.5, window.devicePixelRatio));
  const lenisRef = useRef(null);
  const [selected, setSelected] = useState(0);

  const jump = (index) => {
    const el = sectionEls.current[index];
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Inertial smooth scrolling (skipped for reduced motion and touch, which scroll natively)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reveal content as it scrolls into view, starting once the loader is gone
  useEffect(() => {
    if (!ready) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll("[data-reveal], [data-reveal-lines]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ready]);

  const openProject = (slug) => {
    setRequested({ index: 3, at: Date.now() });
    navigate(`/projects/${slug}`);
  };

  // Coming back from a case study (or a "Contact" link elsewhere): land on the right section
  useEffect(() => {
    if (requested.index > 0) {
      const el = sectionEls.current[requested.index];
      if (el) window.scrollTo({ top: el.offsetTop, behavior: "instant" });
      setRequested({ index: 0, at: 0 });
    }
  }, []);

  // Scroll position → camera progress (a float across sections) and the active section
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const els = sectionEls.current;
      let p = 0;
      let current = 0;
      els.forEach((el, i) => {
        if (!el) return;
        if (y >= el.offsetTop - 1) p = i + Math.min(1, (y - el.offsetTop) / el.offsetHeight);
        if (y + vh * 0.5 >= el.offsetTop) current = i;
      });
      progressRef.current = Math.min(p, els.length - 1);
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const tip = document.getElementById("room-tip");
    const onMove = (e) => {
      pointerRef.current.x = e.clientX / window.innerWidth - 0.5;
      pointerRef.current.y = e.clientY / window.innerHeight - 0.5;
      if (tip) tip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // The room goes to evening light in the contact section, or when the switch says so
  useEffect(() => {
    nightRef.current = evening || active === 4 ? 1 : 0;
    lookRef.current = active === 4 ? 1 : 0;
  }, [evening, active]);

  // The monitor shows the selected project in the work section, and the visitor's message as they
  // write it in the contact section
  useEffect(() => {
    const p = featured[selected];
    screenRef.current = {
      project:
        active === 3 ? { title: p.title, image: `${import.meta.env.BASE_URL}${p.gallery?.[0]?.src || p.cover}`, url: projectUrl(p) } : null,
      mail: active === 4 ? mailRef.current : null,
    };
  }, [active, selected]);

  // Arrow keys move through projects while the work section is active
  useEffect(() => {
    const onKey = (e) => {
      if (active !== 3) return;
      if (e.key === "ArrowDown") setSelected((s) => Math.min(featured.length - 1, s + 1));
      if (e.key === "ArrowUp") setSelected((s) => Math.max(0, s - 1));
      if (e.key === "ArrowDown" || e.key === "ArrowUp") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const setRef = (i) => (el) => (sectionEls.current[i] = el);

  // Clicking things in the room
  const onRoomAction = (action) => {
    if (action === "lights") setEvening((v) => !v);
    else jump(SECTIONS.findIndex((x) => x.id === action));
  };

  return (
    <div className="font-sans text-ink">
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ fov: 20, near: 0.1, far: 150, position: [-18.9, 15.6, 18.9] }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          dpr={dpr}
        >
          {/* Drop the pixel ratio on machines that can't keep up, raise it back when they can */}
          <PerformanceMonitor
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr(Math.min(1.5, window.devicePixelRatio))}
          />
          <Suspense fallback={null}>
            <Scene
              progressRef={progressRef}
              nightRef={nightRef}
              screenRef={screenRef}
              pointerRef={pointerRef}
              lookRef={lookRef}
              onAction={onRoomAction}
            />
            <AvatarTracker targetId="avatar-note" visibleRef={progressRef} />
          </Suspense>
        </Canvas>
      </div>

      {/* The room fades into the paper behind the text column (desktop) */}
      <div className="pointer-events-none fixed inset-0 z-[5] hidden md:block bg-[linear-gradient(90deg,var(--color-paper)_0%,var(--color-paper)_30%,color-mix(in_srgb,var(--color-paper)_70%,transparent)_42%,transparent_58%)]" />

      {/* Handwritten note that follows the avatar in the intro */}
      <div
        id="avatar-note"
        className="pointer-events-none fixed left-0 top-0 z-10 hidden md:block opacity-0 transition-opacity duration-500"
        style={{ willChange: "transform" }}
      >
        <div className="relative text-ink">
          <span className="absolute -left-[400px] -top-[205px] -rotate-6 whitespace-nowrap font-hand text-[30px] leading-none">
            that's me, writing Java
          </span>
          <svg width="200" height="170" viewBox="0 0 200 170" fill="none" className="absolute -left-[205px] -top-[180px]">
            <path d="M8 20 C 70 8, 150 40, 186 150" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M174 140 L186 152 L192 136" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Label for clickable things in the room */}
      <div
        id="room-tip"
        data-show="false"
        className="pointer-events-none fixed left-0 top-0 z-50 rounded-full bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper opacity-0 transition-opacity duration-150 data-[show=true]:opacity-100"
      />

      <Loader onDone={() => setReady(true)} />
      <Nav active={active} onJump={jump} evening={evening} toggleEvening={() => setEvening((v) => !v)} />

      <main className="pointer-events-none relative z-20">
        <Section index={0} innerRef={setRef(0)}>
          <Intro onJump={jump} />
        </Section>
        <Section index={1} innerRef={setRef(1)}>
          <About />
        </Section>
        <Section index={2} innerRef={setRef(2)}>
          <Experience openProject={openProject} />
        </Section>
        <Section index={3} innerRef={setRef(3)}>
          <Work selected={selected} setSelected={setSelected} openProject={openProject} />
        </Section>
        <Section index={4} innerRef={setRef(4)} className="pb-16">
          <Contact mailRef={mailRef} />
        </Section>
      </main>
    </div>
  );
};
