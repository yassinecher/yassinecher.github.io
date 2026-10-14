import { useSetAtom } from "jotai";
import { Link, useNavigate } from "react-router-dom";
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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b0d]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-8 h-16">
        <button onClick={() => goHome(0)} className="font-display text-lg font-bold text-white">
          Yassine<span className="text-amber-400">.</span>
        </button>
        <nav className="flex items-center gap-4 md:gap-7 text-sm font-semibold">
          <Link to="/projects" className="text-gray-300 hover:text-white">
            Work
          </Link>
          <button onClick={() => goHome(2)} className="hidden sm:block text-gray-300 hover:text-white">
            Experience
          </button>
          <button
            onClick={() => goHome(4)}
            className="rounded-lg bg-amber-500 px-3 py-2 md:px-4 text-black hover:bg-amber-400"
          >
            Contact me
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
    <section className="mx-auto max-w-6xl px-4 md:px-8 py-16">
      <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-transparent to-transparent p-8 md:p-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
          Looking for a full-stack developer?
        </h2>
        <p className="mt-3 max-w-xl text-gray-300">
          I design, build and ship complete platforms, from the database to the deployment pipeline.
          Let's talk about your team or your project.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => goHome(4)}
            className="rounded-lg bg-amber-500 px-6 py-3 font-bold text-black hover:bg-amber-400"
          >
            Contact me
          </button>
          <a
            href={`mailto:${profile.email}`}
            className="rounded-lg border-2 border-white/80 px-6 py-3 font-bold text-white hover:bg-white hover:text-black"
          >
            {profile.email}
          </a>
          {cvAvailable && (
            <a href={cvUrl} download className="px-2 py-3 font-bold text-white underline underline-offset-4 hover:text-amber-300">
              Download CV
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export const SiteFooter = () => (
  <footer className="border-t border-white/10">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-8 text-sm text-gray-500">
      <p>© {new Date().getFullYear()} {profile.name}</p>
      <div className="flex gap-5">
        <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-white">
          GitHub
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">
          LinkedIn
        </a>
        <a href={`mailto:${profile.email}`} className="hover:text-white">
          Email
        </a>
      </div>
    </div>
  </footer>
);

export const PageShell = ({ children }) => (
  <div className="h-full overflow-y-auto bg-[#0b0b0d] font-sans text-gray-200">
    <SiteHeader />
    <main>{children}</main>
    <ContactBand />
    <SiteFooter />
  </div>
);
