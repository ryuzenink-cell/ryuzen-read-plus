PRAGMA foreign_keys = ON;

-- Rodada administrativa: campos opcionais, calendário interno, atividades e preferências.
-- Nenhuma tabela existente é removida e nenhum campo novo é obrigatório sem padrão seguro.
ALTER TABLE works ADD COLUMN alternate_title TEXT;
ALTER TABLE works ADD COLUMN illustrator_name TEXT;
ALTER TABLE works ADD COLUMN mobile_banner_url TEXT;
ALTER TABLE works ADD COLUMN social_image_url TEXT;
ALTER TABLE works ADD COLUMN content_warnings TEXT;
ALTER TABLE works ADD COLUMN access_model TEXT NOT NULL DEFAULT 'free' CHECK (access_model IN ('free', 'external', 'mixed'));

ALTER TABLE chapters ADD COLUMN chapter_type TEXT NOT NULL DEFAULT 'chapter' CHECK (chapter_type IN ('prologue', 'chapter', 'interlude', 'epilogue', 'extra'));
ALTER TABLE chapters ADD COLUMN volume_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE chapters ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;

ALTER TABLE home_banners ADD COLUMN secondary_cta_label TEXT;
ALTER TABLE home_banners ADD COLUMN secondary_cta_url TEXT;
ALTER TABLE home_banners ADD COLUMN duration_ms INTEGER;

CREATE TABLE IF NOT EXISTS editorial_calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('new_chapter', 'new_work', 'announcement', 'special_event', 'campaign', 'maintenance')),
  work_id TEXT,
  chapter_id TEXT,
  scheduled_at TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
  future_public INTEGER NOT NULL DEFAULT 0,
  future_home_highlight INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE SET NULL,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_activity (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_title TEXT,
  actor_id TEXT,
  actor_email TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_by TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('platform_name', 'Ryuzen Read Plus');
INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('institutional_text', 'Plataforma curada para light novels, webnovels e histórias originais da Ryuzen.');
INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('banner_duration_ms', '7000');
INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('max_active_banners', '6');
INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('featured_enabled', 'true');

CREATE INDEX IF NOT EXISTS idx_editorial_events_schedule ON editorial_calendar_events(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_editorial_events_work ON editorial_calendar_events(work_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_entity ON admin_activity(entity_type, entity_id);
