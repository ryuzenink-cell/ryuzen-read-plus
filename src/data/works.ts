export type WorkType = 'light_novel' | 'manga' | 'webnovel';
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

export const works: Work[] = [
  {
    id: 'work_maou_sama',
    slug: 'fui-chamado-para-salvar-o-mundo',
    title: 'Fui chamado para salvar o mundo, mas aparentemente estou do lado dos vilões',
    subtitle: 'O NEET invocado pelo Rei Demônio',
    description: 'Ren é convocado para outro mundo esperando virar herói. O problema é que quem o invocou foi Maou-sama, uma pequena rainha demoníaca sobrecarregada, e a suposta luz do reino humano talvez esconda mentiras maiores do que qualquer magia sombria.',
    type: 'light_novel',
    status: 'ongoing',
    cover: '/images/covers/maou-sama.svg',
    author: 'Ryuzen Originals',
    genres: ['Isekai', 'Fantasia', 'Comédia', 'Aventura'],
    tags: ['Reino Demoníaco', 'Heróis', 'Comédia', 'Estratégia'],
    rating: 4.8,
    featured: true,
    free: true,
    createdAt: '2026-05-01',
    updatedAt: '2026-05-20'
  },
  {
    id: 'work_templo',
    slug: 'meu-templo-nao-e-harem',
    title: 'Meu Templo Não é Harém!',
    subtitle: 'Caos sobrenatural, sacerdotisas e mal-entendidos',
    description: 'Um templo tradicional se transforma em palco de exorcismos fracassados, criaturas sobrenaturais e confusões românticas que ninguém pediu, mas todo mundo parece atrair.',
    type: 'light_novel',
    status: 'ongoing',
    cover: '/images/covers/templo.svg',
    author: 'Ryuzen Originals',
    genres: ['Comédia', 'Sobrenatural', 'Slice of Life'],
    tags: ['Templo', 'Tsundere', 'Súcubo', 'Cotidiano'],
    rating: 4.7,
    featured: true,
    free: true,
    createdAt: '2026-04-10',
    updatedAt: '2026-05-18'
  },
  {
    id: 'work_enigmas',
    slug: 'clube-dos-enigmas-mortais',
    title: 'Clube dos Enigmas Mortais',
    subtitle: 'Uma carta do passado para salvar a juventude de amanhã',
    description: 'Em uma pequena cidade japonesa, estudantes investigam mistérios locais até encontrar um legado esquecido por gerações: salvar o clube de mistério antes que sua memória desapareça.',
    type: 'light_novel',
    status: 'development',
    cover: '/images/covers/enigmas.svg',
    author: 'Ryuzen Originals',
    genres: ['Mistério', 'Drama', 'Escolar'],
    tags: ['Clube Escolar', 'Anos 2000', 'Legado', 'Juventude'],
    rating: 4.9,
    featured: false,
    free: true,
    createdAt: '2026-04-16',
    updatedAt: '2026-05-19'
  },
  {
    id: 'work_manga_exemplo',
    slug: 'manga-original-ryuzen',
    title: 'Mangá Original Ryuzen',
    subtitle: 'Leitura oriental preparada para o futuro módulo de mangás',
    description: 'Obra demonstrativa para validar a arquitetura futura de mangás com páginas em imagem, leitura da direita para a esquerda e armazenamento via Cloudflare R2.',
    type: 'manga',
    status: 'soon',
    cover: '/images/covers/manga-exemplo.svg',
    author: 'Equipe Ryuzen',
    genres: ['Ação', 'Fantasia'],
    tags: ['Mangá', 'Em breve', 'R2'],
    featured: false,
    free: false,
    createdAt: '2026-05-20',
    updatedAt: '2026-05-20'
  }
];

export const featuredWorks = works.filter((work) => work.featured);
export const freeWorks = works.filter((work) => work.free);
export const latestWorks = [...works].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

export function getWorkBySlug(slug: string) {
  return works.find((work) => work.slug === slug);
}
