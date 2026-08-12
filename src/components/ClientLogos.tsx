import { useContent } from "@/store/content";

export function ClientLogos() {
  const clients = useContent((s) => s.content.clients) || [];
  const title = useContent((s) => s.content.clientsTitle) || "TRUSTED BY";
  if (!clients.length) return null;

  return (
    <section className="px-4 md:px-6 lg:px-10 pt-12">
      <div className="border-t border-line pt-4">
        <div className="label mb-4">/ {title}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-l border-line">
          {clients.map((c) => {
            const href = c.url && c.url !== "#" ? c.url : undefined;
            const inner = (
              <span className="flex h-24 md:h-28 w-full items-center justify-center p-4">
                <img
                  src={c.logo}
                  alt={c.name}
                  title={c.name}
                  loading="lazy"
                  className="client-logo max-h-full max-w-full object-contain"
                />
              </span>
            );
            const cls =
              "group block border-b border-r border-line transition-colors hover:bg-accent/5";
            return href ? (
              <a key={c.id} href={href} target="_blank" rel="noreferrer noopener" className={cls}>
                {inner}
              </a>
            ) : (
              <div key={c.id} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ClientLogos;
