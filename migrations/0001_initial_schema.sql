PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'author', 'editor', 'admin')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS author_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  website_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('light_novel', 'manga', 'webnovel')),
  status TEXT NOT NULL CHECK (status IN ('ongoing', 'completed', 'development', 'soon', 'paused')),
  cover_url TEXT,
  banner_url TEXT,
  author_id TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_free INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES author_profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  number REAL NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  is_free INTEGER NOT NULL DEFAULT 1,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(work_id, slug),
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS genres (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS work_genres (
  work_id TEXT NOT NULL,
  genre_id TEXT NOT NULL,
  PRIMARY KEY (work_id, genre_id),
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS library_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  work_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'reading', 'finished', 'dropped')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, work_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reading_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  work_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  progress_percent REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, work_id, chapter_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS featured_slots (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  label TEXT,
  is_paid INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_works_slug ON works(slug);
CREATE INDEX IF NOT EXISTS idx_chapters_work ON chapters(work_id);
CREATE INDEX IF NOT EXISTS idx_events_type_created ON events(type, created_at);
