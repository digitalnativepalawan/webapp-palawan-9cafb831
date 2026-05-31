import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Layers, Mail } from "lucide-react";
import mqLogo from "@/assets/mq-logo.png";
import { useContent } from "@/store/content";
import { AdminTrigger } from "@/components/AdminPanel";

export const Route = createFileRoute("/workspace")({
  component: WorkspacePage,
  head: () => ({
    meta: [
      { title: "Working Projects — merQato.digital" },
      { name: "description", content: "Live gallery of projects Hermes is currently building, shipping and maintaining for merQato." },
      { property: "og:title", content: "Working Projects — merQato.digital" },
      { property: "og:description", content: "Live gallery of projects Hermes is currently building for merQato." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function MQLogo({ className = "" }: { className?: string }) {
  return <img src={mqLogo} alt="MQ" className={className} />;
}

function WorkspaceHeader() {
  return (
    <header className="px-4 md:px-6 lg:px-10 pt-5 md:pt-6 pb-4">
      <div className="grid grid-cols-12 gap-3 md:gap-4 text-[10px] uppercase tracking-[0.14em]">
        <div className="col-span-6 md:col-span-4">
          <Link to="/" className="hover:text-accent transition-colors">
            <div className="text-ink">MERQATO.DIGITAL</div>
            <div className="text-ink-mute mt-0.5 text-[9px] md:text-[10px]">DIGITAL INFRASTRUCTURE STUDIO</div>
          </Link>
        </div>
        <div className="col-span-6 md:col-span-4 flex justify-end md:justify-center items-start gap-4 md:gap-6">
          <Link to="/" className="text-ink-dim hover:text-accent transition-colors">HOME</Link>
          <Link to="/agents" className="text-ink-dim hover:text-accent transition-colors">OPERATORS</Link>
          <span className="text-accent border-b border-accent">WORKSPACE</span>
        </div>
        <div className="hidden md:flex col-span-4 justify-end">
          <MQLogo className="w-12 h-auto" />
        </div>
      </div>
    </header>
  );
}

function statusTone(status: string) {
  const s = status.toUpperCase();
  if (s.includes("LIVE")) return "text-accent border-accent/40";
  if (s.includes("BUILD")) return "text-amber-400 border-amber-400/40";
  if (s.includes("READY")) return "text-blue-400 border-blue-400/40";
  return "text-ink-dim border-line-soft";
}

function WorkspacePage() {
  const { content } = useContent();
  const projects = content.workProjects || [];

  return (
    <main className="min-h-screen bg-background text-ink">
      <WorkspaceHeader />

      {/* Hero */}
      <section className="px-4 md:px-6 lg:px-10 pt-4">
        <div className="corner border border-line relative overflow-hidden">
          <div className="c1" /><div className="c2" />
          <div className="relative py-10 md:py-16 px-6 md:px-10 text-center">
            <div className="label text-[9px] md:text-[10px] mb-3 text-accent">
              — CURRENT WORK —
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl text-ink leading-[0.95]">
              Working Projects
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-ink-dim text-[11px] md:text-[12px] leading-relaxed">
              A live gallery of every project Hermes is currently building, shipping and maintaining.
              Visuals and notes are updated directly from the admin panel.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 border border-line bg-surface/30 px-3 py-2 text-[9px] uppercase tracking-[0.14em]">
              <Layers className="w-3.5 h-3.5 text-accent" />
              <span className="text-ink-dim">PROJECTS IN ROTATION</span>
              <span className="text-accent">{projects.length.toString().padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Project grid */}
      <section className="px-4 md:px-6 lg:px-10 pt-6 pb-12">
        {projects.length === 0 ? (
          <div className="corner border border-line p-10 text-center text-ink-dim text-[12px]">
            <div className="c1" /><div className="c2" />
            No projects yet. Open the admin panel and add one under the <span className="text-accent">workspace</span> tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p, i) => (
              <article key={p.id} className="corner border border-line overflow-hidden flex flex-col group hover:border-accent/40 transition-colors">
                <div className="c1" /><div className="c2" />
                <div className="aspect-[16/10] bg-surface overflow-hidden border-b border-line">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-mute text-[10px] uppercase tracking-[0.14em]">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.14em]">
                    <span className="text-ink-mute">{String(i + 1).padStart(2, "0")} · {p.tag || "WORK"}</span>
                    <span className={`px-2 py-0.5 border ${statusTone(p.status)}`}>{p.status || "—"}</span>
                  </div>
                  <h2 className="font-serif text-xl md:text-2xl text-ink leading-tight">{p.title}</h2>
                  <p className="text-[12px] text-ink-dim leading-relaxed whitespace-pre-wrap flex-1">
                    {p.description}
                  </p>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-accent hover:underline self-start"
                    >
                      Visit project <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-4 md:px-6 lg:px-10 pb-6">
        <div className="corner border border-accent/40 relative overflow-hidden p-8 md:p-12 text-center">
          <div className="c1" /><div className="c2" />
          <div className="label text-accent mb-3">/ NEED AN AI OPERATOR?</div>
          <h2 className="font-serif text-2xl md:text-4xl text-ink max-w-xl mx-auto leading-[1.05]">
            Let's build something together
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/agents" className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-background transition-all">
              AI Operators <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <a href="mailto:hello@merqato.digital" className="inline-flex items-center gap-2 border border-line px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-ink-dim hover:border-accent hover:text-accent transition-all">
              Contact Team <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <footer className="px-6 lg:px-10 pt-12 pb-6 mt-4 border-t border-line">
        <div className="grid grid-cols-12 gap-4 items-center text-[10px] uppercase tracking-[0.14em]">
          <div className="col-span-12 md:col-span-4">
            <div className="text-ink">MERQATO.DIGITAL</div>
            <div className="text-ink-mute mt-0.5">WORKING PROJECTS</div>
          </div>
          <div className="col-span-12 md:col-span-4 flex items-center justify-center gap-4">
            <Link to="/" className="text-ink-dim hover:text-accent transition-colors">HOME</Link>
            <Link to="/agents" className="text-ink-dim hover:text-accent transition-colors">OPERATORS</Link>
            <span className="text-accent">WORKSPACE</span>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <div className="text-ink">© 2026 MERQATO.DIGITAL</div>
            <div className="text-ink-mute mt-0.5">ALL SYSTEMS RESERVED</div>
          </div>
        </div>
      </footer>
      <AdminTrigger />
    </main>
  );
}