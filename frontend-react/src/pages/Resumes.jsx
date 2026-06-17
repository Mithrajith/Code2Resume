import { useState, useEffect } from 'react';
import { listResumes, downloadResume, deleteResume } from '../api/resume';
import { downloadFile } from '../utils/helpers';
import { FileText, Download, Trash2, Loader2 } from 'lucide-react';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await listResumes();
      setResumes(data);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    setDownloading(filename);
    try {
      const blob = await downloadResume(filename);
      downloadFile(blob, filename);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download resume');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    setDeleting(filename);
    try {
      await deleteResume(filename);
      setResumes(resumes.filter(r => r.filename !== filename));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete resume');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
        <p className="text-gray-600 mt-1">View and download your generated resumes</p>
      </div>

      {resumes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Resumes Yet</h3>
          <p className="text-gray-500">
            Go to the Dashboard and chat with the AI to generate your first resume
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.filename}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <FileText size={40} className="text-blue-600" />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 truncate">
                {resume.filename}
              </h3>
              
              <p className="text-sm text-gray-500 mb-4">
                {resume.created_at || 'Recent'}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(resume.filename)}
                  disabled={downloading === resume.filename}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {downloading === resume.filename ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  Download
                </button>
                
                <button
                  onClick={() => handleDelete(resume.filename)}
                  disabled={deleting === resume.filename}
                  className="flex items-center justify-center bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting === resume.filename ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
