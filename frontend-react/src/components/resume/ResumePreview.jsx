import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1] || ''} ${year}`;
};

function SectionTitle({ children, template }) {
  const styles = {
    modern: 'text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1',
    professional: 'text-gray-900 dark:text-white uppercase tracking-wider border-l-4 border-gray-800 dark:border-gray-200 pl-3',
    startup: 'text-white bg-emerald-600 dark:bg-emerald-500 px-3 py-1 rounded-lg inline-block',
    minimal: 'text-gray-900 dark:text-white',
  };
  return <h2 className={`text-sm font-bold mb-2 ${styles[template] || styles.modern}`}>{children}</h2>;
}

function ModernTemplate({ personal, summary, skills, experience, education, certifications, projects }) {
  return (
    <div className="p-6 space-y-5">
      {personal.name && (
        <div className="text-center border-b border-gray-100 dark:border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{personal.name}</h1>
          <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
            {personal.email && <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Mail className="w-3 h-3" /> {personal.email}</span>}
            {personal.phone && <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Phone className="w-3 h-3" /> {personal.phone}</span>}
            {personal.location && <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><MapPin className="w-3 h-3" /> {personal.location}</span>}
            {personal.website && <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Globe className="w-3 h-3" /> {personal.website}</span>}
            {personal.linkedin && <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Linkedin className="w-3 h-3" /> LinkedIn</span>}
          </div>
        </div>
      )}
      {summary && (
        <div>
          <SectionTitle template="modern">Professional Summary</SectionTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{summary}</p>
        </div>
      )}
      {skills.length > 0 && (
        <div>
          <SectionTitle template="modern">Skills</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">{skill.name}</span>
            ))}
          </div>
        </div>
      )}
      {experience.length > 0 && (
        <div>
          <SectionTitle template="modern">Experience</SectionTitle>
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{exp.position || 'Position'}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{exp.company || 'Company'}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(exp.startDate)} – {formatDate(exp.endDate) || 'Present'}</span>
                </div>
                {exp.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {education.length > 0 && (
        <div>
          <SectionTitle template="modern">Education</SectionTitle>
          <div className="space-y-3">
            {education.map((edu, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{edu.institution || 'Institution'}</p>
                  {edu.gpa && <p className="text-xs text-gray-400 dark:text-gray-500">GPA: {edu.gpa}</p>}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {certifications.length > 0 && (
        <div>
          <SectionTitle template="modern">Certifications</SectionTitle>
          <div className="space-y-1">
            {certifications.map((cert, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white font-medium">{cert.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{cert.issuer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div>
          <SectionTitle template="modern">Projects</SectionTitle>
          <div className="space-y-3">
            {projects.map((proj, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{proj.name || 'Project'}</h3>
                {proj.technologies && <p className="text-xs text-indigo-600 dark:text-indigo-400">{proj.technologies}</p>}
                {proj.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{proj.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfessionalTemplate({ personal, summary, skills, experience, education, certifications, projects }) {
  return (
    <div className="p-6 space-y-5">
      {personal.name && (
        <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 -mx-6 -mt-6 px-6 py-4">
          <h1 className="text-2xl font-bold">{personal.name}</h1>
          <div className="flex items-center gap-4 mt-2 flex-wrap text-gray-200 dark:text-gray-600">
            {personal.email && <span className="inline-flex items-center gap-1 text-xs"><Mail className="w-3 h-3" /> {personal.email}</span>}
            {personal.phone && <span className="inline-flex items-center gap-1 text-xs"><Phone className="w-3 h-3" /> {personal.phone}</span>}
            {personal.location && <span className="inline-flex items-center gap-1 text-xs"><MapPin className="w-3 h-3" /> {personal.location}</span>}
            {personal.website && <span className="inline-flex items-center gap-1 text-xs"><Globe className="w-3 h-3" /> {personal.website}</span>}
            {personal.linkedin && <span className="inline-flex items-center gap-1 text-xs"><Linkedin className="w-3 h-3" /> LinkedIn</span>}
          </div>
        </div>
      )}
      {summary && (
        <div>
          <SectionTitle template="professional">Professional Summary</SectionTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-3">{summary}</p>
        </div>
      )}
      {skills.length > 0 && (
        <div>
          <SectionTitle template="professional">Skills</SectionTitle>
          <div className="pl-3 text-sm text-gray-600 dark:text-gray-300">
            {skills.map((s, i) => (
              <span key={i}>{s.name}{i < skills.length - 1 ? ', ' : ''}</span>
            ))}
          </div>
        </div>
      )}
      {experience.length > 0 && (
        <div>
          <SectionTitle template="professional">Experience</SectionTitle>
          <div className="space-y-3 pl-3">
            {experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{exp.position || 'Position'}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{exp.company || 'Company'}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(exp.startDate)} – {formatDate(exp.endDate) || 'Present'}</span>
                </div>
                {exp.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {education.length > 0 && (
        <div>
          <SectionTitle template="professional">Education</SectionTitle>
          <div className="space-y-3 pl-3">
            {education.map((edu, i) => (
              <div key={i} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{edu.institution || 'Institution'}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {certifications.length > 0 && (
        <div>
          <SectionTitle template="professional">Certifications</SectionTitle>
          <div className="space-y-1 pl-3">
            {certifications.map((cert, i) => (
              <div key={i} className="flex items-center justify-between border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                <span className="text-sm text-gray-900 dark:text-white font-medium">{cert.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{cert.issuer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div>
          <SectionTitle template="professional">Projects</SectionTitle>
          <div className="space-y-3 pl-3">
            {projects.map((proj, i) => (
              <div key={i} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{proj.name || 'Project'}</h3>
                {proj.technologies && <p className="text-xs text-gray-500 dark:text-gray-400">{proj.technologies}</p>}
                {proj.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{proj.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StartupTemplate({ personal, summary, skills, experience, education, certifications, projects }) {
  return (
    <div className="p-6 space-y-5">
      {personal.name && (
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl font-bold flex-shrink-0">
            {personal.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{personal.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-500 dark:text-gray-400">
              {personal.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {personal.email}</span>}
              {personal.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {personal.phone}</span>}
              {personal.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {personal.location}</span>}
            </div>
          </div>
        </div>
      )}
      {summary && (
        <div>
          <SectionTitle template="startup">About Me</SectionTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{summary}</p>
        </div>
      )}
      {skills.length > 0 && (
        <div>
          <SectionTitle template="startup">Skills</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {skills.map((skill, i) => (
              <div key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300">
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      )}
      {experience.length > 0 && (
        <div>
          <SectionTitle template="startup">Experience</SectionTitle>
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{exp.position || 'Position'}</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{exp.company || 'Company'}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(exp.startDate)} – {formatDate(exp.endDate) || 'Present'}</span>
                </div>
                {exp.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {education.length > 0 && (
        <div>
          <SectionTitle template="startup">Education</SectionTitle>
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{edu.institution || 'Institution'}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {certifications.length > 0 && (
        <div>
          <SectionTitle template="startup">Certifications</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, i) => (
              <div key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{cert.name}</span>
                {cert.issuer && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">· {cert.issuer}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div>
          <SectionTitle template="startup">Projects</SectionTitle>
          <div className="grid grid-cols-1 gap-3">
            {projects.map((proj, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{proj.name || 'Project'}</h3>
                {proj.technologies && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{proj.technologies}</p>}
                {proj.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{proj.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MinimalTemplate({ personal, summary, skills, experience, education, certifications, projects }) {
  return (
    <div className="p-6 space-y-5">
      {personal.name && (
        <div className="text-center pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{personal.name}</h1>
          <div className="flex items-center justify-center gap-3 mt-2 flex-wrap text-xs text-gray-400 dark:text-gray-500">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>· {personal.phone}</span>}
            {personal.location && <span>· {personal.location}</span>}
            {personal.website && <span>· {personal.website}</span>}
          </div>
        </div>
      )}
      {summary && (
        <div>
          <SectionTitle template="minimal">Summary</SectionTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{summary}</p>
        </div>
      )}
      {skills.length > 0 && (
        <div>
          <SectionTitle template="minimal">Skills</SectionTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {skills.map((s, i) => (
              <span key={i}>{s.name}{i < skills.length - 1 ? ' · ' : ''}</span>
            ))}
          </p>
        </div>
      )}
      {experience.length > 0 && (
        <div>
          <SectionTitle template="minimal">Experience</SectionTitle>
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{exp.position || 'Position'}, {exp.company || 'Company'}</h3>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(exp.startDate)} – {formatDate(exp.endDate) || 'Present'}</span>
                </div>
                {exp.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {education.length > 0 && (
        <div>
          <SectionTitle template="minimal">Education</SectionTitle>
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}, {edu.institution || 'Institution'}</h3>
                  {edu.gpa && <p className="text-xs text-gray-400 dark:text-gray-500">GPA: {edu.gpa}</p>}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {certifications.length > 0 && (
        <div>
          <SectionTitle template="minimal">Certifications</SectionTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {certifications.map((cert, i) => (
              <span key={i}>{cert.name}{cert.issuer ? ` (${cert.issuer})` : ''}{i < certifications.length - 1 ? ' · ' : ''}</span>
            ))}
          </p>
        </div>
      )}
      {projects.length > 0 && (
        <div>
          <SectionTitle template="minimal">Projects</SectionTitle>
          <div className="space-y-2">
            {projects.map((proj, i) => (
              <div key={i}>
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{proj.name || 'Project'}</h3>
                  {proj.technologies && <span className="text-xs text-gray-400 dark:text-gray-500">{proj.technologies}</span>}
                </div>
                {proj.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{proj.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const templates = { modern: ModernTemplate, professional: ProfessionalTemplate, startup: StartupTemplate, minimal: MinimalTemplate };

const bgStyles = {
  modern: 'bg-white dark:bg-slate-800',
  professional: 'bg-white dark:bg-slate-800',
  startup: 'bg-white dark:bg-slate-800',
  minimal: 'bg-white dark:bg-slate-800',
};

export default function ResumePreview({ data = {}, template = 'modern', className = '' }) {
  const personal = data.personal || {};
  const summary = data.summary || '';
  const skills = data.skills || [];
  const experience = data.experience || [];
  const education = data.education || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];

  const hasData = personal.name || summary || skills.length || experience.length || education.length;

  if (!hasData) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[400px] bg-gray-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">Start filling in the form to see a live preview</p>
        </div>
      </div>
    );
  }

  const TemplateComponent = templates[template] || templates.modern;
  const sharedProps = { personal, summary, skills, experience, education, certifications, projects };

  return (
    <div className={`${bgStyles[template] || bgStyles.modern} rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      <TemplateComponent {...sharedProps} />
    </div>
  );
}
