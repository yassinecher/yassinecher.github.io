import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../components/site/SiteChrome";
import { asset } from "../lib/asset";
import { otherWork, projects } from "../data/projects";

export const ProjectsIndex = () => {
  const filters = useMemo(
    () => ["All", ...new Set(projects.flatMap((p) => p.categories))],
    []
  );
  const [filter, setFilter] = useState("All");
  const shown = projects.filter((p) => filter === "All" || p.categories.includes(filter));

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 md:px-8 pt-14 md:pt-20">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-amber-400">Work</p>
        <h1 className="font-display mt-2 text-4xl md:text-6xl font-bold text-white">Projects</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          Platforms, stores, mobile apps and machine-learning work. Each case study covers the problem,
          what I built, the stack and the code behind it.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === f
                  ? "border-amber-400 bg-amber-400 text-black"
                  : "border-white/15 text-gray-300 hover:border-white/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 md:px-8 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <Link
            key={p.slug}
            to={`/projects/${p.slug}`}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-amber-400/60"
          >
            <div className="aspect-[4/3] overflow-hidden bg-black">
              <img
                src={asset(p.cover)}
                alt={`${p.title} cover`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <p className="font-mono text-xs text-gray-500">
                {p.year} · {p.context}
              </p>
              <h2 className="font-display mt-1 text-xl font-bold text-white">{p.title}</h2>
              <p className="mt-1 text-sm text-gray-400">{p.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.stack.slice(0, 4).map((s) => (
                  <span key={s} className="rounded border border-white/10 px-1.5 py-0.5 text-xs text-gray-400">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-bold text-amber-400">Read the case study →</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-8 pt-16">
        <h2 className="font-display text-2xl font-bold text-white">More work</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {otherWork.map((w) => (
            <div key={w.title} className="rounded-xl border border-white/10 p-5">
              <h3 className="font-semibold text-white">{w.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{w.text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
};
