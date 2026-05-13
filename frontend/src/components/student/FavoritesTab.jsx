import { useState, useEffect } from 'react';
import ProfessionModal from '../professions/ProfessionModal';
import FavoriteProfession from '../../models/FavoriteProfession';
import Comment from '../../models/Comment';
import ConfirmModal from '../common/ConfirmModal';
import './FavoritesTab.css';

function FavoritesTab({ student, refreshTrigger, onRefresh, userId }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    professionIdToDelete: null
  });

  useEffect(() => {
    if (student) {
      loadFavorites();
    }
  }, [student, refreshTrigger]);
  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favoritesList = await FavoriteProfession.getFavoriteProfessions(student.getId());
      setFavorites(favoritesList);
      
      const commentsMap = {};
      for (const prof of favoritesList) {
        try {
          const comment = await Comment.getByStudentAndProfessionForStudent(student.getId(), prof.getId());
          if (comment) {
            commentsMap[prof.getId()] = comment;
          }
        } catch (err) {
          console.error('Load comment error:', err);
        }
      }
      setComments(commentsMap);
    } catch (err) {
      console.error('Load favorites error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowComment = (professionId) => {
    const comment = comments[professionId];
    if (comment) {
      setSelectedComment(comment);
      setShowCommentModal(true);
    }
  };

  const openConfirmModal = (professionId, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      professionIdToDelete: professionId
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      professionIdToDelete: null
    });
  };

  const handleConfirmDelete = async () => {
    const { professionIdToDelete } = confirmModal;
    if (!professionIdToDelete) return;
    
    closeConfirmModal();
    
    try {
      const comment = comments[professionIdToDelete];
      if (comment) {
        try {
          await comment.delete();
        } catch (err) {
          console.error('Delete comment error:', err);
        }
      }
      await student.removeFromFavorites(professionIdToDelete);
      await loadFavorites();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Remove favorite error:', err);
    }
  };

  const handleOpenProfession = (profession) => {
    setSelectedProfession(profession);
    setShowModal(true);
  };

  if (loading) {
    return <div className="favorites-loading">Загрузка избранного...</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <p>⭐ У вас пока нет избранных профессий</p>
        <p className="empty-hint">Добавляйте профессии из результатов теста</p>
      </div>
    );
  }

  return (
    <div className="favorites-tab">
      <div className="favorites-header">
        <h2>Избранные профессии</h2>
        <p className="favorites-count">Всего: {favorites.length}</p>
      </div>

      <div className="favorites-list">
        {favorites.map(profession => (
          <div key={profession.getId()} className="favorite-card">
            <div className="favorite-info">
              <h3 className="favorite-title">{profession.getTitle()}</h3>
              <div className="favorite-type">
                <span 
                  className="type-dot" 
                  style={{ backgroundColor: profession.getTypeColor() }}
                />
                <span>{profession.getTypeShortName()}</span>
              </div>
              <p className="favorite-description">{profession.getDescription()?.substring(0, 100)}...</p>
            </div>
            
            <div className="favorite-actions">
              <button 
                className="details-btn"
                onClick={() => handleOpenProfession(profession)}
              >
                📖 Подробнее
              </button>
              <button 
                className="remove-btn"
                onClick={(e) => openConfirmModal(profession.getId(), e)}
              >
                ✖ Удалить
              </button>
              
              {comments[profession.getId()] && (
                <div 
                  className="parent-comment-icon" 
                  title="Комментарий родителя"
                  onClick={() => handleShowComment(profession.getId())}
                >
                  💬
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {showCommentModal && selectedComment && (
        <div className="comment-modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div className="comment-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>💬 Комментарий родителя</h3>
            <p className="comment-parent-name">
               👪 {selectedComment.getName()} 
            </p>
            <p className="comment-text">{selectedComment.getText()}</p>
            <small>Дата: {new Date(selectedComment.getCreatedAt()).toLocaleDateString()}</small>
            <button onClick={() => setShowCommentModal(false)}>Закрыть</button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Удаление из избранного"
        message="Вы уверены, что хотите удалить эту профессию из избранного?"
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirmModal}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmStyle="danger"
      />

      {showModal && selectedProfession && (
        <ProfessionModal
          profession={selectedProfession}
          onClose={() => {setShowModal(false);loadFavorites(); if (onRefresh) onRefresh();}}
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

export default FavoritesTab;