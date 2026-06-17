import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getCurrentUser } from '../../api/auth';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Github,
  ChevronDown,
  Sparkles,
  Bot
} from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  const setUser = useAuthStore(state => state.setUser);
  const user = useAuthStore(state => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }, [setUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/resumes', label: 'Resumes', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Code2Resume
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(({ path, label, icon: NavIcon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                location.pathname === path
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {React.createElement(NavIcon, { size: 20 })}
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-gray-100">
          <div
            className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.github_url?.split('/').pop() || 'GitHub'}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </div>

          {/* User Dropdown */}
          {userMenuOpen && sidebarOpen && (
            <div className="mt-2 py-2 bg-white rounded-xl shadow-lg border border-gray-100">
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setUserMenuOpen(false)}
              >
                <Settings size={16} />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Code2Resume
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {navLinks.map(({ path, label, icon: NavIcon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {React.createElement(NavIcon, { size: 20 })}
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.username || 'User'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {navLinks.find(l => l.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Mithrajith/Code2Resume"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Github size={20} />
            </a>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
              <Bot size={16} />
              <span>AI Ready</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
