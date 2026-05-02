import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import ScanPage from './pages/ScanPage';
import History from './pages/History';
import Learn from './pages/Learn';
import Settings from './pages/Settings';
import TestSandbox from './pages/TestSandbox';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './context/AuthProvider';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <Router>
      {user && <NavigationBar />}
      <div className={user ? "container mt-4 pb-5" : ""}>
        <Routes>
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/scan" replace />} />
          <Route path="/" element={<Navigate to="/scan" replace />} />
          <Route path="/dashboard" element={<Navigate to="/scan" replace />} />
          
          <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/sandbox" element={<ProtectedRoute><TestSandbox /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
