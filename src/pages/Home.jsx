import { ValidationError, useForm } from "@formspree/react";
import { PerformanceMonitor, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useAtom, useSetAtom } from "jotai";
import Lenis from "lenis";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoodMarks } from "../components/MoodMarks";
import { SECTIONS, SiteNav } from "../components/site/Nav";
import { education, experience, languages, profile, stack } from "../data/profile";
import { projects as allProjects } from "../data/projects";
import { sceneEveningAtom, useLights } from "../lib/theme";
import { cvUrl, useCvAvailable } from "../lib/useCv";
import { AvatarTracker, FrameDriver, Scene } from "../scene/Scene";
import { homeSectionAtom } from "../state";

const featured = allProjects.filter((p) => p.featured);

// What he says (in the handwritten note by his head) for each mood
const MOOD_LINES = {
  interested: "go on…",
  love: "got it, thank you!",
  upset: "that didn't go through",
  annoyed: "almost done here",
  startled: "one moment!",
  reading: "reading…",
};
// Hovering him while he works, and poking him (a click)
const ANNOYED_LINES = ["almost done here", "after this commit…", "in the zone, one sec"];
const STARTLED_LINES = ["one moment!", "be right with you", "just finishing this"];
// Showing a project: something true about it, from the project data
const excitedLine = (project, count) => {
  const live = project.links.some((link) => /live/i.test(link.label));
  const lines = [live ? "it's live, go try it" : null, `${project.stack[0]} + ${project.stack[1]}`, "ask me about this one"];
  const usable = lines.filter(Boolean);
  return usable[count % usable.length];
};

const projectUrl = (p) => {
  const link = p.links.find((l) => l.label.toLowerCase().includes("live")) || p.links[0];
  return link ? link.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : p.slug;
};

// ---------------------------------------------------------------------------------------------

const PHONE = "(max-width: 767px)";
const usePhone = () => {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches);
  useEffect(() => {
    const query = window.matchMedia(PHONE);
    const change = () => setPhone(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return phone;
};

const Label = ({ index, children }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
    {index && <span className="text-accent">{index}</span>}
    {index && " — "}
    {children}
  </p>
);

// The page is usable straight away; this small note tracks the room while it loads, and the
// canvas fades in once everything is there.
const RoomLoader = ({ onDone }) => {
  const { progress, active } = useProgress();
  const done = progress >= 100 && !active;
  useEffect(() => {
    if (done) onDone?.();
  }, [done]);
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed bottom-6 right-6 z-30 flex items-center gap-3 rounded-full border border-line bg-card/90 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted backdrop-blur transition-opacity duration-700 md:right-10 ${
        done ? "opacity-0" : "opacity-100"
      }`}
    >
      <span className="relative h-1 w-16 overflow-hidden rounded-full bg-line">
        <span className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </span>
      Setting up the studio
    </div>
  );
};

// ---------------------------------------------------------------------------------------------

// On phones the room has its own panel at the top (Home), and each section's text starts below it
const Section = ({ index, innerRef, children, className = "" }) => (
  <section
    ref={innerRef}
    id={SECTIONS[index].id}
    className={`relative flex min-h-screen items-start pt-[calc(46svh+5.5rem)] md:items-center md:pt-0 px-5 md:px-10 ${className}`}
  >
    {/* Only the text column takes the pointer: the rest of the screen is the room, which you can
        hover and click (him, the monitor, the TV...) */}
    <div className="mx-auto w-full max-w-[1400px] pb-10 md:pb-0">
      <div className="pointer-events-auto max-w-[540px]">
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

const Contact = ({ mailRef, feel }) => {
  const [state, handleSubmit] = useForm("mgegpwwl");
  const [copied, setCopied] = useState(false);
  // Shown a moment after a failed send, once he's had his "oh no"
  const [failed, setFailed] = useState(false);
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
  // Mirror the form onto the monitor in the room. While you write he's busy with it: back to his
  // monitor, reading it as it lands there. When you pause he turns to you with a word: your name
  // once you've written it, your address, a long message.
  const pause = useRef(0);
  useEffect(() => () => clearTimeout(pause.current), []);
  const react = (key, value) => {
    let line = "go on…";
    if (key === "name") {
      const first = value.trim().split(/\s+/)[0].slice(0, 16);
      line = first.length > 1 ? `nice to meet you, ${first}` : "and your name is…?";
    }
    if (key === "email") line = value.includes("@") ? "I'll reply there" : "where should I reply?";
    if (key === "message") line = value.length > 140 ? "tell me more" : "sounds interesting";
    feel("interested", 3200, { look: true, line });
  };
  const mirror = (key) => (e) => {
    const value = e.target.value;
    mailRef.current[key] = value;
    feel("reading", 2000);
    clearTimeout(pause.current);
    pause.current = setTimeout(() => react(key, value), 2000);
  };
  useEffect(() => {
    mailRef.current.sent = state.succeeded;
    // It landed: he turns around, all smiles
    if (state.succeeded) feel("love", 7500, { look: true });
  }, [state.succeeded]);
  // It didn't go through: he's upset for a moment, then the page says where to write instead
  useEffect(() => {
    if (!state.errors || state.submitting) return;
    mailRef.current.failed = true;
    feel("upset", 6500, { look: true });
    const id = setTimeout(() => setFailed(true), 1500);
    return () => clearTimeout(id);
  }, [state.errors, state.submitting]);
  const submit = (e) => {
    clearTimeout(pause.current);
    setFailed(false);
    mailRef.current.failed = false;
    handleSubmit(e);
  };
  // The visitor's message, ready to go in their own mail app
  const draft = () => {
    const { name, email, message } = mailRef.current;
    const signature = [name, email].filter(Boolean).join(" · ");
    const body = [message, signature && `— ${signature}`].filter(Boolean).join("\n\n");
    return `mailto:${profile.email}?subject=${encodeURIComponent("Hello from your portfolio")}&body=${encodeURIComponent(body)}`;
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
        <p className="mt-8 font-serif text-2xl">Thank you, it just landed on my screen. I'll get back to you soon.</p>
      ) : (
        <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <input aria-label="Name" name="name" required placeholder="Your name" className={field} onChange={mirror("name")} />
          <input aria-label="Email" type="email" name="email" required placeholder="Your email" className={field} onChange={mirror("email")} />
          <textarea aria-label="Message" name="message" required rows={3} placeholder="What are you working on?" className={`${field} sm:col-span-2 resize-none`} onChange={mirror("message")} />
          <ValidationError className="text-sm text-accent-ink sm:col-span-2" errors={state.errors} />
          {failed && (
            <div role="alert" className="fallback-in border-l-2 border-accent pl-4 sm:col-span-2">
              <p className="font-serif text-2xl leading-tight">That one didn't reach me.</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                Nothing is lost. Send it straight to{" "}
                <a href={`mailto:${profile.email}`} className="font-medium text-ink underline underline-offset-2">
                  {profile.email}
                </a>
                : your message is already written.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <a href={draft()} className="rounded-full border border-ink px-4 py-2 text-[14px] font-medium transition-colors hover:bg-ink hover:text-paper">
                  Open it in my mail app
                </a>
                <button type="button" onClick={copy} className="link-draw text-[14px] font-medium">
                  {copied ? "Address copied" : "Copy the address"}
                </button>
              </div>
            </div>
          )}
          <button
            disabled={state.submitting}
            className="justify-self-start rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {state.submitting ? "Sending…" : failed ? "Try again" : "Send message"}
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
  // Last time the visitor did something (plus the intro), for the adaptive frame rate
  const activityRef = useRef(performance.now() + 5000);
  // The avatar turns around to look at you: while hovered, or until `until` (ms timestamp)
  const attentionRef = useRef({ value: 0, until: 0, hold: false });
  // How he feels, until `until`: excited (a project picked), interested (you're writing to him),
  // love (your message arrived) or upset (it didn't). SeatRig eases the weights.
  const moodRef = useRef({
    name: null,
    until: 0,
    at: 0,
    weights: { excited: 0, interested: 0, love: 0, upset: 0, annoyed: 0, startled: 0, reading: 0 },
  });
  const pokes = useRef({ hover: 0, click: 0 });
  // The coffee mug: a click asks for a sip; `active` while he's drinking (Avatar)
  const coffeeRef = useRef({ request: false, active: false });
  const [mood, setMood] = useState(null); // the little drawings next to his head
  const moodTimers = useRef([]);
  const [active, setActive] = useState(0);
  const phone = usePhone();
  const [touched, setTouched] = useState(false); // the phone hint goes once the room's been tapped
  const { evening, toggle: toggleEvening } = useLights();
  const setSceneEvening = useSetAtom(sceneEveningAtom);
  const [sceneReady, setSceneReady] = useState(false);
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

  // Reveal content as it scrolls into view
  useEffect(() => {
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
  }, []);

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

  // Scroll position → camera progress (a float across sections) and the active section.
  // Section positions are measured only when the layout changes: reading them on every scroll
  // event, right after the 3D loop has moved things on the page, forced a synchronous layout and
  // dropped frames.
  useEffect(() => {
    let sections = [];
    let vh = window.innerHeight;
    const measure = () => {
      vh = window.innerHeight;
      sections = sectionEls.current.map((el) => (el ? { top: el.offsetTop, height: el.offsetHeight } : null));
    };
    const onScroll = () => {
      activityRef.current = performance.now();
      const y = window.scrollY;
      let p = 0;
      let current = 0;
      sections.forEach((s, i) => {
        if (!s) return;
        if (y >= s.top - 1) p = i + Math.min(1, (y - s.top) / s.height);
        if (y + vh * 0.5 >= s.top) current = i;
      });
      progressRef.current = Math.min(p, sections.length - 1);
      setActive(current);
    };
    const relayout = () => {
      measure();
      onScroll();
    };
    relayout();
    const observer = new ResizeObserver(relayout);
    sectionEls.current.forEach((el) => el && observer.observe(el));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", relayout);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", relayout);
    };
  }, []);

  useEffect(() => {
    const tip = document.getElementById("room-tip");
    const onMove = (e) => {
      activityRef.current = performance.now();
      pointerRef.current.x = e.clientX / window.innerWidth - 0.5;
      pointerRef.current.y = e.pointerType === "touch" ? 0 : e.clientY / window.innerHeight - 0.5;
      if (tip && e.pointerType !== "touch") tip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    };
    // A finger lifted: the room drifts back to where it was
    const onUp = (e) => {
      if (e.pointerType !== "touch") return;
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // The room, and the whole site with it, goes to evening light in the contact section (unless
  // the switch says otherwise, see lib/theme.js)
  useEffect(() => setSceneEvening(active === 4), [active]);
  useEffect(() => () => setSceneEvening(false), []);

  const feel = useCallback((name, ms, { look = false, line = MOOD_LINES[name] } = {}) => {
    const now = performance.now();
    const m = moodRef.current;
    if (m.name !== name || now > m.until) m.at = now; // a new feeling starts over; the same one lasts longer
    m.name = name;
    m.until = now + ms;
    if (look) attentionRef.current.until = Math.max(attentionRef.current.until, now + ms);
    activityRef.current = Math.max(activityRef.current, now + ms);
    setMood((prev) => (prev && !prev.leaving && prev.name === name && prev.line === line ? prev : { name, line }));
    moodTimers.current.forEach(clearTimeout);
    moodTimers.current = [
      setTimeout(() => setMood((prev) => prev && { ...prev, leaving: true }), ms - 450),
      setTimeout(() => setMood(null), ms),
    ];
  }, []);
  useEffect(() => () => moodTimers.current.forEach(clearTimeout), []);

  // Browsing the work: every project he gets to show off makes him a little excited
  useEffect(() => {
    if (active === 3) feel("excited", 2600, { line: excitedLine(featured[selected], selected) });
  }, [active, selected]);

  // The contact section: he turns around in his chair and stays with you while it's on screen
  useEffect(() => {
    if (active !== 4) {
      attentionRef.current.hold = false;
      return;
    }
    const id = setTimeout(() => {
      attentionRef.current.hold = true;
      activityRef.current = performance.now() + 4000;
    }, 600);
    return () => clearTimeout(id);
  }, [active]);
  useEffect(() => {
    nightRef.current = evening ? 1 : 0;
  }, [evening]);

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

  // Bothering him while he works. Hovering: a side-eye and "not now". Clicking: he jumps, turns
  // round cross and waves you off, then gets back to it. The warmer moments (your message, the
  // hello in contact) aren't interrupted by a passing pointer.
  const onAvatarHover = () => {
    const m = moodRef.current;
    const busy = performance.now() < m.until;
    if (coffeeRef.current.active) return; // mid-sip: leave him be
    // Reading your message, he's busy too; otherwise in contact he's all yours
    if (busy && m.name === "reading") return feel("annoyed", 2000, { line: "one sec, reading this" });
    if (attentionRef.current.hold) return;
    if (busy && m.name !== "annoyed" && m.name !== "excited") return;
    if (!busy || m.name !== "annoyed") pokes.current.hover++;
    feel("annoyed", 2400, { line: ANNOYED_LINES[pokes.current.hover % ANNOYED_LINES.length] });
  };
  const poke = () => {
    if (coffeeRef.current.active) return;
    const m = moodRef.current;
    if (performance.now() < m.until && m.name === "startled") return;
    pokes.current.click++;
    // Out of the way of his face while he answers (it comes back when the pointer does)
    const tip = document.getElementById("room-tip");
    if (tip) tip.dataset.show = "false";
    feel("startled", 3600, { look: true, line: STARTLED_LINES[(pokes.current.click - 1) % STARTLED_LINES.length] });
  };

  // Clicking things in the room
  const onRoomAction = (action) => {
    if (action === "lights") toggleEvening();
    else if (action === "poke") poke();
    else if (action === "coffee") coffeeRef.current.request = true;
    else jump(SECTIONS.findIndex((x) => x.id === action));
  };

  return (
    <div className="font-sans text-ink">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      {/* The room: behind everything on a wide screen; on a phone, its own panel under the header,
          above the text, so it's always in view and can be tapped (and dragged to look around) */}
      <div
        onPointerDown={() => setTouched(true)}
        className={`fixed transition-opacity duration-1000 ${sceneReady ? "opacity-100" : "opacity-0"} ${
          phone ? "room-panel inset-x-0 top-16 z-30 h-[46svh] overflow-hidden border-b border-line bg-paper" : "inset-0 z-0"
        }`}
      >
        <Canvas
          camera={{ fov: 20, near: 0.1, far: 150, position: [-18.9, 15.6, 18.9] }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          dpr={dpr}
          frameloop="demand"
        >
          <FrameDriver activityRef={activityRef} />
          {/* Drop the pixel ratio on machines that can't keep up, raise it back when they can */}
          <PerformanceMonitor
            bounds={() => [24, 55]}
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr(Math.min(1.5, window.devicePixelRatio))}
          />
          <Suspense fallback={null}>
            <Scene
              phone={phone}
              progressRef={progressRef}
              nightRef={nightRef}
              screenRef={screenRef}
              pointerRef={pointerRef}
              attentionRef={attentionRef}
              moodRef={moodRef}
              coffeeRef={coffeeRef}
              onAction={onRoomAction}
              onAvatarHover={onAvatarHover}
            />
            <AvatarTracker noteId="avatar-note" moodId="avatar-mood" visibleRef={progressRef} />
          </Suspense>
        </Canvas>
        {phone && (
          <p
            className={`pointer-events-none absolute bottom-3 left-4 rounded-full bg-paper/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-opacity duration-500 ${
              touched ? "opacity-0" : "opacity-100"
            }`}
          >
            Tap the room · drag to look
          </p>
        )}
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

      <MoodMarks mood={mood} />

      {/* Label for clickable things in the room */}
      <div
        id="room-tip"
        data-show="false"
        className="pointer-events-none fixed left-0 top-0 z-50 rounded-full bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-paper opacity-0 transition-opacity duration-150 data-[show=true]:opacity-100"
      />

      <RoomLoader onDone={() => setSceneReady(true)} />
      <SiteNav active={active} onJump={jump} />

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
          <Contact mailRef={mailRef} feel={feel} />
        </Section>
      </main>
    </div>
  );
};
