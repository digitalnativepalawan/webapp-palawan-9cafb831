
CREATE TABLE public.project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 60),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_comments_project_id ON public.project_comments(project_id, created_at DESC);

GRANT SELECT, INSERT ON public.project_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_comments TO authenticated;
GRANT ALL ON public.project_comments TO service_role;

ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
ON public.project_comments FOR SELECT
USING (true);

CREATE POLICY "Anyone can post a comment"
ON public.project_comments FOR INSERT
WITH CHECK (true);
