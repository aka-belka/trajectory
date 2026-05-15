import { useState, useEffect } from 'react';
import ChildFavoritesTab from './ChildFavoritesTab';
import ChildResultsTab from './ChildResultsTab';
import './ChildModal.css';
import studentImg from '../../assets/images/student.png';

function ChildModal({ child, parentId, onClose }) {
  const [activeTab, setActiveTab] = useState('favorites');

  return (
    <div className="child-modal-overlay-chm" onClick={onClose}>
      <div className="child-modal-content-chm" onClick={(e) => e.stopPropagation()}>
        <div className="child-modal-header-chm">
          <div className="child-modal-title-chm">
            <span className="child-modal-avatar-chm"><img src={studentImg} className="student-icon-cm" alt="студент" /></span>
            <div>
              <h2>{child.getFullName()}</h2>
              <p className="child-modal-grade-chm">{child.getGrade()} класс</p>
            </div>
          </div>
          <button className="child-modal-close-chm" onClick={onClose}>×</button>
        </div>

        <div className="child-modal-tabs-chm">
          <button
            className={`child-tab-btn-chm ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Избранное
          </button>
          <button
            className={`child-tab-btn-chm ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            Результаты тестов
          </button>
        </div>

        <div className="child-modal-body-chm">
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