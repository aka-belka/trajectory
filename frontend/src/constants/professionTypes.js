export const PROFESSION_TYPES = {
  'П': {
    code: 'П',
    fullName: 'Человек — Природа',
    shortName: 'Природа',
    color: '#2ecc71',
    description: 'Вам нравится работать с природой, животными и растениями. Вы любите наблюдать, изучать и заботиться.',
    examples: 'Ветеринар, агроном, эколог, лесничий, зоолог'
  },
  'Т': {
    code: 'Т',
    fullName: 'Человек — Техника',
    shortName: 'Техника',
    color: '#3498db',
    description: 'У вас есть склонность к работе с техникой, механизмами и инструментами. Вам интересно разбираться в устройстве вещей.',
    examples: 'Инженер-конструктор, программист, механик, электрик, сварщик'
  },
  'Ч': {
    code: 'Ч',
    fullName: 'Человек — Человек',
    shortName: 'Человек',
    color: '#e74c3c',
    description: 'Вы хорошо взаимодействуете с людьми, умеете общаться, помогать и обучать. Вам важно работать в коллективе.',
    examples: 'Врач, учитель, психолог, менеджер, юрист'
  },
  'З': {
    code: 'З',
    fullName: 'Человек — Знаковая система',
    shortName: 'Знаковая система',
    color: '#f39c12',
    description: 'Вы любите работать с цифрами, схемами, символами и текстами. Вам нравится анализировать и систематизировать.',
    examples: 'Бухгалтер, аналитик данных, переводчик, экономист'
  },
  'Х': {
    code: 'Х',
    fullName: 'Человек — Художественный образ',
    shortName: 'Художественный образ',
    color: '#9b59b6',
    description: 'У вас развито творческое мышление, вы любите создавать что-то новое и красивое.',
    examples: 'Дизайнер интерьеров, художник, архитектор, музыкант'
  }
};

export const getTypeFullName = (typeCode) => PROFESSION_TYPES[typeCode]?.fullName || typeCode;
export const getTypeShortName = (typeCode) => PROFESSION_TYPES[typeCode]?.shortName || typeCode;
export const getTypeColor = (typeCode) => PROFESSION_TYPES[typeCode]?.color || '#666';
export const getTypeDescription = (typeCode) => PROFESSION_TYPES[typeCode]?.description || '';
export const getTypeExamples = (typeCode) => PROFESSION_TYPES[typeCode]?.examples || '';
export const getAllTypes = () => Object.values(PROFESSION_TYPES)