import { useState, useEffect } from 'react';
import Student from '../../models/Student';
import TestResult from '../../models/TestResult';
import './ChildResultsTab.css';

function ChildResultsTab({ studentId }) {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestHistory();
  }, [studentId]);

  const loadTestHistory = async () => {
    setLoading(true);
    try {
      const student = await Student.findById(studentId);
      const history = await student.getTestHistory();
      console.log('🔍 ChildResultsTab - загруженная история:', history);
      
      // 🔥 ЛОГ ДЛЯ ПРОВЕРКИ dominantTypes
      history.forEach(result => {
        console.log('  - dominantTypes:', result.getDominantTypes());
      });
      
      setTestHistory(history);
    } catch (err) {
      console.error('Load test history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🔥 ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ ТИПОВ (ОДИН ИЛИ НЕСКОЛЬКО)
  const renderTypeInfo = (result) => {
    const dominantTypes = result.getDominantTypes();
    const isMultiType = dominantTypes.length > 1;

    if (isMultiType) {
      return (
        <div className="child-result-type-multi">
          <div className="child-type-badges">
            {dominantTypes.map(typeCode => (
              <span 
                key={typeCode} 
                className="child-type-badge-small" 
                style={{ backgroundColor: TestResult.getTypeColor(typeCode) }}
              >
                {typeCode}
              </span>
            ))}
          </div>
          <span className="child-type-name-multi">
            {dominantTypes.map(typeCode => TestResult.getTypeFullName(typeCode)).join(', ')}
          </span>
        </div>
      );
    }

    return (
      <div className="child-result-type">
        <span 
          className="child-type-badge" 
          style={{ backgroundColor: result.getDominantTypeColor() }}
        >
          {result.getDominantType()}
        </span>
        <span className="child-type-name">{result.getDominantTypeFullName()}</span>
      </div>
    );
  };

  if (loading) {
    return <div className="child-results-loading">Загрузка результатов...</div>;
  }

  if (testHistory.length === 0) {
    return (
      <div className="child-results-empty">
        <p>📋 Ребёнок ещё не проходил тест</p>
      </div>
    );
  }

  return (
    <div className="child-results-tab">
      <div className="child-results-header">
        <h3>История тестирований</h3>
        <p className="child-results-count">Всего: {testHistory.length}</p>
      </div>

      <div className="child-results-list">
        {testHistory.map((result, index) => (
          <div key={result.getId()} className="child-result-card">
            <div className="child-result-number">#{testHistory.length - index}</div>
            <div className="child-result-info">
              <div className="child-result-date">{formatDate(result.getCompletedAt())}</div>
              
              {/* 🔥 НОВАЯ СЕКЦИЯ ДЛЯ ТИПОВ */}
              {renderTypeInfo(result)}
              
              <div className="child-result-scores">
                <span className="score-item">🌿 Природа: {result.getNatureScore()}</span>
                <span className="score-item">⚙️ Техника: {result.getTechniqueScore()}</span>
                <span className="score-item">🤝 Человек: {result.getHumanScore()}</span>
                <span className="score-item">📊 Знаковая: {result.getSignScore()}</span>
                <span className="score-item">🎨 Художественный: {result.getArtScore()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChildResultsTab;