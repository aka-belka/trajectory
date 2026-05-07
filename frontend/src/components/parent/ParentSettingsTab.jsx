import { useState } from 'react';
import './ParentSettingsTab.css';

function ParentSettingsTab({ parent, onRefresh, onUpdateName}) {
  const [fullName, setFullName] = useState(parent?.getFullName() || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      let hasChanges = false;
      
      if (fullName !== parent.getFullName()) {
        await parent.updateProfile({ fullName });
        setFullName(fullName);
        if (onRefresh) {
          onRefresh(fullName);
        }
        hasChanges = true;
      }
      
      if (hasChanges) {
        setMessage('Профиль успешно обновлён');
      } else {
        setMessage('Нет изменений');
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Ошибка обновления профиля');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Новый пароль и подтверждение не совпадают');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await parent.updateProfile({ 
        password: newPassword,
        currentPassword: currentPassword 
      });
      setMessage('Пароль успешно изменён');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Ошибка изменения пароля');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!parent) return null;

  return (
    <div className="parent-settings-tab">
      <div className="settings-nav">
        <button
          className={`settings-nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          👤 Личные данные
        </button>
        <button
          className={`settings-nav-btn ${activeSection === 'password' ? 'active' : ''}`}
          onClick={() => setActiveSection('password')}
        >
          🔒 Смена пароля
        </button>
      </div>

      {activeSection === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="settings-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={parent.getEmail()}
              disabled
              className="form-input disabled"
            />
            <p className="form-hint">Email нельзя изменить</p>
          </div>

          <div className="form-group">
            <label className="form-label">Полное имя</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
              placeholder="Ваше имя"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      )}

      {activeSection === 'password' && (
        <form onSubmit={handleChangePassword} className="settings-form">
          <div className="form-group">
            <label className="form-label">Текущий пароль</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input"
              placeholder="Введите текущий пароль"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              placeholder="Минимум 6 символов"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Подтверждение нового пароля</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="Повторите новый пароль"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Смена пароля...' : 'Изменить пароль'}
            </button>
          </div>
        </form>
      )}

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default ParentSettingsTab;