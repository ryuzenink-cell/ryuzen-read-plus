PRAGMA foreign_keys = ON;

-- Central privada do leitor: campos opcionais e preferências seguras.
-- Usuários existentes continuam válidos; o nome cadastrado segue como fallback.
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_key TEXT;
ALTER TABLE users ADD COLUMN favorite_genres TEXT NOT NULL DEFAULT '[]';
ALTER TABLE users ADD COLUMN email_updates_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN reading_theme TEXT NOT NULL DEFAULT 'dark' CHECK (reading_theme IN ('dark', 'light', 'system'));
ALTER TABLE users ADD COLUMN reading_font_size TEXT NOT NULL DEFAULT 'medium' CHECK (reading_font_size IN ('small', 'medium', 'large'));
ALTER TABLE users ADD COLUMN reading_line_height TEXT NOT NULL DEFAULT 'normal' CHECK (reading_line_height IN ('compact', 'normal', 'relaxed'));
ALTER TABLE users ADD COLUMN reading_content_width TEXT NOT NULL DEFAULT 'comfortable' CHECK (reading_content_width IN ('comfortable', 'wide'));

CREATE INDEX IF NOT EXISTS idx_library_user_updated ON library_items(user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_progress_user_updated ON reading_progress(user_id, updated_at);
