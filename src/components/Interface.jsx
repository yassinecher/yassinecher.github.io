import { ValidationError, useForm } from "@formspree/react";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { education, experience, languages, profile, stack } from "../data/profile";
import { cvUrl, useCvAvailable } from "../lib/useCv";
import { currentProjectAtom, projects } from "./Projects";

const Section = (props) => {
  const { children, mobileTop, className = "" } = props;

  return (
    <motion.section
      className={`
  h-screen w-screen p-6 md:p-12 max-w-screen-2xl mx-auto
  flex flex-col items-start
  ${mobileTop ? "justify-start md:justify-center" : "justify-center"}
  ${className}
  `}
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 1,
          delay: 0.6,
        },
      }}
    >
      {children}
    </motion.section>
  );
};

const Eyebrow = ({ children }) => (
  <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-amber-400">
    {children}
  </p>
);

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 25 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 1, delay },
});

// Rendered by drei's <Scroll html> in its own React root: no router context here, so navigation
// arrives as props.
export const Interface = (props) => {
  const { setSection, openProject, navigate } = props;
  return (
    <div className="flex flex-col items-center w-screen font-sans">
      <AboutSection setSection={setSection} openProject={openProject} />
      <StackSection />
      <ExperienceSection openProject={openProject} />
      <ProjectsSection openProject={openProject} navigate={navigate} />
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
        className="mt-14 md:mt-0 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs md:text-sm text-gray-200 backdrop-blur"
        {...fadeUp(0.6)}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        {profile.title}
      </motion.div>
      <h1 className="font-display text-4xl text-white md:text-6xl font-bold leading-[1.05] mt-4">
        Hi, I'm
        <br />
        <span className="text-amber-400">{profile.name}</span>
      </h1>
      <motion.p
        className="text-base md:text-lg text-gray-300 mt-4 max-w-md"
        {...fadeUp(1.2)}
      >
        {profile.pitch}
      </motion.p>
      <motion.div className="flex flex-wrap gap-3 mt-6 md:mt-10" {...fadeUp(1.6)}>
        <button
          onClick={() => setSection(3)}
          className="bg-amber-500 hover:bg-amber-400 text-black py-3 px-6 md:py-4 md:px-8 rounded-lg font-bold text-base md:text-lg transition-colors"
        >
          See my work →
        </button>
        <button
          onClick={() => setSection(4)}
          className="border-2 border-white/80 hover:bg-white hover:text-black text-white py-3 px-6 md:py-4 md:px-8 rounded-lg font-bold text-base md:text-lg transition-colors"
        >
          Contact me
        </button>
        {cvAvailable && (
          <a
            href={cvUrl}
            download
            className="text-white/80 hover:text-amber-300 py-3 px-2 md:py-4 font-bold text-base md:text-lg underline underline-offset-4"
          >
            Download CV
          </a>
        )}
      </motion.div>
      <motion.div
        className="flex gap-5 mt-6 text-sm font-semibold text-gray-400"
        {...fadeUp(2)}
      >
        <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-amber-300">
          GitHub
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-amber-300">
          LinkedIn
        </a>
        <a href={`mailto:${profile.email}`} className="hover:text-amber-300">
          Email
        </a>
      </motion.div>
      <motion.button
        onClick={() => openProject("medianet-incubator")}
        className="hidden md:flex mt-10 items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-left backdrop-blur hover:border-amber-400/60 transition-colors"
        {...fadeUp(2.3)}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-amber-400">Latest</span>
        <span className="text-sm text-gray-200">
          Medianet Incubator: microservices platform with AI pitch analysis
        </span>
        <span className="text-amber-400">→</span>
      </motion.button>
    </Section>
  );
};

const StackSection = () => {
  return (
    <Section>
      <div className="w-full md:max-w-2xl">
        <Eyebrow>What I work with</Eyebrow>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">Stack</h2>
        <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {stack.map((group, index) => (
            <motion.div
              key={group.group}
              className="rounded-2xl border border-white/10 bg-black/50 p-4 md:p-5 backdrop-blur"
              {...fadeUp(0.8 + index * 0.15)}
            >
              <h3 className="font-display text-base md:text-lg font-bold text-white">{group.group}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5 md:gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs md:text-sm text-gray-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div className="mt-5 md:mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-300" {...fadeUp(1.6)}>
          <span className="font-semibold text-white">Languages</span>
          {languages.map((l) => (
            <span key={l.name}>
              {l.name} <span className="text-gray-500">· {l.level}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </Section>
  );
};

const ExperienceSection = ({ openProject }) => {
  return (
    <Section>
      <div className="w-full md:max-w-2xl">
        <Eyebrow>Where I've worked</Eyebrow>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">Experience</h2>
        <ol className="mt-5 md:mt-8 relative border-l border-white/15 ml-1.5 space-y-4 md:space-y-5">
          {experience.map((job, index) => (
            <motion.li key={job.title} className="pl-5 relative" {...fadeUp(0.8 + index * 0.12)}>
              <span
                className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                  index === 0 ? "bg-amber-400 ring-4 ring-amber-400/20" : "bg-gray-500"
                }`}
              />
              <p className="font-mono text-xs text-amber-400">{job.period}</p>
              <h3 className="text-sm md:text-base font-bold text-white leading-snug">
                {job.title} <span className="font-normal text-gray-400">· {job.org}</span>
              </h3>
              <p className="hidden md:block text-sm text-gray-400 mt-0.5">{job.text}</p>
              {job.project && (
                <button
                  onClick={() => openProject(job.project)}
                  className="mt-1 text-xs md:text-sm font-semibold text-amber-400 hover:text-amber-200"
                >
                  Case study →
                </button>
              )}
            </motion.li>
          ))}
        </ol>
        <motion.div className="mt-5 md:mt-7 grid sm:grid-cols-2 gap-2 md:gap-3" {...fadeUp(1.6)}>
          {education.map((e) => (
            <div key={e.title} className="rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur">
              <p className="font-mono text-xs text-gray-400">{e.period}</p>
              <p className="text-sm font-semibold text-white">{e.title}</p>
              <p className="text-xs text-gray-400">{e.org}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
};

const ProjectsSection = ({ openProject, navigate }) => {
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  const project = projects[currentProject];

  const nextProject = () => {
    setCurrentProject((currentProject + 1) % projects.length);
  };

  const previousProject = () => {
    setCurrentProject((currentProject - 1 + projects.length) % projects.length);
  };

  return (
    <Section className="!justify-end md:!justify-center">
      <div className="w-full md:max-w-xs rounded-2xl border border-white/10 bg-black/70 p-4 md:p-6 backdrop-blur">
        <div className="flex items-center justify-between">
          <Eyebrow>Selected work</Eyebrow>
          <span className="font-mono text-xs text-gray-400">
            {String(currentProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-3 text-xs text-gray-400">{project.context}</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white">{project.title}</h2>
        <p className="mt-1 text-sm text-gray-300">{project.tagline}</p>
        <div className="mt-3 hidden md:flex flex-wrap gap-1.5">
          {project.stack.slice(0, 6).map((s) => (
            <span key={s} className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-gray-300">
              {s}
            </span>
          ))}
        </div>
        <button
          onClick={() => openProject(project.slug)}
          className="mt-4 w-full bg-amber-500 hover:bg-amber-400 text-black py-2.5 rounded-lg font-bold transition-colors"
        >
          Read the case study →
        </button>
        <div className="mt-3 flex items-center justify-between text-sm font-bold">
          <button onClick={previousProject} className="text-amber-400 hover:text-amber-200">
            ← Prev
          </button>
          <button onClick={() => navigate("/projects")} className="text-gray-300 hover:text-white">
            All projects
          </button>
          <button onClick={nextProject} className="text-amber-400 hover:text-amber-200">
            Next →
          </button>
        </div>
      </div>
    </Section>
  );
};

const ContactSection = () => {
  const [state, handleSubmit] = useForm("mgegpwwl");
  const cvAvailable = useCvAvailable();

  const field =
    "block w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none p-3";

  return (
    <Section mobileTop>
      <div className="w-full md:max-w-3xl mt-12 md:mt-0">
        <Eyebrow>Get in touch</Eyebrow>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">Let's work together</h2>
        <p className="mt-2 text-sm md:text-base text-gray-300 max-w-lg">
          Hiring for a full-stack role, or have a project in mind? Send a message or reach me directly.
        </p>
        <div className="mt-5 md:mt-8 grid md:grid-cols-[1fr_1.2fr] gap-5 md:gap-8">
          <div className="hidden md:flex flex-col gap-3 text-sm">
            <a href={`mailto:${profile.email}`} className="rounded-xl border border-white/10 bg-black/50 p-4 hover:border-amber-400/60">
              <p className="text-gray-400">Email</p>
              <p className="font-semibold text-white">{profile.email}</p>
            </a>
            <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="rounded-xl border border-white/10 bg-black/50 p-4 hover:border-amber-400/60">
              <p className="text-gray-400">Phone</p>
              <p className="font-semibold text-white">{profile.phone}</p>
            </a>
            <div className="flex gap-3">
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex-1 rounded-xl border border-white/10 bg-black/50 p-4 font-semibold text-white hover:border-amber-400/60">
                LinkedIn ↗
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="flex-1 rounded-xl border border-white/10 bg-black/50 p-4 font-semibold text-white hover:border-amber-400/60">
                GitHub ↗
              </a>
            </div>
            {cvAvailable && (
              <a href={cvUrl} download className="rounded-xl bg-white p-4 text-center font-bold text-black hover:bg-amber-300">
                Download my CV
              </a>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 md:p-6 backdrop-blur">
            {state.succeeded ? (
              <p className="text-white text-center py-10">Thanks for your message! I'll get back to you soon.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-gray-300 block mb-1">
                    Name
                  </label>
                  <input type="text" name="name" id="name" required className={field} />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-300 block mb-1">
                    Email
                  </label>
                  <input type="email" name="email" id="email" required className={field} />
                  <ValidationError className="mt-1 text-red-400 text-sm" prefix="Email" field="email" errors={state.errors} />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-medium text-gray-300 block mb-1">
                    Message
                  </label>
                  <textarea name="message" id="message" required className={`${field} h-24 md:h-32`} />
                  <ValidationError className="mt-1 text-red-400 text-sm" errors={state.errors} />
                </div>
                <button
                  disabled={state.submitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black py-3 rounded-lg font-bold text-lg transition-colors"
                >
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="md:hidden mt-4 text-sm text-gray-300">
          Or email <a href={`mailto:${profile.email}`} className="text-amber-400 font-semibold">{profile.email}</a>
        </p>
      </div>
    </Section>
  );
};
