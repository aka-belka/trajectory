import { useState, useRef, useEffect } from 'react';
import TestModal from '../components/test/TestModal';
import Student from '../models/Student';
import ProfessionModal from '../components/professions/ProfessionModal';
import Profession from '../models/Profession';
import UserSession from '../models/UserSession'; 
import { useAuth } from '../contexts/AuthContext'; 
import { getAllTypes, getTypeExamples } from '../constants/professionTypes';
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

import teacherBackImg from '../assets/images/teacher-back.jpg';
import engineerBackImg from '../assets/images/engineer-back.jpg';
import designerBackImg from '../assets/images/designer-back.jpg';
import analystBackImg from '../assets/images/analyst-back.png';
import doctorBackImg from '../assets/images/doctor-back.jpg';
import programmerBackImg from '../assets/images/programmer-back.jpg';

import arrowImg from '../assets/images/arrow.png';
import trajectoryImg from '../assets/images/trajectory.svg';
import trajectory2Img from '../assets/images/trajectory2.svg';
import airplaneImg from '../assets/images/airplane.png';
import locationImg from '../assets/images/location.png';

import natureImg from '../assets/images/nature.png';
import technicsImg from '../assets/images/technics.png';
import humanImg from '../assets/images/human.png';
import signImg from '../assets/images/sign.png';
import artImg from '../assets/images/art.png';

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

  const imageMap = {
    'nature.png': natureImg,
    'technics.png': technicsImg,
    'human.png': humanImg,
    'sign.png': signImg,
    'art.png': artImg
  };
  const backgroundImages = {
    'Программист': programmerBackImg,
    'Врач': doctorBackImg,
    'Дизайнер интерьеров': designerBackImg,
    'Аналитик данных': analystBackImg,
    'Учитель': teacherBackImg,
    'Инженер-конструктор': engineerBackImg
  };
  const professionTypesList = getAllTypes();
  const professionTypesListWithImages = professionTypesList.map(type => ({
    ...type,
    image: imageMap[type.image]
  }));

  const [activeTypeIndex, setActiveTypeIndex] = useState(0);
  const sliderRef = useRef(null);


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
    } else {
      setHasUnfinishedTest(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || professionTypesListWithImages.length === 0) return;

    let scrollTimeout;
    
    const updateActiveIndex = () => {
      const cards = slider.querySelectorAll('.type-card');
      const sliderRect = slider.getBoundingClientRect();
      const center = sliderRect.left + sliderRect.width / 2;
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      cards.forEach((card, idx) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(center - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });
      
      setActiveTypeIndex(closestIndex);
    };
    
  slider.addEventListener('scroll', updateActiveIndex);
  updateActiveIndex();
  
  return () => slider.removeEventListener('scroll', updateActiveIndex);
  }, [professionTypesListWithImages.length]);
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

  const handleCloseTestModal = () => {
    setIsTestModalOpen(false);
    checkUnfinishedTest();
  };

  const popularProfessions = [
    'Программист', 'Врач', 'Дизайнер интерьеров', 'Аналитик данных', 'Учитель', 'Инженер-конструктор'
  ];

  const professionImages = {
    'Программист': programmerImg,
    'Врач': doctorImg,
    'Дизайнер интерьеров': designerImg,
    'Аналитик данных': analystImg,
    'Учитель': teacherImg,
    'Инженер-конструктор': engineerImg
  };

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
              ТРАЕК
              ТОРИЯ
              </h1>
            <p className="hero-subtitle">Бесплатный тест по методике Е.А. Климова помогает определить профессиональные склонности ученика</p>
          </div>
          <div className="hero-parent-visual">
            <div className="hero-image-container">
              {heroImages.map((image, idx) => (
                <img key={idx} src={image.src} alt={image.alt} className={`hero-slide-image ${idx === currentImageIndex ? 'active' : ''}`} />
              ))}
              <div className="hero-image-label">{heroImages[currentImageIndex].title}</div>
            </div>
            <div className="trajectory-line"><img src={trajectoryImg} className="trajectory" alt="траектория" /></div>
            <img src={airplaneImg} className="airpl" alt="самолёт" />
          </div>
        </section>

        <section className="info-section">
          <h2 className="section-title">Что даёт тест?</h2>
          <div className="info-grid">
            <div className="info-grid-card"><div className="info-card"><h3>Определяет тип профессий</h3><p>Тест выявляет доминирующий тип профессий из пяти возможных по методике Климова</p></div></div>
            <div className="info-grid-card"><div className="info-card"><h3>Даёт список профессий</h3><p>На основе результатов теста формируется список рекомендуемых профессий</p></div></div>
            <div className="info-grid-card"><div className="info-card"><h3>Помогает родителям</h3><p>Вы можете отслеживать прогресс ребёнка и оставлять комментарии к профессиям</p></div></div>
          </div>
          <div className="trajectory-line tl2"><img src={trajectory2Img} className="tr2" alt="траектория" /></div>
          <img src={airplaneImg} className="airpl a2" alt="самолёт" />
        </section>

        <section className="profession-types">
          <div className="types-container">
            <div className="types-header">
              <h2 className="section-title">5 типов профессий</h2>
            </div>
            <div className="types-slider" ref={sliderRef}>
              {professionTypesListWithImages.map((type, idx) => (
                <div 
                  key={type.code} 
                  className={`type-card ${idx === activeTypeIndex ? 'active' : ''}`}
                >
                  <div className="type-content">
                    <div>
                      <h3 className="type-name">{type.fullName}</h3>
                      <p className="type-description">{type.shortDescription}</p>
                      <div className="type-professions-list">
                        {type.examples.split(', ').map(professionName => (
                          <span key={professionName} className="type-profession-item" onClick={() => handleOpenProfessionModal(professionName.trim())}>
                            {professionName.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="slider-counter">{String(idx + 1).padStart(2, '0')} / {String(professionTypesListWithImages.length).padStart(2, '0')}</div>
                  </div>
                  <div className="type-image-wrapper">
                    <div className="type-image"><img src={type.image} alt={type.fullName} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="popular-professions">
          <div className="popular-grid">
            {popularProfessions.map((prof, index) => (
              <div key={prof} className={`popular-card ${index % 2 === 0 ? 'left-layout' : 'right-layout'}`}>
                  <img src={backgroundImages[prof]} alt="" className="popular-bg-image" />
                  <div className="popular-badge">
                    <span className="popular-badge-text">Популярные профессии</span>
                  </div>
                  
                  <div className="popular-text-side">
                    <h3 className="popular-name">{prof}</h3>
                    <p className="popular-description">
                      {prof === 'Программист' && 'Создаёт код, разрабатывает сайты, приложения и программы. Превращает идеи в работающие цифровые продукты.'}
                      {prof === 'Врач' && 'Диагностирует, лечит и предотвращает заболевания, помогает людям сохранять здоровье и качество жизни.'}
                      {prof === 'Дизайнер интерьеров' && 'Создаёт удобные и красивые интерьеры, сочетая функциональность и эстетику.'}
                      {prof === 'Аналитик данных' && 'Превращает данные в ценные инсайты, помогает бизнесу принимать решения.'}
                      {prof === 'Учитель' && 'Передаёт знания, вдохновляет учеников, формирует будущее поколение.'}
                      {prof === 'Инженер-конструктор' && 'Проектирует здания, мосты, машины и технические системы.'}
                    </p>
                    <button className="details-btn" onClick={() => handleOpenProfessionModal(prof)}>
                      Узнать больше →
                    </button>
                  </div>
                
                <div className="popular-image-side">
                  <img src={professionImages[prof]} alt={prof} className="popular-image" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {showProfessionModal && selectedProfession && (
          <ProfessionModal profession={selectedProfession} onClose={() => setShowProfessionModal(false)} isStudent={isAuthenticated && user?.role === 'student'} onRecommendationClick={(prof) => { setSelectedProfession(prof); setShowProfessionModal(true); }} />
        )}
      </div>
    );
  }

  return (
    <div className="homepage">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            ТРАЕК
            ТОРИЯ
          </h1>
          <p className="hero-editorial-text">Бесплатный профориентационный тест по методике Е.А. Климова для школьников 5–11 классов</p>
          <button className="cta-button" onClick={handleStartTest}>
            {hasUnfinishedTest ? '▶ Продолжить тест' : 'Пройти тест'}
            <img src={arrowImg} className="icon-start" alt="→" />
          </button>
          {hasUnfinishedTest && 
            <p className="unfinished-hint">У вас есть незавершённый тест. Продолжите с того места, где остановились</p>
          }
        </div>
        <div className="hero-visual">
          <div className="hero-image-container">
            {heroImages.map((image, idx) => (
              <img key={idx} src={image.src} alt={image.alt} className={`hero-slide-image ${idx === currentImageIndex ? 'active' : ''}`} />
            ))}
            <div className="hero-image-label">{heroImages[currentImageIndex].title}</div>
          </div>
          <div className="trajectory-line"><img src={trajectoryImg} className="trajectory" alt="траектория" /></div>
          <img src={airplaneImg} className="airpl" alt="самолёт" />
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title"><div>Как это</div><div>работает?</div></h2>
        <div className="steps">
          <div className="step"><div className="step-number">1</div><div className="step-content"><h3 className="step-title">Пройдите тест</h3><p className="step-description">Ответьте на 20 простых вопросов о ваших предпочтениях</p></div></div>
          <div className="step"><div className="step-number">2</div><div className="step-content"><h3 className="step-title">Получите результат</h3><p className="step-description">Узнайте свой доминирующий тип профессий</p></div></div>
          <div className="step"><div className="step-number">3</div><div className="step-content"><h3 className="step-title">Выберите профессию</h3><p className="step-description">Изучите подходящие профессии и добавьте в избранное</p></div></div>
        </div>
        <div className="trajectory-line tl2"><img src={trajectory2Img} className="tr2" alt="траектория" /></div>
        <img src={airplaneImg} className="airpl a2" alt="самолёт" />
        <img src={locationImg} className="location" alt="местоположение" />
        <img src={locationImg} className="location loc-two" alt="местоположение" />
        <img src={locationImg} className="location loc-three" alt="местоположение" />
      </section>

      <section className="profession-types">
        <div className="types-container">
          <div className="types-header">
            <h2 className="section-title">5 типов профессий</h2>
          </div>
          <div className="types-slider" ref={sliderRef}>
            {professionTypesListWithImages.map((type, idx) => (
              <div 
                key={type.code} 
                className={`type-card ${idx === activeTypeIndex ? 'active' : ''}`}
              >
                <div className="type-content">
                  <div>
                    <h3 className="type-name">{type.fullName}</h3>
                    <p className="type-description">{type.shortDescription}</p>
                    <div className="type-professions-list">
                      {type.examples.split(', ').map(professionName => (
                        <span key={professionName} className="type-profession-item" onClick={() => handleOpenProfessionModal(professionName.trim())}>
                          {professionName.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="slider-counter">{String(idx + 1).padStart(2, '0')} / {String(professionTypesListWithImages.length).padStart(2, '0')}</div>
                </div>
                <div className="type-image-wrapper">
                  <div className="type-image"><img src={type.image} alt={type.fullName} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="popular-professions">
        <div className="popular-grid">
          {popularProfessions.map((prof, index) => (
            <div 
              key={prof} 
              className={`popular-card ${index % 2 === 0 ? 'left-layout' : 'right-layout'}`}
            >
                <img src={backgroundImages[prof]} alt="" className="popular-bg-image" />
                <div className="popular-badge">
                  <span className="popular-badge-text">Популярные профессии</span>
                </div>
                
                <div className="popular-text-side">
                  <h3 className="popular-name">{prof}</h3>
                  <p className="popular-description">
                    {prof === 'Программист' && 'Создаёт код, разрабатывает сайты, приложения и программы. Превращает идеи в работающие цифровые продукты.'}
                    {prof === 'Врач' && 'Диагностирует, лечит и предотвращает заболевания, помогает людям сохранять здоровье и качество жизни.'}
                    {prof === 'Дизайнер интерьеров' && 'Создаёт удобные и красивые интерьеры, сочетая функциональность и эстетику.'}
                    {prof === 'Аналитик данных' && 'Превращает данные в ценные инсайты, помогает бизнесу принимать решения.'}
                    {prof === 'Учитель' && 'Передаёт знания, вдохновляет учеников, формирует будущее поколение.'}
                    {prof === 'Инженер-конструктор' && 'Проектирует здания, мосты, машины и технические системы.'}
                  </p>
                  <button className="details-btn" onClick={() => handleOpenProfessionModal(prof)}>
                    Узнать больше →
                  </button>
                </div>
              
              <div className="popular-image-side">
                <img src={professionImages[prof]} alt={prof} className="popular-image" />
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {isTestModalOpen && <TestModal isOpen={isTestModalOpen} onClose={handleCloseTestModal} studentId={user?.id} />}
      {showProfessionModal && selectedProfession && (
        <ProfessionModal profession={selectedProfession} onClose={() => setShowProfessionModal(false)} isStudent={isAuthenticated && user?.role === 'student'} studentId={user?.id} onRecommendationClick={(prof) => { setSelectedProfession(prof); setShowProfessionModal(true); }} />
      )}
    </div>
  );
}

export default HomePage;