import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../components/site/SiteChrome";
import { asset } from "../lib/asset";
import { getProject, projects } from "../data/projects";
import { TOKEN_COLORS, tokenizeLine } from "../lib/highlight";

const SectionTitle = ({ eyebrow, children }) => (
  <div>
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400">{eyebrow}</p>
    <h2 className="font-display mt-1 text-2xl md:text-3xl font-bold text-white">{children}</h2>
  </div>
);

const CodeBlock = ({ file, lang, source }) => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]">
    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      <span className="ml-3 font-mono text-xs text-gray-400">{file}</span>
    </div>
    <pre className="overflow-x-auto p-4 md:p-6 font-mono text-xs md:text-sm leading-relaxed [font-variant-ligatures:none]">
      {source.split("\n").map((line, i) => (
        <div key={i} className="flex">
          <span className="mr-5 w-6 shrink-0 select-none text-right text-gray-600">{i + 1}</span>
          <code>
            {tokenizeLine(line, lang).map((t, j) => (
              <span key={j} style={{ color: TOKEN_COLORS[t.type] }}>
                {t.text}
              </span>
            ))}
          </code>
        </div>
      ))}
    </pre>
  </div>
);

export const ProjectDetail = () => {
  const { slug } = useParams();
  const project = getProject(slug);

  useEffect(() => {
    if (project) document.title = `${project.title} · Yassine Cherni`;
    return () => {
      document.title = "Yassine Cherni · Full-stack software engineer";
    };
  }, [project]);

  if (!project) return <Navigate to="/projects" replace />;

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  return (
    // Keyed by slug so moving to the next project starts at the top of the page.
    <PageShell key={slug}>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 md:px-8 pt-10 md:pt-16">
        <Link to="/projects" className="text-sm font-semibold text-gray-400 hover:text-white">
          ← All projects
        </Link>
        <p className="mt-8 font-mono text-sm text-amber-400">
          {project.year} · {project.context}
        </p>
        <h1 className="font-display mt-2 text-4xl md:text-6xl font-bold leading-tight text-white">
          {project.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg md:text-xl text-gray-300">{project.tagline}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {project.links.map((l, i) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className={
                i === 0
                  ? "rounded-lg bg-amber-500 px-5 py-3 font-bold text-black hover:bg-amber-400"
                  : "rounded-lg border-2 border-white/70 px-5 py-3 font-bold text-white hover:bg-white hover:text-black"
              }
            >
              {l.label} ↗
            </a>
          ))}
        </div>

        <dl className="mt-10 grid gap-6 border-y border-white/10 py-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-widest text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-white">{project.role}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-gray-500">Timeline</dt>
            <dd className="mt-1 text-sm text-white">{project.duration || project.year}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-gray-500">Stack</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <span key={s} className="rounded border border-white/10 px-1.5 py-0.5 text-xs text-gray-300">
                  {s}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      {/* Cover */}
      <section className="mx-auto mt-10 max-w-6xl px-4 md:px-8">
        <img
          src={asset(project.gallery?.[0]?.src || project.cover)}
          alt={`${project.title} screenshot`}
          className="w-full rounded-2xl border border-white/10"
        />
      </section>

      {/* Numbers */}
      {project.stats && (
        <section className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-4 px-4 md:px-8 md:grid-cols-4">
          {project.stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-display text-3xl md:text-4xl font-bold text-amber-400">{s.value}</p>
              <p className="mt-1 text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </section>
      )}

      {/* Challenge */}
      <section className="mx-auto mt-16 max-w-6xl px-4 md:px-8 grid gap-6 md:grid-cols-[1fr_2fr]">
        <SectionTitle eyebrow="The problem">Challenge</SectionTitle>
        <p className="text-lg leading-relaxed text-gray-300">{project.challenge}</p>
      </section>

      {/* Features */}
      <section className="mx-auto mt-16 max-w-6xl px-4 md:px-8">
        <SectionTitle eyebrow="The solution">What I built</SectionTitle>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {project.features.map((f, i) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-xs text-amber-400">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="font-display mt-2 text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      {project.architecture && (
        <section className="mx-auto mt-16 max-w-6xl px-4 md:px-8">
          <SectionTitle eyebrow="How it fits together">Architecture</SectionTitle>
          <div className="mt-8 space-y-3">
            {project.architecture.map((row, i) => (
              <div key={row.layer}>
                <div className="grid items-center gap-3 md:grid-cols-[140px_1fr]">
                  <p className="font-mono text-xs uppercase tracking-widest text-gray-500">{row.layer}</p>
                  <div className="flex flex-wrap gap-2">
                    {row.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                {i < project.architecture.length - 1 && (
                  <p className="md:ml-[152px] mt-2 text-amber-400/70">↓</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Highlights + code */}
      {(project.highlights || project.code) && (
        <section className="mx-auto mt-16 max-w-6xl px-4 md:px-8 grid gap-12">
          {project.highlights && (
            <div>
              <SectionTitle eyebrow="Engineering">Highlights</SectionTitle>
              <ul className="mt-6 space-y-4">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-gray-300">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.code && (
            <div>
              <SectionTitle eyebrow="From the code">{project.code.file}</SectionTitle>
              <div className="mt-6">
                <CodeBlock file={project.code.file} lang={project.code.lang} source={project.code.source} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* Gallery */}
      {project.gallery && project.gallery.length > 1 && (
        <section className="mx-auto mt-16 max-w-6xl px-4 md:px-8">
          <SectionTitle eyebrow="Screens">Gallery</SectionTitle>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {project.gallery.slice(1).map((g) => (
              <figure key={g.src}>
                <img src={asset(g.src)} alt={g.caption} loading="lazy" className="w-full rounded-xl border border-white/10" />
                <figcaption className="mt-2 text-sm text-gray-500">{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Next project */}
      <section className="mx-auto mt-16 max-w-6xl px-4 md:px-8">
        <Link
          to={`/projects/${next.slug}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-6 hover:border-amber-400/60"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Next project</p>
            <p className="font-display mt-1 text-2xl font-bold text-white">{next.title}</p>
            <p className="text-sm text-gray-400">{next.tagline}</p>
          </div>
          <span className="text-3xl text-amber-400 transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </section>
    </PageShell>
  );
};
