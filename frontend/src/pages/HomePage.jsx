import { useState, useEffect } from 'react';
import TestModal from '../components/test/TestModal';
import Student from '../models/Student';
import ProfessionModal from '../components/professions/ProfessionModal';
import Profession from '../models/Profession';
import UserSession from '../models/UserSession'; 
import { useAuth } from '../contexts/AuthContext'; 
import { getAllTypes, getTypeExamples, getTypeColor, getTypeFullName } from '../constants/professionTypes';
import './HomePage.css';
import doctorImg from '../assets/images/doctor.png';
import programmerImg from '../assets/images/programmer.png';
import veterinarianImg from '../assets/images/veterinarian.png';
import translatorImg from '../assets/images/translator.png';
import musicianImg from '../assets/images/musician.png';

import teacherImg from '../assets/images/teacher.png';
import engineerImg from '../assets/images/engineer.png';
import designerImg from '../assets/images/designer.png';
import analystImg from '../assets/images/analyst.png';

function HomePage({ isAuthenticated }) {
  const { user } = useAuth();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [hasUnfinishedTest, setHasUnfinishedTest] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [showProfessionModal, setShowProfessionModal] = useState(false);

  const heroImages = [
    { src: doctorImg, alt: 'Врач', title: 'Врач' },
    { src: programmerImg, alt: 'Программист', title: 'Программист' },
    { src: veterinarianImg, alt: 'Ветеринар', title: 'Ветеринар' },
    { src: translatorImg, alt: 'Переводчик', title: 'Переводчик' },
    { src: musicianImg, alt: 'Музыкант', title: 'Музыкант' }
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const role = user?.role;
    const shouldOpenTest = localStorage.getItem('openTestAfterRedirect');
    if (shouldOpenTest === 'true') {
      localStorage.removeItem('openTestAfterRedirect');
      if (isAuthenticated && role === 'student') {
        setIsTestModalOpen(true);
      }
    }

    if (isAuthenticated && role === 'student') {
      checkUnfinishedTest();
    }else {
      setHasUnfinishedTest(false);
    }
  }, [isAuthenticated, user]);

  const isStudent = user?.role === 'student';

  const checkUnfinishedTest = async () => {
    try {
      if (!user?.id) {
        setHasUnfinishedTest(false);
        return;
      }
      
      const student = await Student.findById(parseInt(user.id));
      const hasUnfinished = await student.hasUnfinishedTest();
      setHasUnfinishedTest(hasUnfinished);
    } catch (err) {
      console.error('Check unfinished test error:', err);
      setHasUnfinishedTest(false);
    }
  };

  const handleStartTest = () => {
    if (!isAuthenticated) {
      UserSession.saveRedirectIntent('/test');
      window.location.href = '/auth';
      return;
    }
    if (!isTestModalOpen) {  
      setIsTestModalOpen(true);
    }
  };

  const handleCloseTestModal = () => {~
    setIsTestModalOpen(false);
    checkUnfinishedTest();
  };

  const professionTypesList = getAllTypes();
  const popularProfessions = [
    'Программист', 'Врач', 'Дизайнер интерьеров', 'Аналитик данных', 'Учитель', 'Инженер-конструктор'
  ];

  const handleOpenProfessionModal = async (professionTitle) => {
    try {
      const profession = await Profession.findByTitle(professionTitle);
      
      if (profession) {

        setSelectedProfession(profession);
        setShowProfessionModal(true);
      } else {
        console.log('Профессия не найдена:', professionTitle);
      }
    } catch (err) {
      console.error('Error loading profession:', err);
    }
  };

    if (user?.role === 'parent') {
    return (
      <div className="homepage">
        <section className="hero-parent">
          <div className="hero-parent-content">
            <h1 className="hero-title">
              Профориентация школьников
            </h1>
            <p className="hero-subtitle">
              Бесплатный тест по методике Е.А. Климова помогает определить профессиональные склонности ученика
            </p>
          </div>
          <div className="hero-parent-visual">
            <div className="hero-image-container">
              {heroImages.map((image, idx) => (
                <img
                  key={idx}
                  src={image.src}
                  alt={image.alt}
                  className={`hero-slide-image ${idx === currentImageIndex ? 'active' : ''}`}
                />
              ))}
              <div className="hero-image-label">{heroImages[currentImageIndex].title}</div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2 className="section-title">Что даёт тест?</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>Определяет тип профессий</h3>
              <p>Тест выявляет доминирующий тип профессий из пяти возможных по методике Климова</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📋</div>
              <h3>Даёт список профессий</h3>
              <p>На основе результатов теста формируется список рекомендуемых профессий</p>
            </div>
            <div className="info-card">
              <div className="info-icon">👨‍👩‍👧</div>
              <h3>Помогает родителям</h3>
              <p>Вы можете отслеживать прогресс ребёнка и оставлять комментарии к профессиям</p>
            </div>
          </div>
        </section>

        <section className="profession-types">
          <h2 className="section-title">5 типов профессий</h2>
          <div className="types-grid">
            {professionTypesList.map(type => (
              <div key={type.code} className="type-card" style={{ borderTopColor: type.color }}>
                <h3 className="type-name">{type.fullName}</h3>
                <div className="type-professions-list">
                  {getTypeExamples(type.code).split(', ').map(professionName => (
                    <span 
                      key={professionName} 
                      className="type-profession-item"
                      onClick={() => handleOpenProfessionModal(professionName.trim())}
                    >
                      {professionName.trim()}
                    </span>
                  ))}
                </div>
                <div className="type-code" style={{ backgroundColor: type.color }}>
                  {type.code}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="popular-professions">
          <h2 className="section-title">Популярные профессии</h2>
          <div className="popular-grid">
            {popularProfessions.map(prof => (
              <div 
                key={prof} 
                className="popular-card"
                onClick={() => handleOpenProfessionModal(prof)}
                style={{ cursor: 'pointer' }}
              >
                <span className="popular-icon">⭐</span>
                <span className="popular-name">{prof}</span>
              </div>
            ))}
          </div>
        </section>

        {showProfessionModal && selectedProfession && (
          <ProfessionModal
            profession={selectedProfession}
            onClose={() => setShowProfessionModal(false)}
            isStudent={(() => {
              return isAuthenticated && user?.role === 'student';
            })()}
            onRecommendationClick={(prof) => {
              setSelectedProfession(prof);
              setShowProfessionModal(true);
            }}
          />
        )}

      </div>
    );
  }

  return (
    <div className="homepage">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Кем стать? <span className="highlight">Узнай за 5 минут</span>
          </h1>
          <p className="hero-subtitle">
            Бесплатный профориентационный тест по методике Е.А. Климова для школьников 5–11 классов
          </p>
          <button className="cta-button" onClick={handleStartTest}>
            {hasUnfinishedTest ? '▶ Продолжить тест' : '🚀 Пройти тест'}
          </button>
          {hasUnfinishedTest && (
            <p className="unfinished-hint">У вас есть незавершённый тест. Продолжите с того места, где остановились.</p>
          )}
        </div>
        <div className="hero-visual">
          <div className="hero-image-container">
            {heroImages.map((image, idx) => (
              <img
                key={idx}
                src={image.src}
                alt={image.alt}
                className={`hero-slide-image ${idx === currentImageIndex ? 'active' : ''}`}
              />
            ))}
            <div className="hero-image-label">{heroImages[currentImageIndex].title}</div>
          </div>
          <div className="trajectory-line"></div>
        </div>
        
      </section>

      <section className="how-it-works">
        <h2 className="section-title">Как это работает</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">📋</div>
            <h3 className="step-title">Пройдите тест</h3>
            <p className="step-description">Ответьте на 20 простых вопросов о ваших предпочтениях</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">📊</div>
            <h3 className="step-title">Получите результат</h3>
            <p className="step-description">Узнайте свой доминирующий тип профессий</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">💼</div>
            <h3 className="step-title">Выберите профессию</h3>
            <p className="step-description">Изучите подходящие профессии и добавьте в избранное</p>
          </div>
        </div>
      </section>

      <section className="profession-types">
        <h2 className="section-title">5 типов профессий</h2>
        <div className="types-grid">
          {professionTypesList.map(type => (
            <div key={type.code} className="type-card" style={{ borderTopColor: type.color }}>
              <h3 className="type-name">{type.fullName}</h3>
              <div className="type-professions-list">
                {getTypeExamples(type.code).split(', ').map(professionName => (
                  <span 
                    key={professionName} 
                    className="type-profession-item"
                    onClick={() => handleOpenProfessionModal(professionName.trim())}
                  >
                    {professionName.trim()}
                  </span>
                ))}
              </div>
              <div className="type-code" style={{ backgroundColor: type.color }}>
                {type.code}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="popular-professions">
        <h2 className="section-title">Популярные профессии</h2>
        <div className="popular-grid">
          {popularProfessions.map(prof => (
            <div 
              key={prof} 
              className="popular-card"
              onClick={() => handleOpenProfessionModal(prof)}
              style={{ cursor: 'pointer' }}
            >
              <span className="popular-icon">⭐</span>
              <span className="popular-name">{prof}</span>
            </div>
          ))}
        </div>
      </section>
      
      {isTestModalOpen && (
        <TestModal
          isOpen={isTestModalOpen}
          onClose={handleCloseTestModal}
          studentId={user?.id}
        />
      )}

      {showProfessionModal && selectedProfession && (
        <ProfessionModal
          profession={selectedProfession}
          onClose={() => setShowProfessionModal(false)}
          isStudent={(() => {return isAuthenticated && user?.role === 'student';})()}
          studentId={user?.id}
          onRecommendationClick={(prof) => {
            setSelectedProfession(prof);
            setShowProfessionModal(true);
          }}
        />
      )}
    </div>
  );
}

export default HomePage;