import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../components/site/SiteChrome";
import { otherWork, projects } from "../data/projects";
import { asset } from "../lib/asset";

// A list of projects; on desktop, hovering a row floats its cover next to the cursor.
export const ProjectsIndex = () => {
  const filters = useMemo(() => ["All", ...new Set(projects.flatMap((p) => p.categories))], []);
  const [filter, setFilter] = useState("All");
  const [hovered, setHovered] = useState(null);
  const preview = useRef(null);
  const shown = projects.filter((p) => filter === "All" || p.categories.includes(filter));

  useEffect(() => {
    window.scrollTo(0, 0);
    const onMove = (e) => {
      if (preview.current) preview.current.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 120}px)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 md:px-8 pt-14 md:pt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Work · {projects.length} projects</p>
        <h1 className="mt-3 font-serif text-[clamp(3.2rem,8vw,7rem)] leading-[0.9]">
          Things I've <em className="text-accent">built.</em>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          Platforms, stores, mobile apps and machine-learning work. Each case study covers the problem, what I built,
          the stack and some of the code.
        </p>
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-active={filter === f}
              className={`link-draw pb-0.5 ${filter === f ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-6xl px-5 md:px-8">
        <ol className="border-t border-ink">
          {shown.map((p) => (
            <li key={p.slug} className="border-b border-line">
              <Link
                to={`/projects/${p.slug}`}
                onMouseEnter={() => setHovered(p)}
                onMouseLeave={() => setHovered(null)}
                className="group grid gap-3 py-6 md:grid-cols-[1fr_260px_120px] md:items-baseline md:gap-8"
              >
                <img src={asset(p.cover)} alt="" loading="lazy" className="w-full rounded-lg border border-line md:hidden" />
                <span className="font-serif text-[clamp(2rem,4vw,3.2rem)] leading-none transition-transform duration-300 group-hover:translate-x-2">
                  {p.title}
                </span>
                <span className="text-[15px] text-muted">{p.tagline}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted md:text-right">{p.year}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-5 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Also</p>
        <div className="mt-4 grid gap-x-12 border-t border-line md:grid-cols-2">
          {otherWork.map((w) => (
            <div key={w.title} className="border-b border-line py-5">
              <h3 className="font-medium">{w.title}</h3>
              <p className="mt-1 text-[15px] text-muted">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating cover preview (desktop) */}
      <div
        ref={preview}
        className={`pointer-events-none fixed left-0 top-0 z-40 hidden w-[340px] md:block transition-opacity duration-200 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {hovered && (
          <img src={asset(hovered.cover)} alt="" className="w-full -rotate-2 rounded-lg border border-line shadow-2xl" />
        )}
      </div>
    </PageShell>
  );
};
