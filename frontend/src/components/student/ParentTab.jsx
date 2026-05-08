import { useState, useEffect } from 'react';
import ParentChild from '../../models/ParentChild';
import ConfirmModal from '../common/ConfirmModal';
import './ParentTab.css';

function ParentTab({ student, onRefresh }) {
  const [parentEmail, setParentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    parentToUnlink: null
  });

  useEffect(() => {
    if (student) {
      loadParents();
    }
  }, [student]);

  const loadParents = async () => {
    if (!student) return;
    try {
      const parentsList = await ParentChild.getParents(student.getId());
      setParents(parentsList);
    } catch (err) {
      console.error('Load parents error:', err);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!parentEmail) {
      setError('Введите email родителя');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await ParentChild.sendInvitation(parentEmail);
      setMessage(`Приглашение отправлено на ${parentEmail}`);
      setParentEmail('');
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setError(err.message || 'Ошибка отправки приглашения');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (parent, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      parentToUnlink: parent
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      parentToUnlink: null
    });
  };

  const handleConfirmUnlink = async () => {
    const { parentToUnlink } = confirmModal;
    if (!parentToUnlink) return;
    
    closeConfirmModal();
    setLoading(true);
    
    try {
      await parentToUnlink.unlink();
      await loadParents();
      if (onRefresh) onRefresh();
      setMessage('Родитель успешно отвязан');
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error('Unlink error:', err);
      setError(err.message || 'Ошибка отвязки');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <div className="parent-tab">
      <div className="parent-status">
        <h2>Привязка родителей</h2>
        
        {parents.length > 0 && (
          <div className="parents-list">
            <h3>Привязанные родители:</h3>
            {parents.map(parent => (
              <div key={parent.getId()} className="parent-card">
                <div className="parent-info">
                  <span className="parent-icon">👪</span>
                  <div>
                    <p className="parent-name">{parent.getName()}</p>
                    <p className="parent-linked">Дата привязки: {new Date(parent.getLinkedAt()).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  className="unlink-btn" 
                  onClick={(e) => openConfirmModal(parent, e)}
                  disabled={loading}
                >
                  Отвязать
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="invitation-form">
        <h3>Отправить приглашение родителю</h3>
        <form onSubmit={handleSendInvitation}>
          <input
            type="email"
            placeholder="Email родителя"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            disabled={loading}
            className="invite-input"
          />
          <button type="submit" disabled={loading} className="invite-btn">
            {loading ? 'Отправка...' : 'Отправить приглашение'}
          </button>
        </form>
        <p className="invite-hint">
          Родитель получит приглашение на email и сможет привязаться к вашему аккаунту
        </p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Отвязка родителя"
        message={`Вы уверены, что хотите отвязать родителя? После этого он потеряет доступ к просмотру ваших результатов и профессий.`}
        onConfirm={handleConfirmUnlink}
        onCancel={closeConfirmModal}
        confirmText="Отвязать"
        cancelText="Отмена"
        confirmStyle="danger"
      />
    </div>
  );
}

export default ParentTab;