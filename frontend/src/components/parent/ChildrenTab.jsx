import { useState, useEffect } from 'react';
import ParentChildModel from '../../models/ParentChild';
import ConfirmModal from '../common/ConfirmModal';
import ChildModal from './ChildModal';
import './ChildrenTab.css';

function ChildrenTab({ parent }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    childToUnlinkId: null,
    childName: ''
  });

  useEffect(() => {
    if (parent) {
      loadChildren();
    }
  }, [parent]);

  const loadChildren = async () => {
    setLoading(true);
    try {
      await parent.fetchChildren();
      const childrenList = parent.getChildren();
      setChildren(childrenList);
    } catch (err) {
      console.error('Load children error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (child, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      childToUnlinkId: child.getId(),
      childName: child.getFullName()
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      childToUnlinkId: null,
      childName: ''
    });
  };

  const handleConfirmUnlink = async () => {
    const { childToUnlinkId } = confirmModal;
    if (!childToUnlinkId) return;
    
    closeConfirmModal();
    setLoading(true);
    
    try {
      const parents = await ParentChildModel.getParents(childToUnlinkId);
      const relation = parents.find(p => p.getParentId() === parent.getId());
      
      if (relation) {
        await relation.unlink();
        await loadChildren();
      }
    } catch (err) {
      console.error('Unlink error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChild = (child) => {
    setSelectedChild(child);
    setShowModal(true);
  };

  if (loading) {
    return <div className="children-loading">Загрузка списка детей...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="children-empty">
        <p>😊 У вас пока нет привязанных детей</p>
        <p className="empty-hint">
          Попросите ребёнка отправить вам приглашение из его личного кабинета
        </p>
      </div>
    );
  }

  return (
    <div className="children-tab">
      <div className="children-header">
        <h2>Мои дети</h2>
        <p className="children-count">Всего: {children.length}</p>
      </div>

      <div className="children-list">
        {children.map(child => (
          <div key={child.getId()} className="child-card">
            <div className="child-info">
              <div className="child-avatar">
                <span className="avatar-emoji">👨‍🎓</span>
              </div>
              <div>
                <h3 className="child-name">{child.getFullName()}</h3>
                <p className="child-grade">{child.getGrade()} класс</p>
              </div>
            </div>
            <div className="child-actions">
              <button 
                className="details-child-btn"
                onClick={() => handleOpenChild(child)}
              >
                📖 Подробнее
              </button>
              <button 
                className="unlink-child-btn"
                onClick={(e) => openConfirmModal(child, e)}
              >
                Отвязать
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedChild && (
        <ChildModal
          child={selectedChild}
          parentId={parent.getId()}
          onClose={() => setShowModal(false)}
        />
      )}
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Отвязка ребёнка"
        message={`Вы уверены, что хотите отвязать ${confirmModal.childName}? После этого вы потеряете доступ к просмотру его результатов и профессий.`}
        onConfirm={handleConfirmUnlink}
        onCancel={closeConfirmModal}
        confirmText="Отвязать"
        cancelText="Отмена"
        confirmStyle="danger"
      />
    </div>
  );
}

export default ChildrenTab;