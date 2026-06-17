import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Header() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            Code2Resume
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
            
            <Link
              to="/resumes"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Resumes
            </Link>
            
            <Link
              to="/settings"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Settings
            </Link>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
