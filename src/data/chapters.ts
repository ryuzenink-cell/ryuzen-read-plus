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

export const chapters: Chapter[] = [
  {
    id: 'ch_maou_001',
    workSlug: 'fui-chamado-para-salvar-o-mundo',
    chapterSlug: 'capitulo-01-o-neet-invocado',
    number: 1,
    title: 'O NEET Invocado Pelo Rei Demônio',
    excerpt: 'Ren acorda diante de Maou-sama e descobre que seu primeiro trabalho em outro mundo talvez seja resolver um problema administrativo.',
    isFree: true,
    publishedAt: '2026-05-20',
    content: [
      'Quando Ren abriu os olhos, a primeira coisa que viu não foi uma deusa sorridente, nem uma espada lendária cravada em um altar. Foi uma menina pequena, usando uma coroa torta, empilhada sobre uma montanha de relatórios.',
      '— Finalmente! — ela disse, levantando os braços com o desespero de uma funcionária pública no fim do expediente. — O especialista em mundos de fantasia chegou!',
      'Ren piscou uma vez. Depois duas. Então olhou ao redor e percebeu que estava dentro de uma sala de pedra, com estantes, mapas, cristais de comunicação e demônios usando crachás.',
      '— Espera... eu fui invocado pelo lado dos vilões?',
      'A menina bateu as duas mãos na mesa. — Vilões é uma palavra muito preconceituosa. Preferimos governo demoníaco em reestruturação estratégica.',
      'Foi nesse momento que Ren entendeu que seu conhecimento de MMORPG talvez tivesse acabado de virar uma competência profissional.'
    ]
  },
  {
    id: 'ch_maou_002',
    workSlug: 'fui-chamado-para-salvar-o-mundo',
    chapterSlug: 'capitulo-02-a-joia-sagrada',
    number: 2,
    title: 'A Joia Sagrada Que Não Devia Estar Aqui',
    excerpt: 'Uma relíquia do Reino da Luz cai nas mãos erradas — ou talvez nas mãos certas pela primeira vez.',
    isFree: true,
    publishedAt: '2026-05-21',
    content: [
      'A joia sobre a mesa brilhava como se estivesse tentando acusar todos os presentes de algum crime religioso.',
      'Maou-sama mantinha distância. Ren, por outro lado, encarava o artefato com a mesma expressão de alguém que encontrou um item raro em um baú de tutorial.',
      '— Isso deveria machucar demônios, certo?',
      '— Deveria — respondeu a ministra de agricultura demoníaca. — Mas desde que você tocou nela, as fontes melhoraram, o solo ficou fértil e três goblins abriram uma cooperativa de legumes.',
      'Ren colocou a mão no queixo. — Então o problema não é a joia. É o firmware sagrado dela.',
      'Ninguém entendeu. Ainda assim, todos anotaram.'
    ]
  },
  {
    id: 'ch_templo_001',
    workSlug: 'meu-templo-nao-e-harem',
    chapterSlug: 'capitulo-01-a-chegada-no-templo',
    number: 1,
    title: 'A Chegada no Templo',
    excerpt: 'O cotidiano do Templo Fukushō-ji começa a desandar assim que o novo ajudante aparece.',
    isFree: true,
    publishedAt: '2026-05-18',
    content: [
      'O Templo Fukushō-ji era conhecido por três coisas: a escadaria antiga, o sino que nunca tocava na hora certa e a impressionante capacidade de atrair problemas sobrenaturais em horário comercial.',
      'Yukito chegou carregando uma mala simples e a expressão de alguém que aceitaria qualquer emprego desde que viesse com moradia.',
      'A sacerdotisa responsável pelo templo cruzou os braços. — Antes de tudo, isto não é um harém.',
      '— Eu nem perguntei isso.',
      '— Exatamente. É assim que eles começam.',
      'Atrás dela, uma sombra espiou pela porta do salão principal e derrubou um vaso de oferendas. O primeiro dia ainda nem tinha começado.'
    ]
  },
  {
    id: 'ch_templo_002',
    workSlug: 'meu-templo-nao-e-harem',
    chapterSlug: 'capitulo-02-o-exorcismo-falhou-com-sucesso',
    number: 2,
    title: 'O Exorcismo Falhou Com Sucesso',
    excerpt: 'Uma tentativa de exorcismo termina em contrato, chá e uma discussão sobre aluguel espiritual.',
    isFree: true,
    publishedAt: '2026-05-19',
    content: [
      'O espírito deveria desaparecer depois do terceiro encantamento. Pelo menos era o que dizia o manual antigo, que também recomendava nunca aceitar conselhos de raposas falantes.',
      '— Por que ele ainda está aqui? — perguntou Yukito.',
      'A sacerdotisa virou a página com violência. — Tecnicamente, nós o exorcizamos do quarto de hóspedes. Agora ele mora no depósito.',
      'Do depósito veio uma voz abafada. — Eu prefiro chamar de escritório.',
      'O templo ganhou seu primeiro inquilino sobrenatural às 16h42. O contrato foi verbal, confuso e provavelmente ilegal em três jurisdições espirituais.'
    ]
  },
  {
    id: 'ch_enigmas_001',
    workSlug: 'clube-dos-enigmas-mortais',
    chapterSlug: 'prologo-a-carta-na-biblioteca',
    number: 0,
    title: 'Prólogo — A Carta na Biblioteca',
    excerpt: 'Uma carta antiga parece ter sido escrita pelos próprios estudantes que acabaram de encontrá-la.',
    isFree: true,
    publishedAt: '2026-05-17',
    content: [
      'A biblioteca da escola fechava às seis, mas Airi tinha certeza de que o corredor continuava respirando depois disso.',
      'Entre dicionários esquecidos e anuários manchados pelo tempo, Yuuto encontrou um envelope amarelado com o selo do antigo Clube de Mistérios.',
      'O nome do destinatário fez o silêncio mudar de peso.',
      'Era o nome deles.',
      'A primeira frase dizia: “Não deixem nosso legado morrer.”'
    ]
  }
];

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
