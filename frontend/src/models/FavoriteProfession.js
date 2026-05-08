import api from '../api/api';

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
      studentId,
      item.profession_id,
      item.added_at
    ));
  }

  static async isFavorite(studentId, professionId) {
    const favorites = await FavoriteProfession.getByStudent(studentId);
    return favorites.some(f => f.getProfessionId() === professionId);
  }
}

export default FavoriteProfession;