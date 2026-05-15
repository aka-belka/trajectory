import { useState, useEffect } from 'react';
import Student from '../../models/Student';
import { getTypeColor, getTypeFullName } from '../../constants/professionTypes';
import './ChildResultsTab.css';
import leafImg from '../../assets/images/leaf.png';
import gearImg from '../../assets/images/gear.png';
import handshakeImg from '../../assets/images/handshake.png';
import scheduleImg from '../../assets/images/schedule.png';
import paletteImg from '../../assets/images/palette.png';

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

  const renderTypeInfo = (result) => {
    const dominantTypes = result.getDominantTypes();
    const isMultiType = dominantTypes.length > 1;

    if (isMultiType) {
      return (
        <div className="child-result-type-multi-crt">
          <div className="child-type-badges-crt">
            {dominantTypes.map(typeCode => (
              <span 
                key={typeCode} 
                className="child-type-badge-small-crt" 
                style={{ backgroundColor: getTypeColor(typeCode) }}
              >
                {typeCode}
              </span>
            ))}
          </div>
          <span className="child-type-name-multi-crt">
            {dominantTypes.map(typeCode => getTypeFullName(typeCode)).join(', ')}
          </span>
        </div>
      );
    }

    return (
      <div className="child-result-type-crt">
        <span 
          className="child-type-badge-crt" 
          style={{ backgroundColor: getTypeColor(result.getDominantType()) }}
        >
          {result.getDominantType()}
        </span>
        <span className="child-type-name-crt">{getTypeFullName(result.getDominantType())}</span>
      </div>
    );
  };

  if (loading) {
    return <div className="child-results-loading-crt">Загрузка результатов...</div>;
  }

  if (testHistory.length === 0) {
    return (
      <div className="child-results-empty-crt">
        <p> Ребёнок ещё не проходил тест</p>
      </div>
    );
  }

  return (
    <div className="child-results-tab-crt">
      <div className="child-results-header-crt">
        <h3>История тестирований</h3>
        <p className="child-results-count-crt">Всего: {testHistory.length}</p>
      </div>

      <div className="child-results-list-crt">
        {testHistory.map((result, index) => (
          <div key={result.getId()} className="child-result-card-crt">
            <div className="child-result-number-crt">#{testHistory.length - index}</div>
            <div className="child-result-info-crt">
              <div className="child-result-date-crt">{formatDate(result.getCompletedAt())}</div>
              
              {renderTypeInfo(result)}
              
              <div className="child-result-scores-crt">
                <span className="score-item-crt" style={{ background: '#60b88582' }}><img src={leafImg} className="icon-rt" alt="лист" /> Природа: {result.getNatureScore()}</span>
                <span className="score-item-crt" style={{ background: '#6cabd57b' }}><img src={gearImg} className="icon-rt" alt="шестеренка" /> Техника: {result.getTechniqueScore()}</span>
                <span className="score-item-crt" style={{ background: '#c6756c87' }}><img src={handshakeImg} className="icon-rt" alt="рукопожатие" /> Человек: {result.getHumanScore()}</span>
                <span className="score-item-crt" style={{ background: '#e6ba727e' }}><img src={scheduleImg} className="icon-rt" alt="график" />  Знаковая: {result.getSignScore()}</span>
                <span className="score-item-crt" style={{ background: '#a46bba74' }}><img src={paletteImg} className="icon-rt" alt="палетка" /> Художественный: {result.getArtScore()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChildResultsTab;