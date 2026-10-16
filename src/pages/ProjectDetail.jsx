import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../components/site/SiteChrome";
import { getProject, projects } from "../data/projects";
import { asset } from "../lib/asset";
import { TOKEN_COLORS, tokenizeLine } from "../lib/highlight";

const Label = ({ children }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{children}</p>
);

// A titled band: label + serif heading in a narrow left column, content on the right.
const Band = ({ label, title, children }) => (
  <section className="mx-auto max-w-6xl px-5 md:px-8">
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 border-t border-line pt-8 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-12 md:pt-10">
      <div>
        <Label>{label}</Label>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl leading-[1.05]">{title}</h2>
      </div>
      {/* min-w-0: the code sample scrolls inside its box instead of widening the page on phones */}
      <div className="min-w-0">{children}</div>
    </div>
  </section>
);

const CodeBlock = ({ file, lang, source }) => (
  <div className="overflow-hidden rounded-xl bg-[#1e1f24]">
    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-3 font-mono text-xs text-zinc-400">{file}</span>
    </div>
    <pre className="overflow-x-auto p-4 md:p-6 font-mono text-xs md:text-[13px] leading-relaxed [font-variant-ligatures:none]">
      {source.split("\n").map((line, i) => (
        <div key={i} className="flex">
          <span className="mr-5 w-6 shrink-0 select-none text-right text-zinc-600">{i + 1}</span>
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
    window.scrollTo(0, 0);
    return () => {
      document.title = "Yassine Cherni · Full-stack software engineer";
    };
  }, [project]);

  if (!project) return <Navigate to="/projects" replace />;

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  return (
    <PageShell key={slug}>
      {/* Title */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 pt-10 md:pt-16">
        <Link to="/projects" className="link-draw text-sm text-muted hover:text-ink">
          ← All projects
        </Link>
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_320px] md:items-end">
          <div>
            <Label>
              {project.year} · {project.context}
            </Label>
            <h1 className="mt-3 font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.92]">{project.title}</h1>
            <p className="mt-5 max-w-2xl text-lg md:text-xl leading-relaxed text-muted">{project.tagline}.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 md:justify-end">
            {project.links.map((l, i) =>
              i === 0 ? (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-ink px-5 py-2.5 font-medium text-paper transition-transform hover:-translate-y-0.5"
                >
                  {l.label} ↗
                </a>
              ) : (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="link-draw self-center font-medium">
                  {l.label} ↗
                </a>
              )
            )}
          </div>
        </div>

        <dl className="mt-12 grid gap-6 border-y border-line py-6 sm:grid-cols-3">
          <div>
            <dt><Label>Role</Label></dt>
            <dd className="mt-2 text-[15px]">{project.role}</dd>
          </div>
          <div>
            <dt><Label>Timeline</Label></dt>
            <dd className="mt-2 text-[15px]">{project.duration || project.year}</dd>
          </div>
          <div>
            <dt><Label>Stack</Label></dt>
            <dd className="mt-2 text-[15px] leading-relaxed">{project.stack.join(" · ")}</dd>
          </div>
        </dl>
      </section>

      {/* Cover */}
      <section className="mx-auto mt-10 max-w-6xl px-5 md:px-8">
        <img
          src={asset(project.gallery?.[0]?.src || project.cover)}
          alt={`${project.title} screenshot`}
          className="w-full rounded-xl border border-line"
        />
      </section>

      {/* Numbers */}
      {project.stats && (
        <section className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-y-8 px-5 md:px-8 md:grid-cols-4">
          {project.stats.map((s) => (
            <div key={s.label} className="border-l border-line pl-4">
              <p className="font-serif text-5xl leading-none">{s.value}</p>
              <p className="mt-2 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </section>
      )}

      <div className="mt-16 space-y-16">
        <Band label="The problem" title="Challenge">
          <p className="max-w-2xl text-lg leading-relaxed">{project.challenge}</p>
        </Band>

        <Band label="The solution" title="What I built">
          <ol className="divide-y divide-line border-y border-line">
            {project.features.map((f, i) => (
              <li key={f.title} className="grid gap-2 py-5 md:grid-cols-[48px_220px_1fr] md:gap-6">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-medium">{f.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{f.text}</p>
              </li>
            ))}
          </ol>
        </Band>

        {project.architecture && (
          <Band label="How it fits together" title="Architecture">
            <div className="divide-y divide-line border-y border-line">
              {project.architecture.map((row) => (
                <div key={row.layer} className="grid gap-2 py-4 md:grid-cols-[120px_1fr] md:gap-6">
                  <Label>{row.layer}</Label>
                  <p className="text-[15px]">{row.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </Band>
        )}

        {project.highlights && (
          <Band label="Engineering" title="Highlights">
            <ul className="space-y-4">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-4 text-[15px] leading-relaxed">
                  <span className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Band>
        )}

        {project.code && (
          <Band label="From the code" title={project.code.file}>
            <CodeBlock file={project.code.file} lang={project.code.lang} source={project.code.source} />
          </Band>
        )}

        {project.gallery && project.gallery.length > 1 && (
          <Band label="Screens" title="Gallery">
            <div className="grid gap-6 md:grid-cols-2">
              {project.gallery.slice(1).map((g) => (
                <figure key={g.src}>
                  <img src={asset(g.src)} alt={g.caption} loading="lazy" className="w-full rounded-lg border border-line" />
                  <figcaption className="mt-2 text-sm text-muted">{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          </Band>
        )}
      </div>

      {/* Next project */}
      <section className="mx-auto mt-20 max-w-6xl px-5 md:px-8">
        <Link to={`/projects/${next.slug}`} className="group block border-t border-line pt-8">
          <Label>Next project</Label>
          <p className="mt-2 flex items-baseline gap-4 font-serif text-[clamp(2.4rem,5vw,4.2rem)] leading-none">
            {next.title}
            <span className="text-accent transition-transform duration-300 group-hover:translate-x-2">→</span>
          </p>
          <p className="mt-2 text-muted">{next.tagline}</p>
        </Link>
      </section>
    </PageShell>
  );
};
