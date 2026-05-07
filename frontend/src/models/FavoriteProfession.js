import api from '../api/api';

class FavoriteProfession {
  #studentId = null;
  #professionId = null;
  #addedAt = null;

  constructor(studentId, professionId, addedAt) {
    this.#studentId = studentId;
    this.#professionId = professionId;
    this.#addedAt = addedAt;
  }

  getStudentId() { return this.#studentId; }
  getProfessionId() { return this.#professionId; }
  getAddedAt() { return this.#addedAt; }

  static async add(studentId, professionId) {
    const token = localStorage.getItem('token');
    await api.post('/favorites', { studentId, professionId }, token);
    return true;
  }

  static async remove(studentId, professionId) {
    const token = localStorage.getItem('token');
    await api.delete(`/favorites/${studentId}/${professionId}`, token);
    return true;
  }

  static async getByStudent(studentId) {
    const token = localStorage.getItem('token');
    const data = await api.get(`/favorites/${studentId}`, token);
    
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