export type WorkType = 'light_novel' | 'webnovel';
export type WorkStatus = 'ongoing' | 'completed' | 'development' | 'soon' | 'paused';

export interface Work {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  type: WorkType;
  status: WorkStatus;
  cover: string;
  banner?: string;
  author: string;
  genres: string[];
  tags: string[];
  rating?: number;
  featured: boolean;
  free: boolean;
  createdAt: string;
  updatedAt: string;
}

// O catálogo público real é carregado pelas APIs/D1.
// Este array permanece vazio para evitar reintroduzir obras fictícias no MVP.
export const works: Work[] = [];

export const featuredWorks = works.filter((work) => work.featured);
export const freeWorks = works.filter((work) => work.free);
export const latestWorks = [...works].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

export function getWorkBySlug(slug: string) {
  return works.find((work) => work.slug === slug);
}
