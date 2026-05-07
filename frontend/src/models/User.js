import api from '../api/api';

class User {
  #id = null;
  #email = null;
  #fullName = null;
  #role = null;
  #createdAt = null;

  constructor(id, email, fullName, role, createdAt) {
    this.#id = id;
    this.#email = email;
    this.#fullName = fullName;
    this.#role = role;
    this.#createdAt = createdAt;
  }

  getId() { return this.#id; }
  getEmail() { return this.#email; }
  getFullName() { return this.#fullName; }
  getRole() { return this.#role; }
  getCreatedAt() { return this.#createdAt; }

  setFullName(newName) {
    this.#fullName = newName;
  }

  async updateProfile(data) {

    if (data.password && data.password.length < 6) {
      throw new Error('Пароль должен содержать минимум 6 символов');
    }
    
    try {
      const response = await api.put('/auth/me', data);
      
      if (data.fullName) this.#fullName = data.fullName;
      
      return response;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async register(email, password, fullName, role, grade = null) {
    if (password.length < 6) {
      throw new Error('Пароль должен содержать минимум 6 символов');
    }

    if (role === 'student' && (!grade || grade < 5 || grade > 11)) {
      throw new Error('Укажите класс от 5 до 11');
    }
    try{
      const response = await api.post('/auth/register', { email, password, fullName, role, grade });    
      return response.data || response;
    } catch (err) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      if (err.message.includes('409')) {
        throw new Error('Пользователь с таким email уже существует');
      }
      throw new Error(err.message || 'Ошибка регистрации');
    }
  }

  static async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });  
      return response.data || response;
    } catch (err) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      if (err.message.includes('401')) {
        throw new Error('Неверный email или пароль');
      }
      throw new Error(err.message || 'Ошибка входа');
    }
  }

  static async getCurrentUser() {
    try {
      const response = await api.get('/auth/me' );
      if (!response) return null;
      
      const { user_id, email, full_name, role, grade, created_at } = response;
      
      if (role === 'student') {
        const Student = await import('./Student').then(m => m.default);
        return new Student(user_id, email, full_name, grade, created_at);
      }
      
      return new User(user_id, email, full_name, role, created_at);
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  }

// frontend/src/models/User.js

  static async findById(userId) {
    const response = await api.get(`/users/${userId}`);
    
    if (!response) return null;
    
    const { user_id, email, full_name, role, grade, created_at } = response;
    
    if (role === 'student') {
      const Student = await import('./Student').then(m => m.default);
      return new Student(user_id, email, full_name, grade, created_at);
    }
    
    if (role === 'parent') {
      const Parent = await import('./Parent').then(m => m.default);
      return new Parent(user_id, email, full_name, created_at);
    }
    
    return new User(user_id, email, full_name, role, created_at);
  }
}

export default User;