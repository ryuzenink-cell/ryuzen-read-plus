export interface Chapter {
  id: string;
  workSlug: string;
  chapterSlug: string;
  number: number;
  title: string;
  excerpt: string;
  content: string[];
  isFree: boolean;
  publishedAt: string;
}

// Capítulos reais são carregados pelas APIs/D1. Mantido vazio para o sitemap estático não publicar exemplos.
export const chapters: Chapter[] = [];

export function getChaptersByWork(workSlug: string) {
  return chapters
    .filter((chapter) => chapter.workSlug === workSlug)
    .sort((a, b) => a.number - b.number);
}

export function getChapter(workSlug: string, chapterSlug: string) {
  return chapters.find((chapter) => chapter.workSlug === workSlug && chapter.chapterSlug === chapterSlug);
}

export function getRecentChapters(limit = 6) {
  return [...chapters]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit);
}
