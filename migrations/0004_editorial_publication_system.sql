PRAGMA foreign_keys = ON;

-- Editorial fields for novels/webnovels. This migration assumes the original MVP schema exists.
ALTER TABLE works ADD COLUMN short_description TEXT;
ALTER TABLE works ADD COLUMN seo_title TEXT;
ALTER TABLE works ADD COLUMN seo_description TEXT;
ALTER TABLE works ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'scheduled', 'published', 'hidden', 'archived'));
ALTER TABLE works ADD COLUMN language TEXT NOT NULL DEFAULT 'pt-BR';
ALTER TABLE works ADD COLUMN age_rating TEXT;
ALTER TABLE works ADD COLUMN cover_alt TEXT;
ALTER TABLE works ADD COLUMN cover_credit TEXT;
ALTER TABLE works ADD COLUMN banner_alt TEXT;
ALTER TABLE works ADD COLUMN banner_credit TEXT;
ALTER TABLE works ADD COLUMN author_name TEXT NOT NULL DEFAULT 'Ryuzen';
ALTER TABLE works ADD COLUMN editorial_notes TEXT;
ALTER TABLE works ADD COLUMN featured_priority INTEGER NOT NULL DEFAULT 0;
ALTER TABLE works ADD COLUMN featured_label TEXT;
ALTER TABLE works ADD COLUMN featured_starts_at TEXT;
ALTER TABLE works ADD COLUMN featured_ends_at TEXT;
ALTER TABLE works ADD COLUMN external_url TEXT;
ALTER TABLE works ADD COLUMN external_label TEXT;
ALTER TABLE works ADD COLUMN published_at TEXT;
ALTER TABLE works ADD COLUMN scheduled_at TEXT;

ALTER TABLE chapters ADD COLUMN volume_id TEXT;
ALTER TABLE chapters ADD COLUMN content_format TEXT NOT NULL DEFAULT 'markdown' CHECK (content_format IN ('markdown', 'html', 'plain'));
ALTER TABLE chapters ADD COLUMN seo_title TEXT;
ALTER TABLE chapters ADD COLUMN seo_description TEXT;
ALTER TABLE chapters ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'scheduled', 'published', 'hidden', 'archived'));
ALTER TABLE chapters ADD COLUMN scheduled_at TEXT;

CREATE TABLE IF NOT EXISTS volumes (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  number REAL NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'scheduled', 'published', 'hidden', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(work_id, number),
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS work_tags (
  work_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (work_id, tag_id),
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS external_media (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('work', 'chapter')),
  entity_id TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  credit TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('cover', 'banner', 'inline')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE featured_slots ADD COLUMN slot_key TEXT NOT NULL DEFAULT 'home_featured';
ALTER TABLE featured_slots ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
ALTER TABLE featured_slots ADD COLUMN active INTEGER NOT NULL DEFAULT 1;
ALTER TABLE featured_slots ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_works_publication ON works(publication_status, published_at, updated_at);
CREATE INDEX IF NOT EXISTS idx_works_type_publication ON works(type, publication_status);
CREATE INDEX IF NOT EXISTS idx_works_featured ON works(is_featured, featured_priority);
CREATE INDEX IF NOT EXISTS idx_chapters_publication ON chapters(work_id, publication_status, published_at);
CREATE INDEX IF NOT EXISTS idx_chapters_volume ON chapters(volume_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_work_tags_work ON work_tags(work_id);
CREATE INDEX IF NOT EXISTS idx_featured_slots_work ON featured_slots(work_id, active, priority);
CREATE INDEX IF NOT EXISTS idx_external_media_entity ON external_media(entity_type, entity_id);
