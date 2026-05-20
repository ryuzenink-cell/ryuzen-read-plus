export const SITE = {
  name: 'Ryuzen Read Plus',
  shortName: 'RRP',
  url: 'https://read.ryuzen.ink',
  description: 'Plataforma de leitura digital da Ryuzen para light novels, mangás, webnovels e obras autorais.',
  email: 'hello@ryuzen.ink',
  locale: 'pt_BR',
  twitter: '@RyuzenInk'
};

export function absoluteUrl(path = '/') {
  return new URL(path, SITE.url).toString();
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(date));
}

export function typeLabel(type: string) {
  const labels: Record<string, string> = {
    light_novel: 'Light Novel',
    manga: 'Mangá',
    webnovel: 'Webnovel'
  };
  return labels[type] ?? type;
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ongoing: 'Em andamento',
    completed: 'Concluída',
    development: 'Em desenvolvimento',
    soon: 'Em breve',
    paused: 'Pausada'
  };
  return labels[status] ?? status;
}
