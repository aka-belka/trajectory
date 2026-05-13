import api from '../api/api';
import { getTypeColor, getTypeFullName, getTypeShortName } from '../constants/professionTypes';

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
  getTypeColor() { return getTypeColor(this.#professionType); }
  getTypeFullName() { return getTypeFullName(this.#professionType); }
  getTypeShortName() { return getTypeShortName(this.#professionType); }

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

  static async findByTitle(title) {
    const all = await Profession.loadAll();
    const searchTitle = title.trim().toLowerCase();
    return all.find(p => p.getTitle().trim().toLowerCase() === searchTitle);
  }
}

export default Profession;