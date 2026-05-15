import { useState, useEffect } from 'react';
import Parent from '../../models/Parent';
import ParentChild from '../../models/ParentChild';
import ChildrenTab from './ChildrenTab';
import ConfirmModal from '../common/ConfirmModal';
import ParentSettingsTab from './ParentSettingsTab';
import './ParentDashboard.css';

function ParentDashboard({ userId, onLogout }) {
  const [activeTab, setActiveTab] = useState('children');
  const [parent, setParent] = useState(null);
  const [parentName, setParentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    invitationToReject: null
  });

  useEffect(() => {
    loadParent();
  }, [userId]);

  const loadParent = async () => {
    setLoading(true);
    try {
      const parentInstance = await Parent.findById(userId);
      setParent(parentInstance);
      setParentName(parentInstance.getFullName());
      await loadInvitations();
    } catch (err) {
      console.error('Load parent error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateParentName = async (newName) => {
    setParentName(newName);
    if (parent) {
      await parent.updateProfile({ fullName: newName });
    }
  };

  const loadInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const pendingInvites = await ParentChild.getPendingInvitations();
      setInvitations(pendingInvites);
    } catch (err) {
      console.error('Load invitations error:', err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const acceptInvitation = async (invitationToken) => {
    try {
      await ParentChild.acceptInvitation(invitationToken);
      await loadInvitations();
      if (parent) {
        await parent.fetchChildren();
      }
    } catch (err) {
      console.error('Accept invitation error:', err);
    }
  };

  const openConfirmModal = (invitation, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      invitationToReject: invitation
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      invitationToReject: null
    });
  };

  const handleConfirmReject = async () => {
    const { invitationToReject } = confirmModal;
    if (!invitationToReject) return;
    
    const invitationToken = invitationToReject.getInvitationToken();
    
    closeConfirmModal();
    
    try {
      await ParentChild.rejectInvitation(invitationToken);
      await loadInvitations();
    } catch (err) {
      console.error('Reject invitation error:', err);
    }
  };

  const InvitationsTab = () => {
    if (loadingInvitations) {
      return <div className="invitations-loading-pd">Загрузка приглашений...</div>;
    }

    if (invitations.length === 0) {
      return (
        <div className="invitations-empty-pd">
          <p>У вас нет ожидающих приглашений</p>
          <p className="empty-hint-pd">Попросите ребёнка отправить вам приглашение</p>
        </div>
      );
    }

    return (
      <div className="invitations-tab-pd">
        <h3>Ожидающие приглашения</h3>
        <div className="invitations-list-pd">
          {invitations.map(inv => (
            <div key={inv.getId()} className="invitation-card-pd">
              <div className="invitation-info-pd">
                <span className="invitation-icon-pd">👨‍🎓</span>
                <div className="invitation-details-pd">
                  <p className="invitation-title-pd">Приглашение от ученика</p>
                  <p className="invitation-subtitle-pd">{inv.getName() || `Ученик #${inv.getStudentId()}`}</p>
                </div>
              </div>
              <div className="invitation-actions-pd">
                <button 
                  className="accept-btn-pd"
                  onClick={() => acceptInvitation(inv.getInvitationToken())}
                >
                  Принять
                </button>
                <button 
                  className="reject-btn-pd"
                  onClick={(e) => openConfirmModal(inv, e)}
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const tabs = {
    children: { label: 'Мои дети', component: <ChildrenTab parent={parent} /> },
    invitations: { label: 'Приглашения', component: <InvitationsTab /> },
    settings: { label: 'Настройки', component: <ParentSettingsTab parent={parent} onRefresh={updateParentName}/> }
  };

  if (loading) {
    return <div className="parent-dashboard-loading-pd">Загрузка...</div>;
  }

  if (!parent) {
    return <div className="parent-dashboard-error-pd">Не удалось загрузить данные</div>;
  }

  return (
    <div className="parent-dashboard-pd">
      <div className="dashboard-header-pd">
        <h1>Личный кабинет родителя</h1>
        <p className="parent-name-pd">{parentName}</p>
      </div>

      <div className="dashboard-tabs-pd">
        {Object.entries(tabs).map(([key, { label }]) => (
          <button
            key={key}
            className={`tab-btn-pd ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="dashboard-content-pd">
        {tabs[activeTab].component}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Отклонение приглашения"
        message={`Вы уверены, что хотите отклонить приглашение от ученика ${confirmModal.invitationToReject?.getName()}?`}
        onConfirm={handleConfirmReject}
        onCancel={closeConfirmModal}
        confirmText="Отклонить"
        cancelText="Отмена"
        confirmStyle="warning"
      />
    </div>
  );
}

export default ParentDashboard;