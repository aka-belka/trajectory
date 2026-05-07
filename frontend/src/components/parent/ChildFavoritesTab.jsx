import { useState, useEffect } from 'react';
import Student from '../../models/Student';
import Comment from '../../models/Comment';
import ProfessionModal from '../professions/ProfessionModal';
import './ChildFavoritesTab.css';

function ChildFavoritesTab({ studentId, parentId }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [saving, setSaving] = useState({});
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем избранное ребёнка
      const student = await Student.findById(studentId);
      const favoritesList = await student.getFavoriteProfessions();
      setFavorites(favoritesList);

      // Загружаем комментарии родителя
      const commentsMap = {};
      const editingMap = {};
      for (const prof of favoritesList) {
        const comment = await Comment.getByStudentAndProfession(studentId, prof.getId());
        if (comment) {
          commentsMap[prof.getId()] = comment;
          editingMap[prof.getId()] = comment.getText();
        } else {
          editingMap[prof.getId()] = '';
        }
      }
      setComments(commentsMap);
      setEditingComment(editingMap);
    } catch (err) {
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComment = async (professionId, text) => {
    setSaving(prev => ({ ...prev, [professionId]: true }));
    try {
      const existingComment = await Comment.getByStudentAndProfession(studentId, professionId);
      if (!text || text.trim() === '') {
        if (existingComment) {
          await existingComment.delete();
          setComments(prev => {
            const newComments = { ...prev };
            delete newComments[professionId];
            return newComments;
          });
          setEditingComment(prev => ({ ...prev, [professionId]: '' }));
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      if (existingComment) {
        await existingComment.update(text);
        setComments(prev => ({ ...prev, [professionId]: existingComment }));
      } else {
        const newComment = await Comment.create(parentId, studentId, professionId, text);
        if (newComment) {
          setComments(prev => ({ ...prev, [professionId]: newComment }));
        }
      }
      
      setEditingComment(prev => ({ ...prev, [professionId]: text }));
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Save comment error:', err);
    } finally {
      setSaving(prev => ({ ...prev, [professionId]: false }));
    }
  };

  const handleOpenProfession = (profession) => {
    setSelectedProfession(profession);
    setShowModal(true);
  };

  if (loading) {
    return <div className="child-favorites-loading">Загрузка избранного...</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="child-favorites-empty">
        <p>⭐ У ребёнка пока нет избранных профессий</p>
      </div>
    );
  }

  return (
    <div className="child-favorites-tab">
      <div className="child-favorites-header">
        <h3>Избранные профессии</h3>
        <p className="child-favorites-count">Всего: {favorites.length}</p>
      </div>

      <div className="child-favorites-list">
        {favorites.map(profession => (
          <div key={profession.getId()} className="child-favorite-card">
            <div className="child-favorite-info">
              <div className="child-favorite-header">
                <div className="child-favorite-title-section">
                  <h4 className="child-favorite-title"> {profession.getTitle()} </h4>
                  <span 
                    className="child-favorite-type"
                    style={{ backgroundColor: profession.getTypeColor() }}
                  >
                    {profession.getTypeShortName()}
                  </span>
                </div>
                <button 
                  className="child-favorite-details-btn"
                  onClick={() => handleOpenProfession(profession)}
                >
                  Подробнее
                </button>
              </div>
              <p className="child-favorite-description">
                {profession.getDescription()?.substring(0, 120)}...
              </p>
            </div>

            <div className="child-favorite-comment">
              <label className="comment-label">💬 Комментарий родителя:</label>
              <textarea
                value={editingComment[profession.getId()] || ''}
                onChange={(e) => setEditingComment(prev => ({
                  ...prev,
                  [profession.getId()]: e.target.value
                }))}
                placeholder="Напишите комментарий о профессии..."
                className="comment-textarea"
                rows={3}
              />
              <button
                onClick={() => handleSaveComment(profession.getId(), editingComment[profession.getId()])}
                disabled={saving[profession.getId()]}
                className="save-comment-btn"
              >
                {saving[profession.getId()] ? 'Сохранение...' : 'Сохранить комментарий'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedProfession && (
        <ProfessionModal
          profession={selectedProfession}
          onClose={() => setShowModal(false)}
          onRecommendationClick={(prof) => {
            setSelectedProfession(prof);
            setShowModal(true);
          }}
        />
      )}
    </div>
  );
}

export default ChildFavoritesTab;