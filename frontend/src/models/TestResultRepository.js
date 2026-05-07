import api from '../api/api';
import TestResult from './TestResult';

class TestResultRepository {
  async save(result) {
    const token = localStorage.getItem('token');
    if (result.isCompleted()) {
      await api.post('/test/finish', {
        testResultId: result.getId(),
        natureScore: result.getNatureScore(),
        techniqueScore: result.getTechniqueScore(),
        humanScore: result.getHumanScore(),
        signScore: result.getSignScore(),
        artScore: result.getArtScore(),
        dominantType: result.getDominantType(),
        dominantTypes: result.getDominantTypes()
      }, token);
    } else {
      throw new Error('Тест должен быть завершен!');
    }
    
    return result;
  }

  async findById(id) {
    const token = localStorage.getItem('token');
    const data = await api.get(`/test/result/${id}`, token);

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
      result.setDominantTypes(JSON.parse(data.dominant_types));
    } else if (data.dominant_type) {
      result.setDominantTypes([data.dominant_type]);
    }

    return result;
  }

  async findByStudent(studentId) {
    const token = localStorage.getItem('token');
    const data = await api.get(`/test/history/${studentId}`, token);
    
    return data.map(row => {
      const result = new TestResult(
        row.test_result_id,
        studentId,
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
  }

  async findUnfinishedByStudent(studentId) {
    const allResults = await this.findByStudent(studentId);
    return allResults.find(r => !r.isCompleted()) || null;
  }

   //Создать новый результат теста
  async create(studentId) {
    const token = localStorage.getItem('token');
    const response = await api.post('/test/start', { studentId }, token);
    
    return new TestResult(
      response.testResultId,
      studentId,
      '{}',
      0,
      false,
      null,
      0, 0, 0, 0, 0,
      null
    );
  }
}

export default TestResultRepository;