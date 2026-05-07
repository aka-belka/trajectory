import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import User from './models/User';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import UserSession from'./models/UserSession'
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import ProfessionModal from './components/professions/ProfessionModal';
import ScrollToTop from './components/common/ScrollToTop';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [showProfessionModal, setShowProfessionModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedUserId = localStorage.getItem('userId');
    
    if (token && savedRole && savedUserId) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
      setUserId(parseInt(savedUserId));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, role, id) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', id);
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await UserSession.destroySession(token);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('Session destroy error:', err);
      }
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('redirectIntent');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
  };

  const handleTestRedirect = () => {
    localStorage.setItem('openTestAfterRedirect', 'true');
  };

  if (loading) {
    return <div className="loading-screen">Загрузка...</div>;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app">
        <Header 
          isAuthenticated={isAuthenticated} 
          userRole={userRole} 
          onLogout={handleLogout} 
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} />} />
            <Route 
              path="/auth" 
              element={
                isAuthenticated ? 
                <Navigate to="/" /> : 
                <AuthPage onLogin={handleLogin} onTestRedirect={handleTestRedirect}/>
              } 
            />
            <Route 
              path="/results" 
              element={
                isAuthenticated && userRole === 'student' ? 
                <ResultsPage userId={userId} /> : 
                <Navigate to="/auth" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                isAuthenticated ? 
                <ProfilePage userId={userId} userRole={userRole} onLogout={handleLogout} /> : 
                <Navigate to="/" />
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {showProfessionModal && selectedProfession && (
            <ProfessionModal
              profession={selectedProfession}
              onClose={() => setShowProfessionModal(false)}
              isStudent={(() => {return isAuthenticated && userRole === 'student';})()}
            />
          )}
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;