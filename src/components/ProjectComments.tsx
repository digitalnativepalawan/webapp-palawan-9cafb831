import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Comment = {
  id: string;
  project_id: string;
  author_name: string;
  body: string;
  rating: number;
  created_at: string;
};

export function ProjectComments({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_comments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as Comment[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [projectId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || !body.trim()) { setErr("Add your name and a comment."); return; }
    setBusy(true);
    const { error } = await supabase.from("project_comments").insert({
      project_id: projectId,
      author_name: name.trim().slice(0, 60),
      body: body.trim().slice(0, 2000),
      rating,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setBody(""); setRating(5);
    void load();
  };

  const avg = items.length ? items.reduce((s, c) => s + c.rating, 0) / items.length : 0;

  return (
    <div className="border-t border-line p-5 space-y-4 bg-background/30">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
        <span className="text-ink-mute">Comments · {items.length}</span>
        {items.length > 0 && (
          <span className="flex items-center gap-1 text-accent">
            <Star className="w-3 h-3 fill-current" /> {avg.toFixed(1)} / 5
          </span>
        )}
      </div>

      <form onSubmit={submit} className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            className="w-full bg-background border border-line p-2 text-ink text-[12px] focus:border-accent outline-none"
          />
          <div className="flex items-center gap-1 border border-line p-2">
            <span className="label text-ink-dim mr-2">RATING</span>
            {[1,2,3,4,5].map((s) => (
              <button
                type="button"
                key={s}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                aria-label={`${s} star${s>1?"s":""}`}
                className="p-0.5"
              >
                <Star className={`w-4 h-4 ${(hover || rating) >= s ? "text-accent fill-accent" : "text-ink-mute"}`} />
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts…"
          rows={3}
          maxLength={2000}
          className="w-full bg-background border border-line p-2 text-ink text-[12px] focus:border-accent outline-none"
        />
        {err && <div className="text-[10px] uppercase tracking-[0.14em] text-accent">{err}</div>}
        <button
          type="submit"
          disabled={busy}
          className="label px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-background disabled:opacity-50"
        >
          {busy ? "POSTING..." : "POST COMMENT"}
        </button>
      </form>

      {loading ? (
        <div className="text-[11px] text-ink-mute">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-[11px] text-ink-mute">Be the first to comment.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id} className="border border-line-soft p-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] mb-1">
                <span className="text-ink">{c.author_name}</span>
                <span className="flex items-center gap-1 text-accent">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${c.rating >= s ? "fill-current" : "text-ink-mute"}`} />
                  ))}
                </span>
              </div>
              <p className="text-[12px] text-ink-dim whitespace-pre-wrap">{c.body}</p>
              <div className="text-[9px] uppercase tracking-[0.14em] text-ink-mute mt-2">
                {new Date(c.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectComments;