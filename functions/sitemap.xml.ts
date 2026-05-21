import { requireDb } from './_lib/auth';
import { escapeHtml, publicWhere } from './_lib/editorial';

const SITE = 'https://readplus.ryuzen.ink';
const staticRoutes = ['/', '/explorar/', '/gratuitos/', '/novidades/', '/rankings/', '/para-autores/', '/enviar-obra/', '/sobre/', '/contato/', '/termos/', '/privacidade/'];
function entry(path: string, priority = '0.7') {
  return `<url><loc>${escapeHtml(SITE + path)}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}
export async function onRequestGet({ env }: any) {
  const urls = staticRoutes.map((route) => entry(route, route === '/' ? '1.0' : '0.7'));
  try {
    const db = requireDb(env);
    const { results: works = [] } = await db.prepare(`SELECT slug FROM works WHERE ${publicWhere('works')} ORDER BY updated_at DESC LIMIT 5000`).all<any>();
    for (const work of works) urls.push(entry(`/obra/${work.slug}/`, '0.8'));
    const { results: chapters = [] } = await db.prepare(`SELECT works.slug AS work_slug, chapters.slug FROM chapters INNER JOIN works ON works.id = chapters.work_id WHERE ${publicWhere('works')} AND chapters.publication_status = 'published' ORDER BY chapters.updated_at DESC LIMIT 20000`).all<any>();
    for (const chapter of chapters) urls.push(entry(`/obra/${chapter.work_slug}/${chapter.slug}/`, '0.6'));
  } catch {
    // Mantém ao menos as rotas públicas quando o banco ainda não estiver configurado.
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
