import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Resumes from './pages/Resumes';
import Layout from './components/layout/Layout';

function PrivateRoute({ children }) {
  const token = useAuthStore(state => state.token);
  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/settings" element={
          <PrivateRoute>
            <Layout><Settings /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/resumes" element={
          <PrivateRoute>
            <Layout><Resumes /></Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
