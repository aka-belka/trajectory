import { useState, useEffect } from 'react';
import FavoriteProfession from '../../models/FavoriteProfession';
import './ProfessionModal.css';
import notesImg from '../../assets/images/notes.png';
import booksImg from '../../assets/images/books.png';
import moneyImg from '../../assets/images/money.png';
import hatImg from '../../assets/images/hat.png';

function ProfessionModal({ 
  profession, 
  onClose, 
  isStudent = false, 
  studentId, 
  onRecommendationClick, 
  maxRecommendations = 5, 
  maxDescriptionLength = 80,
  closeDelay = 100  
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  

  useEffect(() => {
    loadRecommendations();
    if (isStudent && studentId) {
      loadFavoriteStatus();
    }
  }, [profession, isStudent, studentId]);

  const loadRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const recs = await profession.getRecommendations();
      setRecommendations(recs);
    } catch (err) {
      console.error('Load recommendations error:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const loadFavoriteStatus = async () => {
    try {
      if (!studentId) return;
      const isFav = await FavoriteProfession.isFavorite(parseInt(studentId), profession.getId());
      setIsFavorite(isFav);
    } catch (err) {
      console.error('Check favorite error:', err);
    }
  };

  const handleAddToFavorites = async () => {
    try {
      if (!studentId) return;
      await FavoriteProfession.add(parseInt(studentId), profession.getId());
      setIsFavorite(true);
    } catch (err) {
      console.error('Add favorite error:', err);
    }
  };

  const handleRemoveFromFavorites = async () => {
    try {
      if (!studentId) return;
      await FavoriteProfession.remove(parseInt(studentId), profession.getId());
      setIsFavorite(false);
    } catch (err) {
      console.error('Remove favorite error:', err);
    }
  };

  const handleRecommendationClick = (recProfession) => {
    onClose();
    setTimeout(() => {
      if (onRecommendationClick) {
        onRecommendationClick(recProfession);
      }
    }, closeDelay);
  };

  const examSubjectsArray = profession.getExamSubjectsArray();
  const educationPlacesArray = profession.getEducationPlacesArray();

  return (
    <div className="profession-modal-overlay" onClick={onClose}>
      <div className="profession-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="profession-modal-close" onClick={onClose}>×</button>

        <div className="profession-modal-header">
          <div className="profession-type-badge" style={{ backgroundColor: profession.getTypeColor() }}>
            {profession.getProfessionType()}
          </div>
          <div className="profession-modal-info">
            <h1 className="profession-title-pmo">{profession.getTitle()}</h1>
            <p className="profession-type-name">{profession.getTypeFullName()}</p>
          </div>
        </div>

        <div className="profession-modal-body">
          <section className="profession-section-pm">
            <h2 className="section-icon"><img src={notesImg} className="icons-pm" alt="заметка" />Описание</h2>
            <p className="profession-description">{profession.getDescription()}</p>
          </section>

          <section className="profession-section-pm">
            <h2 className="section-icon"><img src={booksImg} className="icons-pm" alt="книга" />Предметы ЕГЭ</h2>
            <div className="exam-tags">
              {examSubjectsArray.map((subject, index) => (
                <span key={index} className="exam-tag">{subject}</span>
              ))}
            </div>
          </section>

          <section className="profession-section-pm">
            <h2 className="section-icon"><img src={moneyImg} className="icons-pm" alt="деньги" />Зарплата</h2>
            <div className="salary-box">
              <span className="salary-value">{profession.getSalary()}</span>
              <span className="salary-period">в месяц</span>
            </div>
          </section>

          <section className="profession-section-pm">
            <h2 className="section-icon"><img src={hatImg} className="icons-pm" alt="шапка" />Где учиться</h2>
            <ul className="education-list">
              {educationPlacesArray.map((place, index) => (
                <li key={index}><img src={hatImg} className="icons-small-pm" alt="шапка" />{place}</li>
              ))}
            </ul>
          </section>

          {isStudent && (
            <section className="profession-section-pm favorite-section">
              {isFavorite ? (
                <button className="remove-favorite-btn" onClick={handleRemoveFromFavorites}>
                  ★ Удалить из избранного
                </button>
              ) : (
                <button className="add-favorite-btn" onClick={handleAddToFavorites}>
                  ☆ Добавить в избранное
                </button>
              )}
            </section>
          )}

          {recommendations.length > 0 && (
            <section className="profession-section-pm">
              <h2 className="section-icon">Похожие профессии</h2>
              <div className="recommendations-list">
                {recommendations.slice(0, maxRecommendations).map(rec => (
                  <div key={rec.getId()} className="recommendation-card">
                    <h4 className="rec-title">{rec.getTitle()}</h4>
                    <p className="rec-description">{rec.getDescription()?.substring(0, maxDescriptionLength)}...</p>
                    <button 
                      className="recommendation-details-btn"
                      onClick={() => handleRecommendationClick(rec)}
                    >
                      Подробнее →
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfessionModal;