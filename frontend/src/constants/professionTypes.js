export const PROFESSION_TYPES = {
  'П': {
    code: 'П',
    fullName: 'Человек — Природа',
    shortName: 'Природа',
    color: '#60b885',
    description: 'Вам нравится работать с природой, животными и растениями. Вы любите наблюдать, изучать и заботиться.',
    shortDescription: 'Забота о живом мире и природных процессах',
    examples: 'Ветеринар, агроном, эколог, лесничий, зоолог',
    image: 'nature.png'
  },
  'Т': {
    code: 'Т',
    fullName: 'Человек — Техника',
    shortName: 'Техника',
    color: '#6cabd5',
    description: 'У вас есть склонность к работе с техникой, механизмами и инструментами. Вам интересно разбираться в устройстве вещей.',
    shortDescription: 'Создание, настройка и обслуживание техники',
    examples: 'Инженер-конструктор, программист, механик, электрик, сварщик',
    image: 'technics.png'
  },
  'Ч': {
    code: 'Ч',
    fullName: 'Человек — Человек',
    shortName: 'Человек',
    color: '#c6756c',
    description: 'Вы хорошо взаимодействуете с людьми, умеете общаться, помогать и обучать. Вам важно работать в коллективе.',
    shortDescription: 'Помощь, обучение и работа с людьми',
    examples: 'Врач, учитель, психолог, менеджер, юрист',
    image: 'human.png'
  },
  'З': {
    code: 'З',
    fullName: 'Человек — Знаковая система',
    shortName: 'Знаковая система',
    color: '#e6ba72',
    description: 'Вы любите работать с цифрами, схемами, символами и текстами. Вам нравится анализировать и систематизировать.',
    shortDescription: 'Анализ данных, знаков и информации',
    examples: 'Бухгалтер, аналитик данных, переводчик, экономист',
    image: 'sign.png'
  },
  'Х': {
    code: 'Х',
    fullName: 'Человек — Художественный образ',
    shortName: 'Художественный образ',
    color: '#a46bba',
    description: 'У вас развито творческое мышление, вы любите создавать что-то новое и красивое.',
    shortDescription: 'Творчество и создание образов',
    examples: 'Дизайнер интерьеров, художник, архитектор, музыкант',
    image: 'art.png'
  }
};

export const getTypeFullName = (typeCode) => PROFESSION_TYPES[typeCode]?.fullName || typeCode;
export const getTypeShortName = (typeCode) => PROFESSION_TYPES[typeCode]?.shortName || typeCode;
export const getTypeColor = (typeCode) => PROFESSION_TYPES[typeCode]?.color || '#666';
export const getTypeDescription = (typeCode) => PROFESSION_TYPES[typeCode]?.description || '';
export const getTypeExamples = (typeCode) => PROFESSION_TYPES[typeCode]?.examples || '';
export const getAllTypes = () => Object.values(PROFESSION_TYPES)