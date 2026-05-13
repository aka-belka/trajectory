import api from '../api/api';
import Profession from './Profession';

class FavoriteProfession {
  #professionId = null;

  constructor(professionId) {
    this.#professionId = professionId;
  }

  getProfessionId() { return this.#professionId; }

  static async add(studentId, professionId) {
    await api.post('/favorites', { studentId, professionId });
    return true;
  }

  static async remove(studentId, professionId) {
    await api.delete(`/favorites/${studentId}/${professionId}`);
    return true;
  }

  static async getByStudent(studentId) {
    const data = await api.get(`/favorites/${studentId}`);
    
    return data.map(item => new FavoriteProfession(
      item.profession_id
    ));
  }

  static async isFavorite(studentId, professionId) {
    const favorites = await FavoriteProfession.getByStudent(studentId);
    return favorites.some(f => f.getProfessionId() === professionId);
  }

  static async getFavoriteProfessions(studentId) {
    const data = await api.get(`/favorites/${studentId}`);
    
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
}

export default FavoriteProfession;