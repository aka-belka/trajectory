import api from '../api/api';
import TestQuestion from './TestQuestion';

class TestQuestionRepository {
  #questionsCache = null;

  async getAll() {
    if (this.#questionsCache) {
      return this.#questionsCache;
    }

    const data = await api.get('/questions');
    const questionsArray = Array.isArray(data) ? data : (data.data || []);
    
    this.#questionsCache = questionsArray.map(q => new TestQuestion(
      q.question_id,
      q.question_text,
      q.option_a,
      q.option_b,
      q.option_a_type,
      q.option_b_type,
      q.order_number
    ));
    
    return this.#questionsCache;
  }

  async getByOrder(order) {
    const allQuestions = await this.getAll();
    const question = allQuestions.find(q => q.getOrderNumber() === order);
    
    if (!question) {
      throw new Error(`Вопрос с порядковым номером ${order} не найден`);
    }
    
    return question;
  }

   //Получить количество вопросов
  async getCount() {
    const allQuestions = await this.getAll();
    return allQuestions.length;
  }

  //Очистить кэш (при необходимости обновить вопросы)
  clearCache() {
    this.#questionsCache = null;
  }
}

export default TestQuestionRepository;