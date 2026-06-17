import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Eye, EyeOff, Loader2, Check, Github } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    github_url: '',
    github_token: '',
    linkedin_id: '',
    leetcode_id: '',
    gmail: '',
    mobile_number: ''
  });
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
      const response = await registerUser(formData);
      setAuth(response.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (formData.username && formData.password && formData.github_url && formData.github_token) {
      setStep(2);
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
            Join developers who use AI to create professional resumes from their GitHub profiles
          </p>

          <div className="mt-12 space-y-4 w-full max-w-sm">
            {[
              'Automatically analyze GitHub repos',
              'AI-powered domain classification',
              'Generate LaTeX resumes instantly',
              'Chat with AI about your projects',
              'Fine-tune on your own data'
            ].map((feature, i) => (
              <div key={i} className={`flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all animate-fade-in-up animate-stagger-${i + 2}`}>
                <Check size={18} className="text-green-300 flex-shrink-0" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-auto">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Code2Resume
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="text-gray-500 mt-1">Start generating AI-powered resumes</p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step >= s
                        ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {step > s ? <Check size={16} /> : s}
                  </div>
                  <span className={`text-sm ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {s === 1 ? 'Account' : 'Optional'}
                  </span>
                  {s < 2 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in-down">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <div className="animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="johndoe"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Github size={16} />
                        GitHub URL *
                      </div>
                    </label>
                    <input
                      type="url"
                      name="github_url"
                      placeholder="https://github.com/username"
                      value={formData.github_url}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Github size={16} />
                        GitHub Personal Access Token *
                      </div>
                    </label>
                    <input
                      type="password"
                      name="github_token"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={formData.github_token}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Generate at: GitHub Settings → Developer settings → Personal access tokens
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.username || !formData.password || !formData.github_url || !formData.github_token}
                    className="w-full mt-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-teal-500/25"
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <p className="text-sm text-gray-500 mb-4">
                    Optional: Add more details to enhance your resume
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        LinkedIn ID
                      </label>
                      <input
                        type="text"
                        name="linkedin_id"
                        placeholder="your-linkedin-id"
                        value={formData.linkedin_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        LeetCode ID
                      </label>
                      <input
                        type="text"
                        name="leetcode_id"
                        placeholder="your-leetcode-id"
                        value={formData.leetcode_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="gmail"
                        placeholder="you@example.com"
                        value={formData.gmail}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        name="mobile_number"
                        placeholder="+1234567890"
                        value={formData.mobile_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 mt-2"
                  >
                    Skip for now
                  </button>
                </div>
              )}
            </form>

            <p className="mt-6 text-center text-gray-500">
              Already have an account?{' '}
              <Link
                to="/"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
