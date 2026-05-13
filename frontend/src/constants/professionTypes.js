export const PROFESSION_TYPES = {
  'П': {
    code: 'П',
    fullName: 'Человек — Природа',
    shortName: 'Природа',
    color: '#2ecc71',
    description: 'Вам нравится работать с природой, животными и растениями. Вы любите наблюдать, изучать и заботиться.'
  },
  'Т': {
    code: 'Т',
    fullName: 'Человек — Техника',
    shortName: 'Техника',
    color: '#3498db',
    description: 'У вас есть склонность к работе с техникой, механизмами и инструментами. Вам интересно разбираться в устройстве вещей.'
  },
  'Ч': {
    code: 'Ч',
    fullName: 'Человек — Человек',
    shortName: 'Человек',
    color: '#e74c3c',
    description: 'Вы хорошо взаимодействуете с людьми, умеете общаться, помогать и обучать. Вам важно работать в коллективе.'
  },
  'З': {
    code: 'З',
    fullName: 'Человек — Знаковая система',
    shortName: 'Знаковая система',
    color: '#f39c12',
    description: 'Вы любите работать с цифрами, схемами, символами и текстами. Вам нравится анализировать и систематизировать.'
  },
  'Х': {
    code: 'Х',
    fullName: 'Человек — Художественный образ',
    shortName: 'Художественный образ',
    color: '#9b59b6',
    description: 'У вас развито творческое мышление, вы любите создавать что-то новое и красивое.'
  }
};

export const getTypeFullName = (typeCode) => PROFESSION_TYPES[typeCode]?.fullName || typeCode;
export const getTypeShortName = (typeCode) => PROFESSION_TYPES[typeCode]?.shortName || typeCode;
export const getTypeColor = (typeCode) => PROFESSION_TYPES[typeCode]?.color || '#666';
export const getTypeDescription = (typeCode) => PROFESSION_TYPES[typeCode]?.description || '';