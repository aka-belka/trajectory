import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import ScrollToTop from './components/common/ScrollToTop';
import './App.css';

function App() {
  const { isAuthenticated, user, loading, logout } = useAuth();  // 👈 БЕРЁМ ИЗ КОНТЕКСТА

  if (loading) {
    return <div className="loading-screen">Загрузка...</div>;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app">
        <Header 
          isAuthenticated={isAuthenticated} 
          userRole={user?.role} 
          onLogout={logout} 
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} />} />
            <Route 
              path="/auth" 
              element={
                isAuthenticated ? 
                <Navigate to="/" /> : 
                <AuthPage />
              } 
            />
            <Route 
              path="/results" 
              element={
                isAuthenticated && user?.role === 'student' ? 
                <ResultsPage userId={user?.id} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                isAuthenticated ? 
                <ProfilePage userId={user?.id} userRole={user?.role} onLogout={logout} /> : 
                <Navigate to="/" />
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;