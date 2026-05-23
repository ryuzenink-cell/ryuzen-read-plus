export const PROFILE_AVATARS = [
  { key: 'avatar-01', label: 'Avatar Estrela', src: '/assets/avatars/default/avatar-01.webp' },
  { key: 'avatar-02', label: 'Avatar Flores', src: '/assets/avatars/default/avatar-02.webp' },
  { key: 'avatar-03', label: 'Avatar Sorriso', src: '/assets/avatars/default/avatar-03.webp' },
  { key: 'avatar-04', label: 'Avatar Mascote', src: '/assets/avatars/default/avatar-04.webp' },
  { key: 'avatar-05', label: 'Avatar Surpresa', src: '/assets/avatars/default/avatar-05.webp' },
  { key: 'avatar-06', label: 'Avatar Abraço', src: '/assets/avatars/default/avatar-06.webp' },
  { key: 'avatar-07', label: 'Avatar Flores Douradas', src: '/assets/avatars/default/avatar-07.webp' }
] as const;

export const FAVORITE_GENRES = ['Fantasia', 'Comédia', 'Romance', 'Isekai', 'Mistério', 'Drama', 'Aventura', 'Sobrenatural', 'Ação', 'Slice of life'] as const;
export const READING_THEMES = ['dark', 'light', 'system'] as const;
export const READING_FONT_SIZES = ['small', 'medium', 'large'] as const;
export const READING_LINE_HEIGHTS = ['compact', 'normal', 'relaxed'] as const;
export const READING_CONTENT_WIDTHS = ['comfortable', 'wide'] as const;

const avatarKeys = new Set<string>(PROFILE_AVATARS.map((avatar) => avatar.key));
const genreNames = new Set<string>(FAVORITE_GENRES);
const themes = new Set<string>(READING_THEMES);
const fontSizes = new Set<string>(READING_FONT_SIZES);
const lineHeights = new Set<string>(READING_LINE_HEIGHTS);
const widths = new Set<string>(READING_CONTENT_WIDTHS);

export function profileAvatar(key: unknown) {
  const value = String(key || '');
  return avatarKeys.has(value) ? value : PROFILE_AVATARS[0].key;
}
export function validatedAvatar(key: unknown) {
  const value = String(key || '');
  if (!avatarKeys.has(value)) throw new Error('Escolha um avatar oficial válido.');
  return value;
}
export function profileAvatarSrc(key: unknown) {
  return PROFILE_AVATARS.find((avatar) => avatar.key === profileAvatar(key))!.src;
}
export function normalizeDisplayName(value: unknown, fallback = '') {
  const clean = String(value ?? fallback).replace(/\s+/g, ' ').trim().slice(0, 40);
  if (clean.length < 2) throw new Error('Informe um nome de exibição com pelo menos 2 caracteres.');
  return clean;
}
export function normalizeBio(value: unknown) {
  const clean = String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length > 160) throw new Error('A bio deve ter até 160 caracteres.');
  return clean || null;
}
export function normalizeGenres(value: unknown) {
  const list = Array.isArray(value) ? value.map((item) => String(item)) : [];
  if (list.some((item) => !genreNames.has(item))) throw new Error('Selecione apenas gêneros disponíveis.');
  const result = [...new Set(list)];
  if (result.length > 5) throw new Error('Escolha no máximo 5 gêneros favoritos.');
  return result;
}
export function preference(value: unknown, allowed: Set<string>, fallback: string) {
  const normalized = String(value || '');
  return allowed.has(normalized) ? normalized : fallback;
}
export function normalizeProfilePayload(body: any, existingName = '') {
  return {
    display_name: normalizeDisplayName(body.display_name ?? body.displayName, existingName),
    bio: normalizeBio(body.bio),
    avatar_key: validatedAvatar(body.avatar_key ?? body.avatarKey),
    favorite_genres: normalizeGenres(body.favorite_genres ?? body.favoriteGenres),
    email_updates_enabled: body.email_updates_enabled === true || body.emailUpdatesEnabled === true || body.email_updates_enabled === 1 ? 1 : 0,
    reading_theme: preference(body.reading_theme ?? body.readingTheme, themes, 'dark'),
    reading_font_size: preference(body.reading_font_size ?? body.readingFontSize, fontSizes, 'medium'),
    reading_line_height: preference(body.reading_line_height ?? body.readingLineHeight, lineHeights, 'normal'),
    reading_content_width: preference(body.reading_content_width ?? body.readingContentWidth, widths, 'comfortable')
  };
}
export function safeGenres(raw: unknown) {
  try { return normalizeGenres(JSON.parse(String(raw || '[]'))); } catch { return []; }
}
