import api from '../api/api';

class Profession {
  #id = null;
  #title = null;
  #description = null;
  #professionType = null;
  #examSubjects = null;
  #salary = null;
  #educationPlaces = null;

  constructor(id, title, description, professionType, examSubjects, salary, educationPlaces) {
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#professionType = professionType;
    this.#examSubjects = examSubjects;
    this.#salary = salary;
    this.#educationPlaces = educationPlaces;
  }

  getId() { return this.#id; }
  getTitle() { return this.#title; }
  getDescription() { return this.#description; }
  getProfessionType() { return this.#professionType; }
  getExamSubjects() { return this.#examSubjects; }
  getSalary() { return this.#salary; }
  getEducationPlaces() { return this.#educationPlaces; }

  async getRecommendations() {
    const data = await api.get(`/professions/type/${this.#professionType}`);
    
    const otherProfessions = data.filter(p => p.profession_id !== this.#id);
    
    return otherProfessions.map(p => new Profession(
      p.profession_id,
      p.title,
      p.description,
      p.profession_type,
      p.exam_subjects,
      p.salary,
      p.education_places
    ));
  }

  getTypeColor() {
    const colorMap = {
      'П': '#2ecc71',
      'Т': '#3498db',
      'Ч': '#e74c3c',
      'З': '#f39c12',
      'Х': '#9b59b6'
    };
    return colorMap[this.#professionType] || '#666';
  }

  getTypeFullName() {
    const typeMap = {
      'П': 'Человек — Природа',
      'Т': 'Человек — Техника',
      'Ч': 'Человек — Человек',
      'З': 'Человек — Знаковая система',
      'Х': 'Человек — Художественный образ'
    };
    return typeMap[this.#professionType] || this.#professionType;
  }

  getTypeShortName() {
    const shortMap = {
      'П': 'Природа',
      'Т': 'Техника',
      'Ч': 'Человек',
      'З': 'Знаковая система',
      'Х': 'Художественный образ'
    };
    return shortMap[this.#professionType] || this.#professionType;
  }

  getExamSubjectsArray() {
    if (!this.#examSubjects) return [];
    return this.#examSubjects.split(',').map(s => s.trim());
  }

  getEducationPlacesArray() {
    if (!this.#educationPlaces) return [];
    return this.#educationPlaces.split(',').map(s => s.trim());
  }

  static async loadAll() {
    const data = await api.get('/professions');
    return data.map(p => new Profession(
      p.profession_id,
      p.title,
      p.description,
      p.profession_type,
      p.exam_subjects,
      p.salary,
      p.education_places
    ));
  }

  static async loadById(id) {
    const data = await api.get(`/professions/${id}`);
    return new Profession(
      data.profession_id,
      data.title,
      data.description,
      data.profession_type,
      data.exam_subjects,
      data.salary,
      data.education_places
    );
  }

  static async findByTitle(title) {
    const all = await Profession.loadAll();
    const searchTitle = title.trim().toLowerCase();
    return all.find(p => p.getTitle().trim().toLowerCase() === searchTitle);
  }

  static getTypes() {
    return [
      { code: 'П', name: 'Человек — Природа', description: 'Профессии, связанные с растениями, животными и природными процессами' },
      { code: 'Т', name: 'Человек — Техника', description: 'Профессии, связанные с обслуживанием техники, ремонтом, наладкой' },
      { code: 'Ч', name: 'Человек — Человек', description: 'Профессии, связанные с общением, обучением, обслуживанием людей' },
      { code: 'З', name: 'Человек — Знаковая система', description: 'Профессии, связанные с цифрами, кодами, языками, схемами' },
      { code: 'Х', name: 'Человек — Художественный образ', description: 'Профессии, связанные с творчеством и искусством' }
    ];
  }
}

export default Profession;