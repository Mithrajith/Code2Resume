import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(formData);
      setAuth(response.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-blue-600 to-cyan-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 animate-fade-in">
            <Sparkles size={40} />
          </div>
          <h1 className="text-4xl font-bold mb-4 animate-fade-in-up">Code2Resume</h1>
          <p className="text-xl text-white/80 text-center max-w-md animate-fade-in-up animate-stagger-1">
            Transform your GitHub profile into AI-powered, domain-specific resumes
          </p>

          <div className="mt-12 space-y-6 w-full max-w-sm">
            {[
              { icon: '🔍', title: 'Smart Analysis', desc: 'AI analyzes your repositories' },
              { icon: '🎯', title: 'Domain-Specific', desc: 'Tailored to your target role' },
              { icon: '🔒', title: 'Privacy First', desc: 'All processing happens locally' }
            ].map((feature, i) => (
              <div key={i} className={`flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all animate-fade-in-up animate-stagger-${i + 2}`}>
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-white/70">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Code2Resume
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1">Sign in to continue to your dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in-down">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Create account
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            Your data stays on your machine. Privacy guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
}
