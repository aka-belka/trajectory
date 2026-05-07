import User from './User';
import api from '../api/api';

class Parent extends User {
  #children = [];

  constructor(id, email, fullName, createdAt) {
    super(id, email, fullName, 'parent', createdAt);
  }

  getChildren() { return this.#children; }

  async viewChildData(studentId) {
    const response = await api.get(`/users/${studentId}`);
    
    if (response && response.role === 'student') {
      const Student = await import('./Student').then(m => m.default);
      return new Student(
        response.user_id,
        response.email,
        response.full_name,
        response.grade,
        response.created_at
      );
    }
    return null;
  }

  async leaveComment(studentId, professionId, text) {
    await api.post('/comments', {
      studentId,
      professionId,
      text
    });
    return true;
  }

  async fetchChildren() {
    const data = await api.get('/parent/children');
    
    const Student = await import('./Student').then(m => m.default);
    this.#children = data.map(child => new Student(
      child.user_id,
      child.email,
      child.full_name,
      child.grade,
      child.linked_at
    ));
    
    return this.#children;
  }
}

export default Parent;