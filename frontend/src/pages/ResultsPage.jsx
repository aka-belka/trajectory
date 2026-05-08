import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Student from '../models/Student';
import TestResult from '../models/TestResult';
import ProfessionModal from '../components/professions/ProfessionModal';
import './ResultsPage.css';

function ResultsPage({ userId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId, location.key]);
  

  const loadData = async () => {
    setLoading(true);
    try {
      let testResult = null;
      
      if (location.state?.testResultId) {
        testResult = await TestResult.load(location.state.testResultId);
      } 
      else if (userId) {
        const student = await Student.findById(userId);
        const history = await student.getTestHistory();
        if (history.length > 0) {
          testResult = history[0];
        }
      }
      
      if (testResult) {;
        setResult(testResult);
        const professionsList = await testResult.getProfessionRecommendations();
        setProfessions(professionsList.slice(0, 6));
      }

    } catch (err) {
      console.error('Load results error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTestAgain = () => {
    navigate('/');
  };

  const handleOpenProfession = (profession) => {
    setSelectedProfession(profession);
    setShowModal(true);
  };

  if (loading) {
    return <div className="results-loading">Загрузка результатов...</div>;
  }

  if (!result) {
    return (
      <div className="results-empty">
        <h2>У вас пока нет результатов</h2>
        <p>Пройдите тест, чтобы узнать свои профессиональные склонности</p>
        <button onClick={handleTestAgain} className="start-test-btn">Пройти тест</button>
      </div>
    );
  }

  const scores = [
    { label: 'Природа', value: result.getNatureScore(), icon: '🌿', color: '#2ecc71', type: 'П' },
    { label: 'Техника', value: result.getTechniqueScore(), icon: '⚙️', color: '#3498db', type: 'Т' },
    { label: 'Человек', value: result.getHumanScore(), icon: '🤝', color: '#e74c3c', type: 'Ч' },
    { label: 'Знаковая система', value: result.getSignScore(), icon: '📊', color: '#f39c12', type: 'З' },
    { label: 'Художественный образ', value: result.getArtScore(), icon: '🎨', color: '#9b59b6', type: 'Х' }
  ];

  const dominantTypes = result.getDominantTypes(); 
  const isMultiType = dominantTypes.length > 1;

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-nav">
          <button onClick={handleGoBack} className="back-btn">
            ← Назад
          </button>
        </div>

        <h1 className="results-title">Ваш результат</h1>

        <div className="scores-section">
          <h2>Баллы по типам профессий</h2>
          <div className="scores-grid">
            {scores.map(score => (
              <div key={score.type} className="score-card">
                <div className="score-header">
                  <span className="score-icon">{score.icon}</span>
                  <span className="score-label">{score.label}</span>
                </div>
                <div className="score-bar-container">
                  <div 
                    className="score-bar" 
                    style={{ 
                      width: `${(score.value / 20) * 100}%`,
                      backgroundColor: score.color 
                    }}
                  />
                </div>
                <div className="score-value">{score.value} / 20</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dominant-section">
          {isMultiType ? (
            <>
              <h2 className="dominant-title">Ваши доминирующие типы</h2>
              <div className="dominant-badges">
                {dominantTypes.map(typeCode => (
                  <div 
                    key={typeCode} 
                    className="dominant-badge" 
                    style={{ backgroundColor: TestResult.getTypeColor(typeCode) }}
                  >
                    {typeCode}
                  </div>
                ))}
              </div>
              <p className="dominant-description">
                У вас ярко выражены склонности к {dominantTypes.length} направлениям.
                Вы можете рассмотреть профессии из следующих категорий:
              </p>
              <ul className="combined-types-list">
                {dominantTypes.map(typeCode => (
                  <li key={typeCode}>
                    <strong>{TestResult.getTypeFullName(typeCode)}</strong> — {TestResult.getTypeDescription(typeCode)}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="dominant-badge" style={{ backgroundColor: result.getDominantTypeColor() }}>
                {result.getDominantType()}
              </div>
              <h2 className="dominant-title">Ваш доминирующий тип</h2>
              <p className="dominant-name">{result.getDominantTypeFullName()}</p>
              <p className="dominant-description">
                {TestResult.getTypeDescription(result.getDominantType())}
              </p>
            </>
          )}
        </div>

        <div className="professions-section">
          <h2>Рекомендуемые профессии</h2>
          <div className="professions-grid">
            {professions.map(profession => (
              <div key={profession.getId()} className="profession-card">
                <h3 className="profession-title">{profession.getTitle()}</h3>
                <p className="profession-description">{profession.getDescription()?.substring(0, 100)}...</p>
                <button 
                  className="details-btn"
                  onClick={() => handleOpenProfession(profession)}
                >
                  Подробнее →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="actions-section">
          <button onClick={handleTestAgain} className="retest-btn">
            Пройти тест заново
          </button>
        </div>
      </div>

      {showModal && selectedProfession && (
        <ProfessionModal
          profession={selectedProfession}
          onClose={() => setShowModal(false)}
          isStudent={true}
          studentId={userId}  
          onRecommendationClick={(prof) => {
            setSelectedProfession(prof);
            setShowModal(true);
          }}
        />
      )}
    </div>
  );
}


export default ResultsPage;