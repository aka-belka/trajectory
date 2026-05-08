import api from '../api/api';

class Comment {
  #id = null;
  #studentId = null;
  #professionId = null;
  #name = null;
  #text = null;
  #createdAt = null;
  #updatedAt = null;

  constructor(id, studentId, professionId, name, text, createdAt, updatedAt) {
    this.#id = id;
    this.#studentId = studentId;
    this.#professionId = professionId;
    this.#name = name;
    this.#text = text;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  getId() { return this.#id; }
  getStudentId() { return this.#studentId; }
  getProfessionId() { return this.#professionId; }
  getName() { return this.#name; }
  getText() { return this.#text; }
  getCreatedAt() { return this.#createdAt; }
  getUpdatedAt() { return this.#updatedAt; }

  static async saveOrUpdate(parentId, studentId, professionId, text) {
    const existing = await Comment.getByStudentAndProfession(studentId, professionId);
    
    if (!text || text.trim() === '') {
      if (existing) {
        await existing.delete();
      }
      return null;
    }
    
    if (existing) {
      await existing.update(text);
      return existing;
    }
 
    return await Comment.create(parentId, studentId, professionId, text);
  }

  async update(newText) {
    await api.post('/comments', {
      studentId: this.#studentId,
      professionId: this.#professionId,
      text: newText
    });
    
    this.#text = newText;
    this.#updatedAt = new Date().toISOString();
    return true;
  }

  async delete() {
    await api.delete(`/comments/${this.#id}`);
    return true;
  }

  static async create(parentId, studentId, professionId, text) {
    const response = await api.post('/comments', {
      studentId,
      professionId,
      text
    });
    
    const newComment = await Comment.getByStudentAndProfession(studentId, professionId);
    return newComment;
  }

  static async getByStudentAndProfession(studentId, professionId) {
    const data = await api.get(`/comments/${studentId}/${professionId}`);
    if (!data) return null;
    
    return new Comment(
      data.comment_id,
      data.student_id,
      data.profession_id,
      data.parent_name || 'Родитель',
      data.text,
      data.created_at,
      data.updated_at
    );
  }

  static async getByStudentAndProfessionForStudent(studentId, professionId) {
    const data = await api.get(`/comments/student/${studentId}/${professionId}`);
    
    if (!data) return null;
    
    return new Comment(
      data.comment_id,
      data.student_id,
      data.profession_id,
      data.parent_name || 'Родитель',
      data.text,
      data.created_at,
      data.updated_at
    );
  }
}

export default Comment;