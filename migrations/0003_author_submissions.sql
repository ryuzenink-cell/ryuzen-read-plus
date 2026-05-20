CREATE TABLE IF NOT EXISTS author_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  pitch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'approved', 'rejected', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_author_submissions_email ON author_submissions(email);
CREATE INDEX IF NOT EXISTS idx_author_submissions_status_created ON author_submissions(status, created_at);
