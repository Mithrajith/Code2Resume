import { useState, useEffect, useRef, useCallback } from 'react';
import { analyzeGithub, fetchUserRepos, getAnalysisStatus } from '../api/github';
import ChatBox from '../components/dashboard/ChatBox';
import RepoList from '../components/dashboard/RepoList';
import {
  RefreshCw,
  GitBranch,
  FileText,
  FolderGit2,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';

export default function Dashboard() {
  const [repos, setRepos] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysisJob, setAnalysisJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);

  useEffect(() => {
    loadRepos();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const loadRepos = async () => {
    try {
      const data = await fetchUserRepos();
      setRepos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load repos:', err);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGithub = async () => {
    setAnalyzing(true);
    setError('');
    setSuccess('');

    try {
      const result = await analyzeGithub();
      setAnalysisJob(result);

      if (result.job_id) {
        startPolling(result.job_id);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start analysis');
      setAnalyzing(false);
    }
  };

  const startPolling = useCallback((jobId) => {
    let attempts = 0;
    const maxAttempts = 120;

    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const data = await getAnalysisStatus(jobId);

        if (data.status === 'processing') {
          setAnalysisJob(data);
          attempts++;
          if (attempts >= maxAttempts) {
            clearInterval(pollingRef.current);
            setAnalyzing(false);
            setError('Analysis is taking longer than expected. Check back later.');
          }
        } else if (data.status === 'completed') {
          clearInterval(pollingRef.current);
          setSuccess(`Analysis complete! Analyzed ${data.result?.repos?.length || 0} repositories.`);
          setAnalyzing(false);
          await loadRepos();
        } else if (data.status === 'failed') {
          clearInterval(pollingRef.current);
          setError(data.error || 'Analysis failed');
          setAnalyzing(false);
        }
      } catch {
        clearInterval(pollingRef.current);
        setAnalyzing(false);
        setError('Failed to check analysis status');
      }
    }, 5000);
  }, []);

  const stats = [
    {
      label: 'Repositories',
      value: repos.length,
      icon: FolderGit2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Domains',
      value: [...new Set(repos.map(r => r.domain).filter(Boolean))].length,
      icon: GitBranch,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Tech Stack',
      value: [...new Set(repos.flatMap(r => {
        if (Array.isArray(r.tech_stack)) return r.tech_stack;
        if (typeof r.tech_stack === 'string') return r.tech_stack.split(',').map(t => t.trim());
        return [];
      }))].length,
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Status',
      value: analyzing ? 'Analyzing...' : 'Ready',
      icon: analyzing ? Clock : CheckCircle2,
      color: analyzing ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-green-500',
      bgColor: analyzing ? 'bg-amber-50' : 'bg-emerald-50',
      textColor: analyzing ? 'text-amber-600' : 'text-emerald-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your GitHub profile and generate resumes</p>
        </div>

        <button
          onClick={handleUpdateGithub}
          disabled={analyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-teal-500/25"
        >
          <RefreshCw size={18} className={analyzing ? 'animate-spin' : ''} />
          {analyzing ? 'Analyzing...' : 'Update from GitHub'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl animate-fade-in-down">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl animate-fade-in-down">
          <CheckCircle2 size={20} className="flex-shrink-0" />
          <p className="flex-1">{success}</p>
          <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
            <X size={16} />
          </button>
        </div>
      )}

      {analyzing && analysisJob && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <RefreshCw size={20} className="text-teal-600 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Analysis in Progress</p>
              <p className="text-sm text-gray-500">{analysisJob.progress || 'Starting...'}</p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-skeleton rounded-xl" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-8 w-16 bg-skeleton rounded" />
                <div className="h-4 w-20 bg-skeleton rounded" />
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={20} className={stat.textColor} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 animate-fade-in-up animate-stagger-3">
          <ChatBox />
        </div>
        <div className="lg:col-span-2 animate-fade-in-up animate-stagger-4">
          <RepoList repos={repos} />
        </div>
      </div>
    </div>
  );
}
