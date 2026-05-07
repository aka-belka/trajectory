import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TestFacade from '../../models/TestFacade';
import './TestModal.css';

function TestModal({ isOpen, onClose, studentId }) {
  const [facade] = useState(() => new TestFacade());
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [testResultId, setTestResultId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const navigate = useNavigate();
  const isInitializing = useRef(false);

  useEffect(() => {
    if (isOpen && studentId && !testResultId && !isInitializing.current) {
      isInitializing.current = true;
      initTest();
    }
  }, [isOpen, studentId]);

  const initTest = async () => {
    setLoading(true);
    try {
      const testState = await facade.init(studentId);
      setCurrentQuestion(testState.currentQuestion);
      setCurrentIndex(testState.currentIndex);
      setTotalQuestions(testState.totalQuestions);
      setTestResultId(testState.testResultId);
      setIsResuming(testState.isResuming);
    } catch (err) {
      console.error('Init test error:', err);
      onClose();
    } finally {
      setLoading(false);
      isInitializing.current = false;
    }
  };

  const handleAnswer = async (answer) => {
    setLoading(true);
    try {
      const result = await facade.answer(testResultId, currentIndex, totalQuestions, answer);
      
      if (result.isFinished) {
        onClose();
        navigate('/results', { state: { testResultId } });
      } else {
        setCurrentQuestion(result.nextQuestion);
        setCurrentIndex(result.nextIndex);
      }
    } catch (err) {
      console.error('Answer error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await facade.back(currentIndex);
      if (result) {
        setCurrentQuestion(result.currentQuestion);
        setCurrentIndex(result.currentIndex);
      }
    } catch (err) {
      console.error('Back error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!isOpen) return null;

  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="test-modal-overlay" onClick={handleClose}>
      <div className="test-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="test-modal-close" onClick={handleClose} disabled={loading}>×</button>

        <div className="test-modal-header">
          <h2>Профориентационный тест</h2>
          <p className="test-subtitle">Методика Е.А. Климова</p>
          {isResuming && <p className="resume-badge">▶ Продолжение теста</p>}
        </div>

        <div className="test-progress">
          <div className="progress-info">
            <span className="progress-label">Вопрос {currentIndex + 1} из {totalQuestions}</span>
            <span className="progress-percent">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {loading && !currentQuestion ? (
          <div className="test-loading">
            <div className="spinner"></div>
            <p>{isResuming ? 'Загрузка сохранённого теста...' : 'Загрузка вопросов...'}</p>
          </div>
        ) : currentQuestion && (
          <>
            <div className="test-question">
              <p className="question-text">{currentQuestion.getQuestion()}</p>
            </div>

            <div className="test-options">
              <button 
                className="option-btn option-a"
                onClick={() => handleAnswer('A')}
                disabled={loading}
              >
                <span className="option-letter">А</span>
                <span className="option-text">{currentQuestion.getOptionA()}</span>
              </button>
              <button 
                className="option-btn option-b"
                onClick={() => handleAnswer('B')}
                disabled={loading}
              >
                <span className="option-letter">Б</span>
                <span className="option-text">{currentQuestion.getOptionB()}</span>
              </button>
            </div>

            {currentIndex > 0 && (
              <button 
                className="back-btn"
                onClick={handleBack}
                disabled={loading}
              >
                ← Назад
              </button>
            )}
          </>
        )}

        {loading && (
          <div className="test-saving">
            <div className="spinner-small"></div>
            <p>Сохранение ответа...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestModal;