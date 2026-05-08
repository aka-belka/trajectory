import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSession from '../models/UserSession'; 
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    grade: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth'});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'parent') {
      setFormData(prev => ({ ...prev, grade: '' }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Заполните все обязательные поля');
      scrollToTop(); 
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError('Введите корректный email (например, name@example.com)');
      scrollToTop(); 
      return false;
    }
    if (!isLogin && !formData.fullName) {
      setError('Введите полное имя');
      scrollToTop(); 
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      scrollToTop(); 
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);

        const redirectIntent = UserSession.getRedirectIntent();
        if (redirectIntent) {
          UserSession.clearRedirectIntent();
          if (redirectIntent === '/test') {
            navigate('/');
            localStorage.setItem('openTestAfterRedirect', 'true');
          } else {
            navigate(redirectIntent);
          }
        } else {
          navigate('/');
        }
      } else {
        await register(
          formData.email,
          formData.password,
          formData.fullName,
          role,
          formData.grade
        );
        navigate('/');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Произошла ошибка. Попробуйте позже');
      scrollToTop(); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Введите email и пароль для входа' 
              : 'Создайте аккаунт для прохождения теста'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Вход
          </button>
          <button
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Регистрация
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Полное имя</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                placeholder="Иванов Иван Иванович"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="example@mail.ru"
              pattern="[^\s@]+@([^\s@]+\.)+[^\s@]+"
              title="Введите корректный email (например, name@example.com)"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Подтверждение пароля</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Кто вы?</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-btn ${role === 'student' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('student')}
                >
                  🎓 Ученик
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === 'parent' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('parent')}
                >
                  👪 Родитель
                </button>
              </div>
            </div>
          )}

          {!isLogin && role === 'student' && (
            <div className="form-group">
              <label className="form-label">Класс</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                <option value="">Выберите класс</option>
                {[5, 6, 7, 8, 9, 10, 11].map(g => (
                  <option key={g} value={g}>{g} класс</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? 'Ещё нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button
              className="switch-link"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;