import './ConfirmModal.css';

function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Да',
  cancelText = 'Нет',
  confirmStyle = 'danger'
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button 
            className={`confirm-btn ${confirmStyle}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;