import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Upload, FileText, ClipboardPaste, BarChart3, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import v2 from '../api/v2';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import ATSScoreDisplay from '../components/ats/ATSScoreDisplay';
import KeywordCoverage from '../components/ats/KeywordCoverage';
import OptimizationSuggestions from '../components/ats/OptimizationSuggestions';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function ATSAnalyzer() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [resumesRes, jobsRes, reportsRes] = await Promise.allSettled([
        v2.resumes.list(),
        v2.jobs.list(),
        v2.jobs.getATSReports(),
      ]);
      setResumes(resumesRes.status === 'fulfilled' ? (resumesRes.value?.data || []) : []);
      setJobs(jobsRes.status === 'fulfilled' ? (jobsRes.value?.data || []) : []);
      setReports(reportsRes.status === 'fulfilled' ? (reportsRes.value?.data || []) : []);
    } catch {
      setResumes([]);
      setJobs([]);
      setReports([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAnalyze = async () => {
    if (!selectedResumeId || !selectedJobId) {
      setError('Please select both a resume and a job description.');
      return;
    }
    setAnalyzing(true);
    setError('');
    setResults(null);
    try {
      const res = await v2.jobs.createATS({ resume_id: selectedResumeId, job_description_id: selectedJobId });
      const data = res?.data || res;
      const atsResult = {
        score: data.overall_score ?? data.score ?? 0,
        keywordsFound: data.keywords_found ?? 0,
        totalKeywords: data.total_keywords ?? 0,
        issues: data.formatting_issues?.length ?? data.issues ?? 0,
        suggestionCount: data.suggestions?.length ?? data.suggestion_count ?? 0,
        keywords: (data.keywords ?? data.missing_keywords ?? []).map(k => {
          if (typeof k === 'string') return { keyword: k, found: false, severity: 'medium' };
          return { keyword: k.keyword || k.name || k, found: k.found ?? !k.missing ?? false, severity: k.severity || 'medium' };
        }),
        healthCheckItems: (data.health_check ?? data.section_scores ?? []).map(h => {
          if (typeof h === 'object' && 'label' in h) return h;
          if (typeof h === 'string') return { label: h, passed: true };
          return { label: h.label || h.section || 'Check', passed: h.passed ?? (h.score ?? 0) >= 50 };
        }),
        formattingIssues: (data.formatting_issues ?? []).map(f => {
          if (typeof f === 'string') return { issue: f, severity: 'medium' };
          return { issue: f.issue || f.message || f, severity: f.severity || 'medium' };
        }),
        suggestions: (data.suggestions ?? []).map(s => {
          if (typeof s === 'string') return { title: s, description: '', priority: 'medium', category: 'General' };
          return { title: s.title || s.recommendation || s, description: s.description || '', priority: s.priority || 'medium', category: s.category || 'General' };
        }),
        breakdown: (data.section_scores ?? data.breakdown ?? []).map(b => {
          if (typeof b === 'object' && 'section' in b) return b;
          if (typeof b === 'string') return { section: b, score: 70 };
          return { section: b.section || b.category || 'Section', score: b.score ?? 70 };
        }),
      };
      setResults(atsResult);
      loadData();
    } catch {
      setError('Failed to run ATS analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileSearch className="w-6 h-6" />
                ATS Analyzer
              </h1>
              <p className="text-indigo-100 mt-1">Analyze your resume for ATS compatibility and optimization.</p>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !selectedResumeId || !selectedJobId}
              loading={analyzing}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <FileSearch className="w-4 h-4" />
              {analyzing ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {error && (
        <motion.div variants={item}>
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Select Resume
            </h3>
            {loadingData ? (
              <Skeleton variant="rectangular" height="60px" />
            ) : resumes.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Resumes Found"
                description="Create a resume first to run ATS analysis."
                actionLabel="Create Resume"
                onAction={() => window.location.href = '/resumes'}
              />
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a resume...</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.title || `Resume ${r.id}`}</option>
                ))}
              </select>
            )}
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-purple-600" />
              Select Job Description
            </h3>
            {loadingData ? (
              <Skeleton variant="rectangular" height="60px" />
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={FileSearch}
                title="No Job Descriptions Found"
                description="Add a job description first to run ATS analysis."
                actionLabel="Add Job Description"
                onAction={() => window.location.href = '/jobs'}
              />
            ) : (
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a job description...</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title || j.company || `Job ${j.id}`}</option>
                ))}
              </select>
            )}
          </Card>
        </motion.div>
      </div>

      {reports.length > 0 && !results && !analyzing && (
        <motion.div variants={item}>
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Previous ATS Reports
            </h3>
            <div className="space-y-2">
              {reports.map((r, i) => (
                <div key={r.id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    (r.overall_score ?? r.score ?? 0) >= 70 ? 'bg-green-100 dark:bg-green-900/30' : (r.overall_score ?? r.score ?? 0) >= 40 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <span className={`text-xs font-bold ${
                      (r.overall_score ?? r.score ?? 0) >= 70 ? 'text-green-600 dark:text-green-400' : (r.overall_score ?? r.score ?? 0) >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                    }`}>{r.overall_score ?? r.score ?? '—'}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {r.resume_title || `Resume ${r.resume_id}`} — {r.job_title || `Job ${r.job_description_id}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {analyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex items-center justify-center"><Skeleton variant="circular" width="200px" height="200px" /></Card>
          <Card className="space-y-4">
            <Skeleton variant="text" width="40%" />
            {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height="40px" />)}
          </Card>
          <Card className="space-y-4">
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="rectangular" height="150px" />
          </Card>
          <Card className="space-y-4">
            <Skeleton variant="text" width="60%" />
            {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height="60px" />)}
          </Card>
        </div>
      )}

      {!results && !analyzing && !loadingData && resumes.length === 0 && jobs.length === 0 && (
        <EmptyState
          icon={FileSearch}
          title="No Data Available"
          description="Create a resume and add a job description first to run ATS analysis."
          actionLabel="Go to Resumes"
          onAction={() => window.location.href = '/resumes'}
        />
      )}

      {!results && !analyzing && !loadingData && (resumes.length > 0 || jobs.length > 0) && (
        <EmptyState
          icon={FileSearch}
          title="No Analysis Yet"
          description="Select a resume and job description above, then click Analyze Resume."
        />
      )}

      {results && !analyzing && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          <motion.div variants={item}>
            <Card>
              <ATSScoreDisplay
                score={results.score}
                keywordsFound={results.keywordsFound}
                totalKeywords={results.totalKeywords}
                issues={results.issues}
                suggestions={results.suggestionCount}
              />
            </Card>
          </motion.div>

          {results.healthCheckItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={item}>
                <Card>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Resume Health Check
                  </h3>
                  <div className="space-y-2">
                    {results.healthCheckItems.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        {h.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${h.passed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {h.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {results.formattingIssues.length > 0 && (
                <motion.div variants={item}>
                  <Card>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Formatting Issues
                    </h3>
                    <div className="space-y-2">
                      {results.formattingIssues.map((fi, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-900"
                        >
                          <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            fi.severity === 'high' ? 'text-red-500' : fi.severity === 'medium' ? 'text-amber-500' : 'text-gray-400'
                          }`} />
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{fi.issue}</span>
                            <span className={`ml-2 text-[10px] font-bold uppercase ${
                              fi.severity === 'high' ? 'text-red-500' : fi.severity === 'medium' ? 'text-amber-500' : 'text-gray-400'
                            }`}>{fi.severity}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {results.keywords.length > 0 && (
            <motion.div variants={item}>
              <Card>
                <KeywordCoverage keywords={results.keywords} />
              </Card>
            </motion.div>
          )}

          {results.suggestions.length > 0 && (
            <motion.div variants={item}>
              <Card>
                <OptimizationSuggestions suggestions={results.suggestions} />
              </Card>
            </motion.div>
          )}

          {results.breakdown.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.keywords.length > 0 && (
                <motion.div variants={item}>
                  <Card>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      Keyword Coverage
                    </h3>
                    <div className="space-y-3">
                      {results.keywords.map((kw, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400 w-24 truncate">{kw.keyword}</span>
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: kw.found ? '100%' : '0%' }}
                              transition={{ duration: 0.6, delay: i * 0.03 }}
                              className={`h-full rounded-full ${kw.found ? 'bg-indigo-600' : 'bg-red-300 dark:bg-red-700'}`}
                            />
                          </div>
                          <span className={`text-[10px] font-medium ${kw.found ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                            {kw.found ? 'Found' : 'Missing'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              <motion.div variants={item}>
                <Card>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    ATS Breakdown
                  </h3>
                  <div className="space-y-4">
                    {results.breakdown.map((b, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{b.section}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{b.score}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${b.score}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={`h-full rounded-full ${
                              b.score >= 70 ? 'bg-green-500' : b.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
