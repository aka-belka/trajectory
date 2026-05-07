import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import './Header.css';

function Header({ isAuthenticated, userRole, onLogout }) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const getProfileLink = () => {
    return '/profile';
  };

  const getUserRoleText = () => {
    if (userRole === 'student') return 'Ученик';
    if (userRole === 'parent') return 'Родитель';
    return '';
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">Профориентатор</span>
            </Link>
          </div>

          <nav className="nav">
            <Link to="/" className="nav-link">Главная</Link>
            
            {isAuthenticated && userRole === 'student' && (
              <Link to="/profile" className="nav-link">Личный кабинет</Link>
            )}
            
            {isAuthenticated && userRole === 'parent' && (
              <Link to="/profile" className="nav-link">Личный кабинет</Link>
            )}
          </nav>

          <div className="auth-section">
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-role">{getUserRoleText()}</span>
                <button onClick={handleLogoutClick} className="logout-btn">
                  Выйти
                </button>
              </div>
            ) : (
              <Link to="/auth" className="login-btn">Войти</Link>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Выход из аккаунта"
        message="Вы уверены, что хотите выйти из аккаунта?"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        confirmText="Выйти"
        cancelText="Отмена"
        confirmStyle="warning"
      />
    </>
  );
}

export default Header;