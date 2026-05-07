import { useState, useEffect } from 'react';
import Student from '../../models/Student';
import TestModal from '../test/TestModal';
import ResultsTab from './ResultsTab';
import FavoritesTab from './FavoritesTab';
import ParentTab from './ParentTab';
import SettingsTab from './SettingsTab';
import './StudentDashboard.css';

function StudentDashboard({ userId, onLogout }) {
  const [activeTab, setActiveTab] = useState('results');
  const [student, setStudent] = useState(null);
  const [studentName, setStudentName] = useState('');  
  const [studentGrade, setStudentGrade] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadStudent();
  }, [userId]);

  const handleOpenTest = () => {
    setIsTestModalOpen(true);
  };
  

  const loadStudent = async () => {
    setLoading(true);
    try {
      const studentInstance = await Student.findById(userId);
      setStudent(studentInstance);
      setStudentName(studentInstance.getFullName()); 
      setStudentGrade(studentInstance.getGrade());
    } catch (err) {
      console.error('Load student error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStudentInfo = (data) => {
    if (data.fullName) {
      setStudentName(data.fullName);
      if (student) student.setFullName(data.fullName);
    }
    if (data.grade) {
      setStudentGrade(data.grade);
      if (student) student.setGrade(data.grade);
    }
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = {
    results: { label: 'Мои результаты', component: <ResultsTab student={student} refreshTrigger={refreshTrigger} onContinueTest={handleOpenTest} /> },
    favorites: { label: 'Избранное', component: <FavoritesTab student={student} refreshTrigger={refreshTrigger} onRefresh={refreshData} userId={userId}/> },
    parent: { label: 'Родитель', component: <ParentTab student={student} onRefresh={refreshData} /> },
    settings: { label: 'Настройки', component: <SettingsTab student={student} onRefresh={updateStudentInfo} onLogout={onLogout} /> }
  };

  if (loading) {
    return <div className="dashboard-loading">Загрузка данных...</div>;
  }

  if (!student) {
    return <div className="dashboard-error">Не удалось загрузить данные пользователя</div>;
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Личный кабинет</h1>
        <p className="student-name">{studentName}, {studentGrade} класс</p>
      </div>

      <div className="dashboard-tabs">
        {Object.entries(tabs).map(([key, { label }]) => (
          <button
            key={key}
            className={`tab-btn ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {tabs[activeTab].component}
      </div>

      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        studentId={userId}
      />
    </div>
  );
}

export default StudentDashboard;