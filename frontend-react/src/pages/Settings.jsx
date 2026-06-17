import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getCurrentUser, updateUser } from '../api/auth';
import {
  User,
  Github,
  Linkedin,
  Code,
  Mail,
  Phone,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Settings() {
  const setUser = useAuthStore(state => state.setUser);
  const user = useAuthStore(state => state.user);
  const [formData, setFormData] = useState({
    github_url: '',
    github_token: '',
    linkedin_id: '',
    leetcode_id: '',
    gmail: '',
    mobile_number: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchUserData = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setFormData({
        github_url: userData.github_url || '',
        github_token: '',
        linkedin_id: userData.linkedin_id || '',
        leetcode_id: userData.leetcode_id || '',
        gmail: userData.gmail || '',
        mobile_number: userData.mobile_number || ''
      });
    } catch {
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = { ...formData };
      if (!updateData.github_token) {
        delete updateData.github_token;
      }

      const updatedUser = await updateUser(updateData);
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      setFormData(prev => ({ ...prev, github_token: '' }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to update settings'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and profile information</p>
      </div>

      {message.text && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl animate-fade-in-down ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={20} className="animate-bounce-in" />
          ) : (
            <AlertCircle size={20} />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Username
                  </div>
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Github size={16} />
                    GitHub URL
                  </div>
                </label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Github size={16} />
                    GitHub Personal Access Token
                  </div>
                </label>
                <input
                  type="password"
                  name="github_token"
                  value={formData.github_token}
                  onChange={handleChange}
                  placeholder="Leave empty to keep current token"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Generate at: GitHub Settings → Developer settings → Personal access tokens
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Linkedin size={16} />
                    LinkedIn ID
                  </div>
                </label>
                <input
                  type="text"
                  name="linkedin_id"
                  value={formData.linkedin_id}
                  onChange={handleChange}
                  placeholder="your-linkedin-id"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Code size={16} />
                    LeetCode ID
                  </div>
                </label>
                <input
                  type="text"
                  name="leetcode_id"
                  value={formData.leetcode_id}
                  onChange={handleChange}
                  placeholder="your-leetcode-id"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </div>
                </label>
                <input
                  type="email"
                  name="gmail"
                  value={formData.gmail}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    Mobile Number
                  </div>
                </label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
