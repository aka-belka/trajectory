import api from '../api/api';
import TestResult from './TestResult';
import TestQuestionRepository from './TestQuestionRepository';
import TestResultRepository from './TestResultRepository';

class TestFacade {
  #questionRepo = null;
  #resultRepo = null;

  constructor() {
    this.#questionRepo = new TestQuestionRepository();
    this.#resultRepo = new TestResultRepository();
  }

  async init(studentId) {
    const questions = await this.#questionRepo.getAll();
    const totalQuestions = questions.length;

    const unfinishedTest = await this.#resultRepo.findUnfinishedByStudent(studentId);

    if (unfinishedTest) {
      const savedIndex = unfinishedTest.getCurrentQuestionIndex();
      const currentQuestion = await this.#questionRepo.getByOrder(savedIndex);
      
      return {
        isResuming: true,
        testResultId: unfinishedTest.getId(),
        currentQuestion,
        currentIndex: savedIndex,
        totalQuestions
      };
    } else {
      const testResult = await this.startTest(studentId);
      const firstQuestion = await this.#questionRepo.getByOrder(0);
      
      return {
        isResuming: false,
        testResultId: testResult.getId(),
        currentQuestion: firstQuestion,
        currentIndex: 0,
        totalQuestions
      };
    }
  }

  async answer(currentTestResultId, currentIndex, totalQuestions, answer) {
    await this.answerQuestion(currentTestResultId, currentIndex, answer);
    
    if (currentIndex + 1 >= totalQuestions) {
      const result = await this.finishTest(currentTestResultId);
      return {
        isFinished: true,
        testResultId: currentTestResultId,
        result
      };
    } else {
      const nextIndex = currentIndex + 1;
      const nextQuestion = await this.#questionRepo.getByOrder(nextIndex);
      return {
        isFinished: false,
        nextQuestion,
        nextIndex
      };
    }
  }

  async back(currentIndex) {
    if (currentIndex <= 0) return null;
    
    const prevIndex = currentIndex - 1;
    const prevQuestion = await this.#questionRepo.getByOrder(prevIndex);
    return {
      currentQuestion: prevQuestion,
      currentIndex: prevIndex
    };
  }

  async startTest(studentId) {
    const token = localStorage.getItem('token');
    const response = await api.post('/test/start',  { studentId }, token);
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

  async answerQuestion(resultId, questionIndex, answer) {
    const token = localStorage.getItem('token');
    await api.post('/test/answer', {
      testResultId: resultId,
      questionIndex,
      answer
    }, token);
  }

  async finishTest(resultId) {
    const testResult = await this.#resultRepo.findById(resultId);
    await testResult.calculateScores();
    
    const token = localStorage.getItem('token');
    await api.post('/test/finish', {
      testResultId: resultId,
      natureScore: testResult.getNatureScore(),
      techniqueScore: testResult.getTechniqueScore(),
      humanScore: testResult.getHumanScore(),
      signScore: testResult.getSignScore(),
      artScore: testResult.getArtScore(),
      dominantType: testResult.getDominantType(),
      dominantTypes: testResult.getDominantTypes()
    }, token);
    
    return testResult;
  }
}

export default TestFacade;