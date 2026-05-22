PRAGMA foreign_keys = ON;

-- Banners editoriais da home. A área administrativa pode usar banners de obras
-- publicadas ou cadastrar imagens externas, sem fazer upload para a plataforma.
CREATE TABLE IF NOT EXISTS home_banners (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL DEFAULT 'external' CHECK (source_type IN ('work', 'external')),
  work_id TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  alt_text TEXT,
  eyebrow TEXT,
  title TEXT NOT NULL,
  description TEXT,
  cta_label TEXT,
  cta_url TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_home_banners_active_priority
  ON home_banners(active, priority, updated_at);
CREATE INDEX IF NOT EXISTS idx_home_banners_work_id
  ON home_banners(work_id);
