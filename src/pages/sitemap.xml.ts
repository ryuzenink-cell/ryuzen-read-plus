import { SITE } from '../lib/site';

const staticRoutes = [
  '/', '/explorar/', '/gratuitos/', '/novidades/', '/rankings/', '/para-autores/', '/enviar-obra/', '/sobre/', '/contato/', '/termos/', '/privacidade/'
];

function entry(path: string, priority = '0.7') {
  return `<url><loc>${SITE.url}${path}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}

export async function GET() {
  const urls = staticRoutes.map((route) => entry(route, route === '/' ? '1.0' : '0.7'));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
