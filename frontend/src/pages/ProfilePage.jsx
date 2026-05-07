import StudentDashboard from '../components/student/StudentDashboard';
import ParentDashboard from '../components/parent/ParentDashboard';
import './ProfilePage.css';

function ProfilePage({ userId, userRole, onLogout }) {
  if (userRole === 'student') {
    return <StudentDashboard userId={userId} />;
  }
  
  if (userRole === 'parent') {
    return <ParentDashboard userId={userId} onLogout={onLogout} />;
  }
  
  return (
    <div className="profile-error">
      <h2>Неизвестная роль пользователя</h2>
      <p>Обратитесь к администратору</p>
    </div>
  );
}

export default ProfilePage;