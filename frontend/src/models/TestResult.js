import api from '../api/api';

class TestResult {
  #id = null;
  #studentId = null;
  #completedAt = null;
  #answersJson = null;
  #currentQuestionIndex = 0;
  #isCompleted = false;
  #natureScore = 0;
  #techniqueScore = 0;
  #humanScore = 0;
  #signScore = 0;
  #artScore = 0;
  #dominantType = null;
  #dominantTypes = [];  

  constructor(id, studentId, answersJson, currentQuestionIndex, isCompleted, completedAt = null,
              natureScore = 0, techniqueScore = 0, humanScore = 0, signScore = 0, artScore = 0, dominantType = null) {
    this.#id = id;
    this.#studentId = studentId;
    this.#answersJson = answersJson;
    this.#currentQuestionIndex = currentQuestionIndex || 0;
    this.#isCompleted = isCompleted || false;
    this.#completedAt = completedAt;
    this.#natureScore = natureScore || 0;
    this.#techniqueScore = techniqueScore || 0;
    this.#humanScore = humanScore || 0;
    this.#signScore = signScore || 0;
    this.#artScore = artScore || 0;
    this.#dominantType = dominantType;
    this.#dominantTypes = dominantType ? [dominantType] : [];  
  }

  getId() { return this.#id; }
  getStudentId() { return this.#studentId; }
  getCompletedAt() { return this.#completedAt; }
  getCurrentQuestionIndex() { return this.#currentQuestionIndex; }
  isCompleted() { return this.#isCompleted; }
  getDominantType() { return this.#dominantType; }
  getDominantTypes() { return this.#dominantTypes; } 
  getNatureScore() { return this.#natureScore; }
  getTechniqueScore() { return this.#techniqueScore; }
  getHumanScore() { return this.#humanScore; }
  getSignScore() { return this.#signScore; }
  getArtScore() { return this.#artScore; }

  getAnswers() {
    if (!this.#answersJson) return {};
    return JSON.parse(this.#answersJson);
  }

  setDominantTypes(types) {
    this.#dominantTypes = types;
    if (types && types.length > 0) {
      this.#dominantType = types[0];
    }
  }

  async calculateScores() {
    const answers = this.getAnswers();
    const questions = await api.get('/questions');
    
    const scores = { П: 0, Т: 0, Ч: 0, З: 0, Х: 0 };
    
    for (const [index, answer] of Object.entries(answers)) {
      const question = questions[parseInt(index)];
      if (question) {
        if (answer === 'A') {
          const type = question.option_a_type;
          if (scores.hasOwnProperty(type)) scores[type]++;
        } else if (answer === 'B') {
          const type = question.option_b_type;
          if (scores.hasOwnProperty(type)) scores[type]++;
        }
      }
    }
    
    this.#natureScore = scores['П'];
    this.#techniqueScore = scores['Т'];
    this.#humanScore = scores['Ч'];
    this.#signScore = scores['З'];
    this.#artScore = scores['Х'];
    
    const maxScore = Math.max(this.#natureScore, this.#techniqueScore, this.#humanScore, this.#signScore, this.#artScore);
    
    this.#dominantTypes = [];
    if (this.#natureScore === maxScore) this.#dominantTypes.push('П');
    if (this.#techniqueScore === maxScore) this.#dominantTypes.push('Т');
    if (this.#humanScore === maxScore) this.#dominantTypes.push('Ч');
    if (this.#signScore === maxScore) this.#dominantTypes.push('З');
    if (this.#artScore === maxScore) this.#dominantTypes.push('Х');
    
    this.#dominantType = this.#dominantTypes[0] || null;
    
    this.#isCompleted = true;
    this.#completedAt = new Date().toISOString();
  }

  async getProfessionRecommendations(maxProfessions = 6) {
    if (this.#dominantTypes.length > 1) {
      const allProfessionsByType = {};
      const Profession = await import('./Profession').then(m => m.default);
      
      for (const type of this.#dominantTypes) {
        const data = await api.get(`/professions/type/${type}`);
        const professions = data.map(p => new Profession(
          p.profession_id,
          p.title,
          p.description,
          p.profession_type,
          p.exam_subjects,
          p.salary,
          p.education_places
        ));
        allProfessionsByType[type] = professions;
      }
      
      const result = [];
      const typeCount = this.#dominantTypes.length;
      const perType = Math.floor(maxProfessions / typeCount); 
      const remainder = maxProfessions % typeCount; 
      
      let remainderCounter = 0;
      for (const type of this.#dominantTypes) {
        const professions = allProfessionsByType[type];
        let take = perType;
        if (remainderCounter < remainder) {
          take++;
        }
        remainderCounter++;
        
        const taken = professions.slice(0, take);
        result.push(...taken);
      }
      
      const uniqueProfessions = [];
      const ids = new Set();
      for (const prof of result) {
        if (!ids.has(prof.getId())) {
          ids.add(prof.getId());
          uniqueProfessions.push(prof);
        }
      }
      
      return uniqueProfessions;
    }
    
    if (!this.#dominantType) return [];
    
    const data = await api.get(`/professions/type/${this.#dominantType}`);
    const Profession = await import('./Profession').then(m => m.default);
    const professions = data.map(p => new Profession(
      p.profession_id,
      p.title,
      p.description,
      p.profession_type,
      p.exam_subjects,
      p.salary,
      p.education_places
    ));
    
    return professions.slice(0, maxProfessions);
  }

  async delete() {
    await api.delete(`/test/result/${this.#id}`);
    return true;
  }
    
  static async load(testResultId) {
    const data = await api.get(`/test/result/${testResultId}`);
    
    const result = new TestResult(
      data.test_result_id,
      data.student_id,
      data.answers_json || '{}',
      data.current_question_index || 0,
      data.is_completed || false,
      data.completed_at,
      data.nature_score || 0,
      data.technique_score || 0,
      data.human_score || 0,
      data.sign_score || 0,
      data.art_score || 0,
      data.dominant_type
    );

    if (data.dominant_types) {
      result.#dominantTypes = JSON.parse(data.dominant_types);
    } else if (data.dominant_type) {
      result.#dominantTypes = [data.dominant_type];
    }
    
    return result;
  }
}

export default TestResult;