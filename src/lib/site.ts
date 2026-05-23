export const SITE = {
  name: 'Ryuzen ReadPlus',
  shortName: 'RRP',
  url: 'https://readplus.ryuzen.ink',
  description: 'Plataforma de leitura digital da Ryuzen para light novels, webnovels e obras autorais em texto.',
  email: 'hello@ryuzen.ink',
  locale: 'pt_BR',
  twitter: '@RyuzenInk'
};

export function absoluteUrl(path = '/') {
  return new URL(path, SITE.url).toString();
}

export function formatDate(date?: string | null) {
  if (!date) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(date));
}

export function typeLabel(type: string) {
  const labels: Record<string, string> = {
    light_novel: 'Light Novel',
    webnovel: 'Webnovel'
  };
  return labels[type] ?? type;
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ongoing: 'Em andamento',
    completed: 'Concluída',
    development: 'Em desenvolvimento',
    paused: 'Pausada',
    draft: 'Rascunho',
    scheduled: 'Agendada',
    published: 'Publicada',
    hidden: 'Oculta',
    archived: 'Arquivada'
  };
  return labels[status] ?? status;
}
