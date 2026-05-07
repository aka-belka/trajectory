import { useState, useEffect } from 'react';
import ChildFavoritesTab from './ChildFavoritesTab';
import ChildResultsTab from './ChildResultsTab';
import './ChildModal.css';

function ChildModal({ child, parentId, onClose }) {
  const [activeTab, setActiveTab] = useState('favorites');

  return (
    <div className="child-modal-overlay" onClick={onClose}>
      <div className="child-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="child-modal-header">
          <div className="child-modal-title">
            <span className="child-modal-avatar">👨‍🎓</span>
            <div>
              <h2>{child.getFullName()}</h2>
              <p className="child-modal-grade">{child.getGrade()} класс</p>
            </div>
          </div>
          <button className="child-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="child-modal-tabs">
          <button
            className={`child-tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ⭐ Избранное
          </button>
          <button
            className={`child-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            📊 Результаты тестов
          </button>
        </div>

        <div className="child-modal-body">
          {activeTab === 'favorites' && (
            <ChildFavoritesTab studentId={child.getId()} parentId={parentId} />
          )}
          {activeTab === 'results' && (
            <ChildResultsTab studentId={child.getId()} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChildModal;