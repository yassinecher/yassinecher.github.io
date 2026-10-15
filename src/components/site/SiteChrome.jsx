import { useSetAtom } from "jotai";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { profile } from "../../data/profile";
import { cvUrl, useCvAvailable } from "../../lib/useCv";
import { homeSectionAtom } from "../../state";
import { Backdrop } from "../Backdrop";

// Shared header/footer for the regular (non-3D) pages.

export const useGoHome = () => {
  const navigate = useNavigate();
  const setHomeSection = useSetAtom(homeSectionAtom);
  return (section = 0) => {
    setHomeSection({ index: section, at: Date.now() });
    navigate("/");
  };
};

export const SiteHeader = () => {
  const goHome = useGoHome();
  const link = "rounded-full px-3 md:px-4 py-1.5 text-sm font-semibold transition-colors";
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <button onClick={() => goHome(0)} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-accent">
            YC
          </span>
          <span className="hidden sm:inline font-display text-base font-bold text-ink">{profile.name}</span>
        </button>
        <nav className="flex items-center gap-1 rounded-full border border-line bg-card/70 p-1 shadow-sm">
          <button onClick={() => goHome(0)} className={`${link} text-muted hover:text-ink`}>
            Home
          </button>
          <NavLink
            to="/projects"
            className={({ isActive }) => `${link} ${isActive ? "bg-accent text-ink" : "text-muted hover:text-ink"}`}
          >
            Projects
          </NavLink>
          <button onClick={() => goHome(2)} className={`${link} hidden sm:block text-muted hover:text-ink`}>
            Experience
          </button>
        </nav>
        <button
          onClick={() => goHome(4)}
          className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          Contact<span className="hidden sm:inline"> me</span>
        </button>
      </div>
    </header>
  );
};

export const ContactBand = () => {
  const goHome = useGoHome();
  const cvAvailable = useCvAvailable();
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-8 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-ink p-8 md:p-12 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-linear-to-br from-amber-400 via-orange-500 to-rose-500 opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sky-400 opacity-25 blur-3xl" />
        <h2 className="relative font-display text-3xl md:text-4xl font-bold">Looking for a full-stack developer?</h2>
        <p className="relative mt-3 max-w-xl text-white/75">
          I design, build and ship complete platforms, from the database to the deployment pipeline.
          Let's talk about your team or your project.
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => goHome(4)}
            className="rounded-xl bg-accent px-6 py-3 font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-amber-400"
          >
            Contact me
          </button>
          <a
            href={`mailto:${profile.email}`}
            className="rounded-xl border-2 border-white/70 px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-ink"
          >
            {profile.email}
          </a>
          {cvAvailable && (
            <a href={cvUrl} download className="px-2 py-3 font-bold underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
              Download CV
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export const SiteFooter = () => (
  <footer className="border-t border-line">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-8 text-sm text-muted">
      <p>© {new Date().getFullYear()} {profile.name}</p>
      <div className="flex gap-5">
        <Link to="/projects" className="hover:text-ink">
          Projects
        </Link>
        <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-ink">
          GitHub
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-ink">
          LinkedIn
        </a>
        <a href={`mailto:${profile.email}`} className="hover:text-ink">
          Email
        </a>
      </div>
    </div>
  </footer>
);

export const PageShell = ({ children, palette = 3 }) => (
  <div className="h-full overflow-y-auto font-sans text-ink">
    <Backdrop section={palette} />
    <SiteHeader />
    <main>{children}</main>
    <ContactBand />
    <SiteFooter />
  </div>
);
