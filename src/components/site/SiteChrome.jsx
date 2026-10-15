import { useSetAtom } from "jotai";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { profile } from "../../data/profile";
import { cvUrl, useCvAvailable } from "../../lib/useCv";
import { homeSectionAtom } from "../../state";

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
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <button onClick={() => goHome(0)} className="font-serif text-2xl leading-none">
          Yassine Cherni
        </button>
        <nav className="flex items-center gap-5 md:gap-7 text-sm">
          <NavLink
            to="/projects"
            end
            className={({ isActive }) => `link-draw pb-0.5 ${isActive ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            Projects
          </NavLink>
          <button onClick={() => goHome(2)} className="link-draw hidden pb-0.5 text-muted hover:text-ink sm:block">
            Experience
          </button>
          <button
            onClick={() => goHome(4)}
            className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Contact
          </button>
        </nav>
      </div>
    </header>
  );
};

export const ContactBand = () => {
  const goHome = useGoHome();
  const cvAvailable = useCvAvailable();
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-20">
      <div className="border-t border-ink pt-10 md:flex md:items-end md:justify-between md:gap-10">
        <h2 className="font-serif text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95]">
          Need someone who can <em className="text-accent">build the whole thing?</em>
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-0 md:shrink-0">
          <button
            onClick={() => goHome(4)}
            className="rounded-full bg-ink px-6 py-3 font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            Get in touch
          </button>
          <a href={`mailto:${profile.email}`} className="link-draw font-medium">
            {profile.email}
          </a>
          {cvAvailable && (
            <a href={cvUrl} download className="link-draw font-medium">
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
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 md:px-8 py-8 text-sm text-muted">
      <p>© {new Date().getFullYear()} {profile.name}</p>
      <div className="flex gap-5">
        <Link to="/projects" className="link-draw hover:text-ink">Projects</Link>
        <a href={profile.github} target="_blank" rel="noreferrer" className="link-draw hover:text-ink">GitHub</a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="link-draw hover:text-ink">LinkedIn</a>
      </div>
    </div>
  </footer>
);

export const PageShell = ({ children }) => (
  <div className="min-h-screen font-sans text-ink">
    <SiteHeader />
    <main>{children}</main>
    <ContactBand />
    <SiteFooter />
  </div>
);
