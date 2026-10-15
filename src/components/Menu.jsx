import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { SECTIONS } from "../config";
import { profile } from "../data/profile";
import { activeSectionAtom } from "../state";

// Fixed top bar for the 3D home page: every section is one click away and the current one is
// highlighted. On phones the links move into a sheet behind the menu button.
export const Menu = (props) => {
  const { onSectionChange, navigate, menuOpened, setMenuOpened } = props;
  const active = useAtomValue(activeSectionAtom);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-line/70 bg-paper/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-12">
          <button onClick={() => onSectionChange(0)} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-accent">
              YC
            </span>
            <span className="font-display text-base font-bold text-ink">{profile.name}</span>
          </button>

          <nav className="hidden md:flex items-center gap-1 rounded-full border border-line bg-card/70 p-1 shadow-sm">
            {SECTIONS.map((label, index) => (
              <button
                key={label}
                onClick={() => onSectionChange(index)}
                className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  active === index ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {active === index && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/projects")}
              className="hidden lg:block rounded-full px-3 py-2 text-sm font-semibold text-muted hover:text-ink"
            >
              All projects
            </button>
            <button
              onClick={() => onSectionChange(4)}
              className="hidden sm:block rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-black"
            >
              Contact me
            </button>
            <button
              onClick={() => setMenuOpened(!menuOpened)}
              aria-label={menuOpened ? "Close menu" : "Open menu"}
              className="md:hidden flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-xl bg-ink"
            >
              <span className={`h-0.5 w-5 rounded bg-white transition-all ${menuOpened ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 rounded bg-white transition-all ${menuOpened ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-5 rounded bg-white transition-all ${menuOpened ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
        {/* Scroll progress, driven from the 3D scene's frame loop */}
        <div id="scroll-progress" className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-linear-to-r from-amber-500 via-orange-500 to-rose-500" />
      </header>

      {/* Phone menu sheet */}
      <div
        className={`md:hidden fixed inset-x-0 top-16 bottom-0 z-20 bg-paper/95 backdrop-blur-md transition-all duration-300 ${
          menuOpened ? "opacity-100" : "pointer-events-none opacity-0 -translate-y-2"
        }`}
      >
        <div className="flex flex-col gap-2 p-6">
          {SECTIONS.map((label, index) => (
            <button
              key={label}
              onClick={() => onSectionChange(index)}
              className={`flex items-center justify-between rounded-2xl border px-5 py-4 font-display text-xl font-bold ${
                active === index ? "border-accent bg-accent/15 text-ink" : "border-line bg-card text-ink"
              }`}
            >
              {label}
              <span className="font-mono text-sm text-muted">0{index + 1}</span>
            </button>
          ))}
          <button
            onClick={() => navigate("/projects")}
            className="mt-2 rounded-2xl bg-ink px-5 py-4 text-left font-display text-xl font-bold text-white"
          >
            All projects →
          </button>
        </div>
      </div>
    </>
  );
};
