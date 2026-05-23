import { json, readJson, methodNotAllowed } from '../../_lib/http';
import { getSessionUser, requireDb } from '../../_lib/auth';
import { publicWhere } from '../../_lib/editorial';
import { PROFILE_AVATARS, profileAvatar, profileAvatarSrc, safeGenres, normalizeProfilePayload } from '../../_lib/profile';

function publicProfile(row: any) {
  const avatarKey = profileAvatar(row.avatar_key);
  return {
    id: row.id,
    displayName: row.display_name || row.name,
    email: row.email,
    role: row.role,
    bio: row.bio || '',
    avatarKey,
    avatarSrc: profileAvatarSrc(avatarKey),
    favoriteGenres: safeGenres(row.favorite_genres),
    emailUpdatesEnabled: Boolean(row.email_updates_enabled),
    createdAt: row.created_at,
    preferences: {
      theme: row.reading_theme || 'dark',
      fontSize: row.reading_font_size || 'medium',
      lineHeight: row.reading_line_height || 'normal',
      contentWidth: row.reading_content_width || 'comfortable'
    }
  };
}

export async function onRequestGet({ request, env }: any) {
  try {
    const db = requireDb(env);
    const sessionUser = await getSessionUser(env, request);
    if (!sessionUser) return json({ ok: false, authenticated: false, message: 'Entre para acessar seu perfil.' }, { status: 401 });
    const row = await db.prepare(`SELECT id, name, email, role, created_at, display_name, bio, avatar_key, favorite_genres, email_updates_enabled, reading_theme, reading_font_size, reading_line_height, reading_content_width FROM users WHERE id = ? LIMIT 1`).bind(sessionUser.id).first<any>();
    if (!row) return json({ ok: false, authenticated: false, message: 'Conta não encontrada.' }, { status: 404 });
    const count = await db.prepare(`SELECT COUNT(*) AS total FROM library_items INNER JOIN works ON works.id = library_items.work_id WHERE library_items.user_id = ? AND ${publicWhere('works')}`).bind(sessionUser.id).first<any>();
    const latestProgress = await db.prepare(`SELECT works.title, works.slug AS work_slug, works.cover_url, chapters.title AS chapter_title, chapters.slug AS chapter_slug, reading_progress.progress_percent, reading_progress.updated_at FROM reading_progress INNER JOIN works ON works.id = reading_progress.work_id INNER JOIN chapters ON chapters.id = reading_progress.chapter_id WHERE reading_progress.user_id = ? AND chapters.publication_status = 'published' AND ${publicWhere('works')} ORDER BY reading_progress.updated_at DESC LIMIT 1`).bind(sessionUser.id).first<any>();
    const { results: news = [] } = await db.prepare(`SELECT chapters.title AS chapter_title, chapters.slug AS chapter_slug, chapters.published_at, works.title AS work_title, works.slug AS work_slug FROM library_items INNER JOIN works ON works.id = library_items.work_id INNER JOIN chapters ON chapters.work_id = works.id WHERE library_items.user_id = ? AND chapters.publication_status = 'published' AND ${publicWhere('works')} ORDER BY COALESCE(chapters.published_at, chapters.updated_at) DESC LIMIT 3`).bind(sessionUser.id).all<any>();
    return json({ ok: true, authenticated: true, profile: publicProfile(row), avatars: PROFILE_AVATARS, library: { count: Number(count?.total || 0), continueReading: latestProgress || null, news } });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar perfil.' }, { status: 500 });
  }
}

export async function onRequestPatch({ request, env }: any) {
  try {
    const db = requireDb(env);
    const user = await getSessionUser(env, request);
    if (!user) return json({ ok: false, authenticated: false, message: 'Entre para editar seu perfil.' }, { status: 401 });
    const body = await readJson<any>(request);
    const values = normalizeProfilePayload(body, user.name);
    await db.prepare(`UPDATE users SET display_name = ?, bio = ?, avatar_key = ?, favorite_genres = ?, email_updates_enabled = ?, reading_theme = ?, reading_font_size = ?, reading_line_height = ?, reading_content_width = ?, updated_at = ? WHERE id = ?`).bind(values.display_name, values.bio, values.avatar_key, JSON.stringify(values.favorite_genres), values.email_updates_enabled, values.reading_theme, values.reading_font_size, values.reading_line_height, values.reading_content_width, new Date().toISOString(), user.id).run();
    const row = await db.prepare(`SELECT id, name, email, role, created_at, display_name, bio, avatar_key, favorite_genres, email_updates_enabled, reading_theme, reading_font_size, reading_line_height, reading_content_width FROM users WHERE id = ? LIMIT 1`).bind(user.id).first<any>();
    return json({ ok: true, message: 'Perfil atualizado com sucesso.', profile: publicProfile(row) });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Não foi possível atualizar seu perfil. Tente novamente.' }, { status: 400 });
  }
}
export function onRequestOptions() { return methodNotAllowed('GET, PATCH'); }
