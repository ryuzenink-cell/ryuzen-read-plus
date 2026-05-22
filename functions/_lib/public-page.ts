import { escapeHtml } from './editorial';

const SITE_NAME = 'Ryuzen Read Plus';
const SITE_URL = 'https://readplus.ryuzen.ink';
const SITE_DESCRIPTION = 'Leia novels, webnovels e histórias seriadas na Ryuzen Read Plus.';
const NAV = [['/', 'Início'], ['/explorar/', 'Explorar'], ['/gratuitos/', 'Gratuitos'], ['/novidades/', 'Novidades'], ['/rankings/', 'Rankings'], ['/para-autores/', 'Para autores']];

function absoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return `${SITE_URL}/favicon.png`;
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : new URL(pathOrUrl, SITE_URL).toString();
}
function header(path: string) {
  const links = NAV.map(([href, label]) => `<a href="${href}"${path === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<header class="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="Página inicial da Ryuzen Read Plus"><img src="/icons/favicon-32x32.png" alt="" width="38" height="38"><span>Ryuzen Read Plus<small>Leitura digital autoral</small></span></a><nav class="nav" aria-label="Navegação principal">${links}</nav><div class="header-actions"><div class="auth-status" data-auth-status><a class="btn header-btn ghost" href="/login/">Entrar</a><a class="btn header-btn soft" href="/cadastro/">Criar conta</a></div><button class="theme-toggle" type="button" data-theme-toggle aria-label="Alternar tema"><span class="theme-toggle-icon">☀️</span><span class="theme-toggle-icon">/</span><span class="theme-toggle-icon">🌙</span></button></div></div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="container footer-grid"><div><strong>${SITE_NAME}</strong><p class="muted">Plataforma curada para light novels, webnovels e histórias originais da Ryuzen.</p><a href="mailto:hello@ryuzen.ink">hello@ryuzen.ink</a></div><div><strong>Leitura</strong><a href="/explorar/">Explorar</a><a href="/gratuitos/">Gratuitos</a><a href="/novidades/">Novidades</a><a href="/rankings/">Rankings</a></div><div><strong>Autores</strong><a href="/para-autores/">Para autores</a><a href="/enviar-obra/">Enviar obra</a><a href="/contato/">Contato comercial</a></div><div><strong>Institucional</strong><a href="/sobre/">Sobre</a><a href="/termos/">Termos</a><a href="/privacidade/">Privacidade</a></div></div></footer>`;
}
function themeScript() {
  return `<script>(()=>{try{const s=localStorage.getItem('rrp-theme');document.documentElement.dataset.theme=s==='dark'?'dark':'light'}catch{document.documentElement.dataset.theme='light'}document.addEventListener('click',(e)=>{const b=e.target.closest('[data-theme-toggle]');if(!b)return;const n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem('rrp-theme',n)})})()</script>`;
}
export function publicPage(options: { title: string; description?: string; body: string; image?: string; path?: string; jsonLd?: unknown[]; extraScripts?: string[] }) {
  const title = escapeHtml(options.title.includes(SITE_NAME) ? options.title : `${options.title} | ${SITE_NAME}`);
  const description = escapeHtml(options.description || SITE_DESCRIPTION);
  const path = options.path || '/';
  const canonical = escapeHtml(absoluteUrl(path));
  const image = escapeHtml(absoluteUrl(options.image || '/favicon.png'));
  const jsonLd = (options.jsonLd || []).map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`).join('');
  const scripts = (options.extraScripts || []).map((src) => `<script src="${escapeHtml(src)}" defer></script>`).join('');
  return new Response(`<!doctype html><html lang="pt-BR" data-theme="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.ico"><link rel="icon" type="image/png" href="/icons/favicon-32x32.png"><meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="${SITE_NAME}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}"><link rel="stylesheet" href="/assets/rrp.css">${themeScript()}${jsonLd}</head><body><a class="skip-link" href="#main">Ir para o conteúdo</a>${header(path)}<main id="main">${options.body}</main>${footer()}<script src="/assets/auth-status.js" defer></script>${scripts}</body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
export function readerPage(options: { title: string; description?: string; body: string; image?: string; path: string; jsonLd?: unknown[] }) {
  const title = escapeHtml(options.title.includes(SITE_NAME) ? options.title : `${options.title} | ${SITE_NAME}`);
  const description = escapeHtml(options.description || SITE_DESCRIPTION);
  const canonical = escapeHtml(absoluteUrl(options.path));
  const image = escapeHtml(absoluteUrl(options.image || '/favicon.png'));
  const jsonLd = (options.jsonLd || []).map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`).join('');
  return new Response(`<!doctype html><html lang="pt-BR" data-theme="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.ico"><meta property="og:type" content="article"><meta property="og:site_name" content="${SITE_NAME}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/assets/rrp.css">${themeScript()}${jsonLd}</head><body><div class="reader-progress-track" aria-hidden="true"><span data-reading-progress-bar></span></div><div class="reader-topbar"><div class="container reader-topbar-inner"><a class="brand" href="/"><img src="/icons/favicon-32x32.png" alt=""><span>${SITE_NAME}<small>Leitor</small></span></a><div class="reader-actions"><a class="btn ghost" href="/explorar/">Explorar</a><button class="btn ghost" type="button" data-reader-size="down" aria-label="Diminuir fonte">A−</button><button class="btn ghost" type="button" data-reader-size="up" aria-label="Aumentar fonte">A+</button><button class="theme-toggle" type="button" data-theme-toggle aria-label="Alternar tema">☀ / 🌙</button></div></div></div><main>${options.body}</main><script src="/assets/reader-controls.js" defer></script><script src="/assets/public-interactions.js" defer></script></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
