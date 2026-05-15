import { useState } from 'react';
import ConfirmModal from '../common/ConfirmModal';
import './SettingsTab.css';

function SettingsTab({ student, onRefresh }) {
  const [fullName, setFullName] = useState(student?.getFullName() || '');
  const [grade, setGrade] = useState(student?.getGrade() || '');
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
      const updateData = {};
      let hasChanges = false;
      if (fullName !== student.getFullName()) {
        updateData.fullName = fullName;
        hasChanges = true;
      }
      if (grade !== student.getGrade()) {
        updateData.grade = grade;
        hasChanges = true;
      }
      
      if (hasChanges) {
        await student.updateProfile(updateData);
        if (onRefresh) {
          onRefresh(updateData);
        }
        
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
      await student.updateProfile({ 
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

  if (!student) return null;

  return (
    <div className="settings-tab-st">
      <div className="settings-nav-st">
        <button
          className={`settings-nav-btn-st ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          Личные данные
        </button>
        <button
          className={`settings-nav-btn-st ${activeSection === 'password' ? 'active' : ''}`}
          onClick={() => setActiveSection('password')}
        >
          Смена пароля
        </button>
      </div>

      {activeSection === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="settings-form-st">
          <div className="form-group-st">
            <label className="form-label-st">Email</label>
            <input
              type="email"
              value={student.getEmail()}
              disabled
              className="form-input-st disabled"
            />
            <p className="form-hint-st">Email нельзя изменить</p>
          </div>

          <div className="form-group-st">
            <label className="form-label-st">Полное имя</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input-st"
              placeholder="Ваше имя"
            />
          </div>

          <div className="form-group-st">
            <label className="form-label-st">Класс</label>
            <select
              value={grade}
              onChange={(e) => setGrade(parseInt(e.target.value))}
              className="form-select-st"
            >
              <option value="">Выберите класс</option>
              {[5, 6, 7, 8, 9, 10, 11].map(g => (
                <option key={g} value={g}>{g} класс</option>
              ))}
            </select>
          </div>

          <div className="form-actions-st">
            <button type="submit" disabled={loading} className="save-btn-st">
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      )}

      {activeSection === 'password' && (
        <form onSubmit={handleChangePassword} className="settings-form-st">
          <div className="form-group-st">
            <label className="form-label-st">Текущий пароль</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input-st"
              placeholder="Введите текущий пароль"
              required
            />
          </div>

          <div className="form-group-st">
            <label className="form-label-st">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input-st"
              placeholder="Минимум 6 символов"
              required
            />
          </div>

          <div className="form-group-st">
            <label className="form-label-st">Подтверждение нового пароля</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input-st"
              placeholder="Повторите новый пароль"
              required
            />
          </div>

          <div className="form-actions-st">
            <button type="submit" disabled={loading} className="save-btn-st">
              {loading ? 'Смена пароля...' : 'Изменить пароль'}
            </button>
          </div>
        </form>
      )}
      
      {message && <div className="success-message-st">{message}</div>}
      {error && <div className="error-message-st">{error}</div>}
    </div>
  );
}

export default SettingsTab;