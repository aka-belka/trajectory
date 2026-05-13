import User from './User';
import api from '../api/api';
import Student from'./Student';

class Parent extends User {
  #children = [];

  constructor(id, email, fullName, createdAt) {
    super(id, email, fullName, 'parent', createdAt);
  }

  getChildren() { return this.#children; }

  async fetchChildren() {
    const data = await api.get('/parent/children');
    
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