import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../common/ConfirmModal';
import TestResult from '../../models/TestResult';
import './ResultsTab.css';

function ResultsTab({ student, refreshTrigger, onContinueTest }) {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    resultToDelete: null
  });

  const openConfirmModal = (result, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      resultToDelete: result
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, resultToDelete: null });
  };

  const handleConfirmDelete = async () => {
    const { resultToDelete } = confirmModal;
    if (!resultToDelete) return;
    
    closeConfirmModal();
    
    try {
      await resultToDelete.delete();
      await loadTestHistory(); 
    } catch (err) {
      console.error('Delete result error:', err);
    } 
  };

  useEffect(() => {
    if (student) {
      loadTestHistory();
    }
  }, [student, refreshTrigger]);

  const loadTestHistory = async () => {
    setLoading(true);
    try {
      const history = await student.getTestHistory();
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

  const handleViewDetails = (result, e) => {
    e.stopPropagation();
    navigate('/results', { state: { testResultId: result.getId() } });
  };

  const handleContinueTest = (result, e) => {
    e.stopPropagation();
    if (onContinueTest) {
      onContinueTest();  
    }
  };

  const renderTypeInfo = (result) => {
    const dominantTypes = result.getDominantTypes();
    const isMultiType = dominantTypes.length > 1;

    if (isMultiType) {
      return (
        <div className="result-type-multi">
          <div className="type-badges">
            {dominantTypes.map(typeCode => (
              <span 
                key={typeCode} 
                className="type-badge-small" 
                style={{ backgroundColor: TestResult.getTypeColor(typeCode) }}
              >
                {typeCode}
              </span>
            ))}
          </div>
          <span className="type-name-multi">
            {dominantTypes.map(typeCode => TestResult.getTypeFullName(typeCode)).join(', ')}
          </span>
        </div>
      );
    }

    return (
      <div className="result-type">
        <span 
          className="type-badge" 
          style={{ backgroundColor: result.getDominantTypeColor() }}
        >
          {result.getDominantType()}
        </span>
        <span className="type-name">{result.getDominantTypeFullName()}</span>
      </div>
    );
  };

  if (loading) {
    return <div className="results-loading">Загрузка истории...</div>;
  }

  if (testHistory.length === 0) {
    return (
      <div className="results-empty">
        <p>Вы ещё не проходили тест</p>
        <p className="empty-hint">Нажмите «Пройти тест» на главной странице</p>
      </div>
    );
  }

  return (
    <div className="results-tab">
      <div className="results-header">
        <h2>История тестирований</h2>
        <p className="results-count">Всего пройдено: {testHistory.length}</p>
      </div>

      <div className="results-list">
        {testHistory.map((result, index) => (
          <div 
            key={result.getId()} 
            className={`result-card ${!result.isCompleted() ? 'unfinished' : ''}`}
          >
            <div className="result-number">#{testHistory.length - index}</div>
            <div className="result-info">
              <div className="result-date">{formatDate(result.getCompletedAt())}</div>
            
              {renderTypeInfo(result)}
              
              <div className="result-scores">
                <span className="score">🌿 {result.getNatureScore()}</span>
                <span className="score">⚙️ {result.getTechniqueScore()}</span>
                <span className="score">🤝 {result.getHumanScore()}</span>
                <span className="score">📊 {result.getSignScore()}</span>
                <span className="score">🎨 {result.getArtScore()}</span>
              </div>
              
              <div className="result-buttons">
                {!result.isCompleted() && (
                  <button 
                    className="continue-test-btn"
                    onClick={(e) => handleContinueTest(result, e)}
                  >
                    ▶ Продолжить тест
                  </button>
                )}

                {result.isCompleted() && (
                  <>
                    <button 
                      className="details-btn"
                      onClick={(e) => handleViewDetails(result, e)}
                    >
                      📖 Подробнее
                    </button>
                    <button 
                      className="delete-result-btn"
                      onClick={(e) => openConfirmModal(result, e)}
                    >
                      🗑️ Удалить
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Удаление результата"
        message={`Вы уверены, что хотите удалить этот результат теста?`}
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirmModal}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmStyle="danger"
      />
    </div>
  );
}

export default ResultsTab;