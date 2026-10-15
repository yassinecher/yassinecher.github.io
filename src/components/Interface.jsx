import { ValidationError, useForm } from "@formspree/react";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { SECTIONS } from "../config";
import { education, experience, languages, profile, stack } from "../data/profile";
import { projects as allProjects } from "../data/projects";
import { cvUrl, useCvAvailable } from "../lib/useCv";
import { currentProjectAtom, projects } from "./Projects";

const Section = (props) => {
  const { children, mobileTop, className = "" } = props;

  return (
    <motion.section
      className={`
  relative h-screen w-screen px-5 pt-20 pb-20 md:px-12 max-w-screen-2xl mx-auto
  flex flex-col items-start
  ${mobileTop ? "justify-start md:justify-center" : "justify-center"}
  ${className}
  `}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: 0.2, ease: "easeOut" },
      }}
    >
      {children}
    </motion.section>
  );
};

const Eyebrow = ({ children }) => (
  <p className="inline-flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-accent-strong">
    <span className="h-px w-6 bg-accent" />
    {children}
  </p>
);

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

// Bottom-of-section cue that says where to go next.
const NextCue = ({ index, setSection }) => {
  const next = SECTIONS[index + 1];
  if (!next) return null;
  return (
    <button
      onClick={() => setSection(index + 1)}
      className="group absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted hover:text-ink transition-colors"
    >
      <span>Next · {next}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-card shadow-sm transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
        <span className="animate-bounce">↓</span>
      </span>
    </button>
  );
};

const card = "rounded-2xl border border-line bg-card/85 shadow-[0_10px_40px_-12px_rgba(23,23,28,0.15)] backdrop-blur";

// Rendered by drei's <Scroll html> in its own React root: no router context here, so navigation
// arrives as props.
export const Interface = (props) => {
  const { setSection, openProject, navigate } = props;
  return (
    <div className="flex flex-col items-center w-screen font-sans text-ink">
      <AboutSection setSection={setSection} openProject={openProject} />
      <StackSection setSection={setSection} />
      <ExperienceSection setSection={setSection} openProject={openProject} />
      <ProjectsSection setSection={setSection} openProject={openProject} navigate={navigate} />
      <ContactSection />
    </div>
  );
};

const AboutSection = (props) => {
  const { setSection, openProject } = props;
  const cvAvailable = useCvAvailable();
  return (
    <Section mobileTop>
      <motion.div
        className="inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-3 py-1.5 text-xs md:text-sm font-medium text-muted shadow-sm backdrop-blur"
        {...fadeUp(0.3)}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        {profile.title} · {profile.location}
      </motion.div>
      <h1 className="font-display text-[2.6rem] md:text-7xl font-bold leading-[1.02] tracking-tight mt-4">
        Hi, I'm
        <br />
        <span className="bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
          {profile.name}
        </span>
      </h1>
      <motion.p className="text-base md:text-lg text-muted mt-4 max-w-md leading-relaxed" {...fadeUp(0.5)}>
        {profile.pitch}
      </motion.p>
      <motion.div className="flex flex-wrap items-center gap-3 mt-6 md:mt-8" {...fadeUp(0.7)}>
        <button
          onClick={() => setSection(3)}
          className="group rounded-xl bg-ink px-6 py-3 md:px-7 md:py-4 font-bold text-white shadow-lg shadow-ink/20 transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          See my work <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </button>
        <button
          onClick={() => setSection(4)}
          className="rounded-xl border-2 border-ink/80 bg-card/70 px-6 py-3 md:px-7 md:py-4 font-bold text-ink backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-accent hover:border-accent"
        >
          Contact me
        </button>
        {cvAvailable && (
          <a href={cvUrl} download className="px-2 py-3 font-bold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-strong">
            Download CV
          </a>
        )}
      </motion.div>
      <motion.div className="flex flex-wrap gap-2 mt-5" {...fadeUp(0.9)}>
        {[
          ["GitHub", profile.github],
          ["LinkedIn", profile.linkedin],
          ["Email", `mailto:${profile.email}`],
        ].map(([label, href]) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="rounded-full border border-line bg-card/70 px-3 py-1 text-sm font-semibold text-muted backdrop-blur transition-colors hover:border-ink hover:text-ink"
          >
            {label}
          </a>
        ))}
      </motion.div>
      <motion.button
        onClick={() => openProject("medianet-incubator")}
        className={`${card} group hidden md:flex mt-8 items-center gap-3 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-accent`}
        {...fadeUp(1.1)}
      >
        <span className="rounded-md bg-accent/15 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Latest
        </span>
        <span className="text-sm font-medium text-ink">Medianet Incubator: microservices platform with AI pitch analysis</span>
        <span className="text-accent-strong transition-transform group-hover:translate-x-1">→</span>
      </motion.button>
      <ScrollHint onClick={() => setSection(1)} />
    </Section>
  );
};

const ScrollHint = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-ink"
  >
    <span className="flex h-9 w-6 justify-center rounded-full border-2 border-muted/60 pt-1.5">
      <span className="h-2 w-1 animate-bounce rounded-full bg-accent" />
    </span>
    Scroll to explore
  </button>
);

const STACK_COLORS = {
  Backend: { dot: "bg-amber-500", chip: "border-amber-200 bg-amber-50 text-amber-900" },
  Frontend: { dot: "bg-sky-500", chip: "border-sky-200 bg-sky-50 text-sky-900" },
  "Data & infra": { dot: "bg-violet-500", chip: "border-violet-200 bg-violet-50 text-violet-900" },
  "AI & mobile": { dot: "bg-emerald-500", chip: "border-emerald-200 bg-emerald-50 text-emerald-900" },
};

const StackSection = ({ setSection }) => {
  return (
    <Section>
      <div className="w-full md:max-w-2xl">
        <Eyebrow>What I work with</Eyebrow>
        <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Stack</h2>
        <div className="mt-5 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {stack.map((group, index) => {
            const color = STACK_COLORS[group.group];
            return (
              <motion.div
                key={group.group}
                className={`${card} p-4 md:p-5 transition-transform hover:-translate-y-1`}
                {...fadeUp(0.3 + index * 0.1)}
              >
                <h3 className="flex items-center gap-2 font-display text-base md:text-lg font-bold">
                  <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
                  {group.group}
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} className={`rounded-md border px-2 py-0.5 text-xs md:text-sm font-medium ${color.chip}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.div className="mt-4 md:mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted" {...fadeUp(0.8)}>
          <span className="font-semibold text-ink">Languages</span>
          {languages.map((l) => (
            <span key={l.name}>
              {l.name} <span className="text-muted/70">· {l.level}</span>
            </span>
          ))}
        </motion.div>
      </div>
      <NextCue index={1} setSection={setSection} />
    </Section>
  );
};

const ExperienceSection = ({ setSection, openProject }) => {
  const [latest, ...rest] = experience;
  return (
    <Section>
      <div className="w-full md:max-w-3xl">
        <Eyebrow>Where I've worked</Eyebrow>
        <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Experience</h2>
        <motion.div
          className={`${card} relative mt-4 md:mt-6 overflow-hidden p-4 md:p-5 border-accent/60`}
          {...fadeUp(0.25)}
        >
          <span className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-amber-400 via-orange-500 to-rose-500" />
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="rounded-md bg-accent/15 px-2 py-0.5 font-mono text-xs font-semibold text-accent-strong">{latest.period}</span>
            <h3 className="text-base md:text-lg font-bold">{latest.title}</h3>
          </div>
          <p className="mt-0.5 text-sm font-medium text-muted">{latest.org}</p>
          <p className="mt-1 hidden md:block text-sm text-muted/90">{latest.text}</p>
          <button
            onClick={() => openProject(latest.project)}
            className="mt-2 text-sm font-bold text-accent-strong hover:underline underline-offset-4"
          >
            Read the case study →
          </button>
        </motion.div>
        <div className="mt-2.5 md:mt-3 grid sm:grid-cols-2 gap-2.5 md:gap-3">
          {rest.map((job, index) => (
            <motion.div key={job.title} className={`${card} p-3.5 md:p-4 transition-transform hover:-translate-y-0.5`} {...fadeUp(0.35 + index * 0.08)}>
              <p className="font-mono text-xs text-accent-strong">{job.period}</p>
              <h3 className="text-sm font-bold leading-snug">{job.title}</h3>
              <p className="text-xs font-medium text-muted">{job.org}</p>
              <p className="mt-1 hidden md:block text-xs leading-relaxed text-muted/90">{job.text}</p>
              {job.project && (
                <button onClick={() => openProject(job.project)} className="mt-1 text-xs font-bold text-accent-strong hover:underline underline-offset-4">
                  Case study →
                </button>
              )}
            </motion.div>
          ))}
        </div>
        <motion.div className="mt-2.5 md:mt-3 flex flex-wrap gap-2" {...fadeUp(0.7)}>
          {education.map((e) => (
            <div key={e.title} className="rounded-full border border-line bg-card/80 px-3.5 py-1.5 text-xs md:text-sm backdrop-blur">
              <span className="font-semibold">{e.title}</span>
              <span className="text-muted"> · {e.org} · {e.period}</span>
            </div>
          ))}
        </motion.div>
      </div>
      <NextCue index={2} setSection={setSection} />
    </Section>
  );
};

const ProjectsSection = ({ setSection, openProject, navigate }) => {
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  const project = projects[currentProject];

  const nextProject = () => setCurrentProject((currentProject + 1) % projects.length);
  const previousProject = () => setCurrentProject((currentProject - 1 + projects.length) % projects.length);

  return (
    <Section className="justify-end! md:justify-center!">
      <div className={`${card} w-full md:max-w-xs p-4 md:p-6`}>
        <div className="flex items-center justify-between">
          <Eyebrow>Selected work</Eyebrow>
          <span className="font-mono text-xs text-muted">
            {String(currentProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
        </div>
        <motion.div key={project.slug} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <p className="mt-3 text-xs font-medium text-muted">{project.context}</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold">{project.title}</h2>
          <p className="mt-1 text-sm text-muted">{project.tagline}</p>
          <div className="mt-3 hidden md:flex flex-wrap gap-1.5">
            {project.stack.slice(0, 6).map((s) => (
              <span key={s} className="rounded-md border border-line bg-paper px-1.5 py-0.5 text-xs font-medium text-muted">
                {s}
              </span>
            ))}
          </div>
        </motion.div>
        <button
          onClick={() => openProject(project.slug)}
          className="mt-4 w-full rounded-xl bg-ink py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          Read the case study →
        </button>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={previousProject}
            aria-label="Previous project"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card font-bold hover:border-accent hover:bg-accent"
          >
            ←
          </button>
          <div className="flex gap-1.5">
            {projects.map((p, i) => (
              <button
                key={p.slug}
                aria-label={p.title}
                onClick={() => setCurrentProject(i)}
                className={`h-2 rounded-full transition-all ${i === currentProject ? "w-6 bg-accent" : "w-2 bg-line hover:bg-muted"}`}
              />
            ))}
          </div>
          <button
            onClick={nextProject}
            aria-label="Next project"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card font-bold hover:border-accent hover:bg-accent"
          >
            →
          </button>
        </div>
        <button
          onClick={() => navigate("/projects")}
          className="mt-3 w-full text-center text-sm font-semibold text-muted hover:text-ink"
        >
          See all {allProjects.length} projects
        </button>
      </div>
      <NextCue index={3} setSection={setSection} />
    </Section>
  );
};

const ContactSection = () => {
  const [state, handleSubmit] = useForm("mgegpwwl");
  const cvAvailable = useCvAvailable();

  const field =
    "block w-full rounded-xl border border-line bg-paper/70 text-ink placeholder:text-muted/60 focus:border-accent focus:bg-card focus:outline-hidden focus:ring-4 focus:ring-accent/15 p-3 transition";

  return (
    <Section mobileTop>
      <div className="w-full md:max-w-3xl">
        <Eyebrow>Get in touch</Eyebrow>
        <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Let's work together</h2>
        <p className="mt-2 text-sm md:text-base text-muted max-w-lg">
          Hiring for a full-stack role, or have a project in mind? Send a message or reach me directly.
        </p>
        <div className="mt-5 md:mt-8 grid md:grid-cols-[1fr_1.2fr] gap-5 md:gap-6">
          <div className="hidden md:flex flex-col gap-3 text-sm">
            <a href={`mailto:${profile.email}`} className={`${card} p-4 transition-all hover:-translate-y-0.5 hover:border-accent`}>
              <p className="text-muted">Email</p>
              <p className="font-semibold">{profile.email}</p>
            </a>
            <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className={`${card} p-4 transition-all hover:-translate-y-0.5 hover:border-accent`}>
              <p className="text-muted">Phone</p>
              <p className="font-semibold">{profile.phone}</p>
            </a>
            <div className="flex gap-3">
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className={`${card} flex-1 p-4 font-semibold transition-all hover:-translate-y-0.5 hover:border-sky-400`}>
                LinkedIn ↗
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className={`${card} flex-1 p-4 font-semibold transition-all hover:-translate-y-0.5 hover:border-ink`}>
                GitHub ↗
              </a>
            </div>
            {cvAvailable && (
              <a href={cvUrl} download className="rounded-2xl bg-accent p-4 text-center font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-amber-400">
                Download my CV
              </a>
            )}
          </div>
          <div className={`${card} p-4 md:p-6`}>
            {state.succeeded ? (
              <p className="py-10 text-center font-semibold">Thanks for your message! I'll get back to you soon.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-semibold text-muted">
                    Name
                  </label>
                  <input type="text" name="name" id="name" required className={field} />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-semibold text-muted">
                    Email
                  </label>
                  <input type="email" name="email" id="email" required className={field} />
                  <ValidationError className="mt-1 text-sm text-red-600" prefix="Email" field="email" errors={state.errors} />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1 block text-sm font-semibold text-muted">
                    Message
                  </label>
                  <textarea name="message" id="message" required className={`${field} h-24 md:h-32`} />
                  <ValidationError className="mt-1 text-sm text-red-600" errors={state.errors} />
                </div>
                <button
                  disabled={state.submitting}
                  className="w-full rounded-xl bg-ink py-3 text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-black disabled:opacity-60"
                >
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-muted md:hidden">
          Or email{" "}
          <a href={`mailto:${profile.email}`} className="font-semibold text-accent-strong">
            {profile.email}
          </a>
        </p>
      </div>
    </Section>
  );
};
