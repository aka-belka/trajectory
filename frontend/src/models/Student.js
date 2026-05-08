import User from './User';
import api from '../api/api';
import TestResult from './TestResult';
import Profession from './Profession';


class Student extends User {
  #grade = null;
  #testResults = [];

  constructor(id, email, fullName, grade, createdAt) {
    super(id, email, fullName, 'student', createdAt);
    this.#grade = grade;
  }

  getGrade() { return this.#grade; }
  getTestResults() { return this.#testResults; }

  setGrade(newGrade) {
    this.#grade = newGrade;
  }

  async viewResults() {
    const data = await api.get(`/test/history/${this.getId()}`);
    
    this.#testResults = data.map(row => {
      const result = new TestResult(
        row.test_result_id,
        this.getId(),
        row.answers_json,
        row.current_question_index,
        row.is_completed,
        row.completed_at,
        row.nature_score || 0,
        row.technique_score || 0,
        row.human_score || 0,
        row.sign_score || 0,
        row.art_score || 0,
        row.dominant_type
      );
      
      if (row.dominant_types) {
        result.setDominantTypes(JSON.parse(row.dominant_types));
      } else if (row.dominant_type) {
        result.setDominantTypes([row.dominant_type]);
      }
      
      return result;
    });
    
    return this.#testResults;
  }

  async addToFavorites(professionId) {
    await api.post('/favorites', { studentId: this.getId(), professionId });
    return true;
  }

  async removeFromFavorites(professionId) {
    await api.delete(`/favorites/${this.getId()}/${professionId}`);
    return true;
  }

  async getFavoriteProfessions() {
    const data = await api.get(`/favorites/${this.getId()}`);
    
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

  async getTestHistory() {
    return await this.viewResults();
  }

  async hasUnfinishedTest() {
    const history = await this.getTestHistory();
    return history.some(r => !r.isCompleted());
}
}

export default Student;