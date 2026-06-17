import { User, FileText, Code2, Briefcase, GraduationCap, Award, FolderOpen, Plus, Trash2 } from 'lucide-react';
import SectionEditor from './SectionEditor';
import Button from '../ui/Button';

const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
const textareaClass = `${inputClass} resize-none`;

const PROFICIENCIES = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function ResumeForm({ data, onChange, className = '' }) {
  const updateField = (section, field, value, index) => {
    const updated = { ...data };
    if (index !== undefined) {
      updated[section] = [...(updated[section] || [])];
      updated[section][index] = { ...updated[section][index], [field]: value };
    } else {
      updated[section] = { ...(updated[section] || {}), [field]: value };
    }
    onChange(updated);
  };

  const addItem = (section, template) => {
    const updated = { ...data };
    updated[section] = [...(updated[section] || []), template];
    onChange(updated);
  };

  const removeItem = (section, index) => {
    const updated = { ...data };
    updated[section] = (updated[section] || []).filter((_, i) => i !== index);
    onChange(updated);
  };

  const personal = data.personal || {};
  const summary = data.summary || '';
  const skills = data.skills || [];
  const experience = data.experience || [];
  const education = data.education || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];

  return (
    <div className={`space-y-4 ${className}`}>
      <SectionEditor title="Personal Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Full Name" value={personal.name || ''} onChange={e => updateField('personal', 'name', e.target.value)} />
          <input className={inputClass} type="email" placeholder="Email" value={personal.email || ''} onChange={e => updateField('personal', 'email', e.target.value)} />
          <input className={inputClass} placeholder="Phone" value={personal.phone || ''} onChange={e => updateField('personal', 'phone', e.target.value)} />
          <input className={inputClass} placeholder="Location" value={personal.location || ''} onChange={e => updateField('personal', 'location', e.target.value)} />
          <input className={inputClass} placeholder="Website URL" value={personal.website || ''} onChange={e => updateField('personal', 'website', e.target.value)} />
          <input className={inputClass} placeholder="LinkedIn URL" value={personal.linkedin || ''} onChange={e => updateField('personal', 'linkedin', e.target.value)} />
        </div>
      </SectionEditor>

      <SectionEditor title="Professional Summary" icon={FileText}>
        <textarea
          className={textareaClass}
          rows={4}
          placeholder="Write a brief professional summary..."
          value={summary}
          onChange={e => onChange({ ...data, summary: e.target.value })}
        />
        <Button variant="secondary" size="sm" className="w-full">
          Enhance with AI
        </Button>
      </SectionEditor>

      <SectionEditor
        title="Skills"
        icon={Code2}
        onAdd={() => addItem('skills', { name: '', proficiency: 'intermediate', category: '' })}
        addLabel="Add Skill"
      >
        {skills.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">No skills added yet</p>
        ) : (
          skills.map((skill, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputClass} flex-1`} placeholder="Skill name" value={skill.name || ''} onChange={e => updateField('skills', 'name', e.target.value, i)} />
              <select className={`${inputClass} w-32`} value={skill.proficiency || 'intermediate'} onChange={e => updateField('skills', 'proficiency', e.target.value, i)}>
                {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={() => removeItem('skills', i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </SectionEditor>

      <SectionEditor
        title="Experience"
        icon={Briefcase}
        onAdd={() => addItem('experience', { company: '', position: '', startDate: '', endDate: '', description: '', highlights: [] })}
        addLabel="Add"
      >
        {experience.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">No experience added yet</p>
        ) : (
          experience.map((exp, i) => (
            <div key={i} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2 relative">
              <button onClick={() => removeItem('experience', i)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className={inputClass} placeholder="Company" value={exp.company || ''} onChange={e => updateField('experience', 'company', e.target.value, i)} />
                <input className={inputClass} placeholder="Position" value={exp.position || ''} onChange={e => updateField('experience', 'position', e.target.value, i)} />
                <input className={inputClass} type="month" placeholder="Start" value={exp.startDate || ''} onChange={e => updateField('experience', 'startDate', e.target.value, i)} />
                <input className={inputClass} type="month" placeholder="End" value={exp.endDate || ''} onChange={e => updateField('experience', 'endDate', e.target.value, i)} />
              </div>
              <textarea className={textareaClass} rows={2} placeholder="Description" value={exp.description || ''} onChange={e => updateField('experience', 'description', e.target.value, i)} />
            </div>
          ))
        )}
      </SectionEditor>

      <SectionEditor
        title="Education"
        icon={GraduationCap}
        onAdd={() => addItem('education', { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' })}
        addLabel="Add"
      >
        {education.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">No education added yet</p>
        ) : (
          education.map((edu, i) => (
            <div key={i} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2 relative">
              <button onClick={() => removeItem('education', i)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className={inputClass} placeholder="Institution" value={edu.institution || ''} onChange={e => updateField('education', 'institution', e.target.value, i)} />
                <input className={inputClass} placeholder="Degree" value={edu.degree || ''} onChange={e => updateField('education', 'degree', e.target.value, i)} />
                <input className={inputClass} placeholder="Field of Study" value={edu.field || ''} onChange={e => updateField('education', 'field', e.target.value, i)} />
                <input className={inputClass} placeholder="GPA" value={edu.gpa || ''} onChange={e => updateField('education', 'gpa', e.target.value, i)} />
                <input className={inputClass} type="month" placeholder="Start" value={edu.startDate || ''} onChange={e => updateField('education', 'startDate', e.target.value, i)} />
                <input className={inputClass} type="month" placeholder="End" value={edu.endDate || ''} onChange={e => updateField('education', 'endDate', e.target.value, i)} />
              </div>
            </div>
          ))
        )}
      </SectionEditor>

      <SectionEditor
        title="Certifications"
        icon={Award}
        onAdd={() => addItem('certifications', { name: '', issuer: '', date: '', url: '' })}
        addLabel="Add"
      >
        {certifications.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">No certifications added yet</p>
        ) : (
          certifications.map((cert, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputClass} flex-1`} placeholder="Certification name" value={cert.name || ''} onChange={e => updateField('certifications', 'name', e.target.value, i)} />
              <input className={`${inputClass} w-32`} placeholder="Issuer" value={cert.issuer || ''} onChange={e => updateField('certifications', 'issuer', e.target.value, i)} />
              <button onClick={() => removeItem('certifications', i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </SectionEditor>

      <SectionEditor
        title="Projects"
        icon={FolderOpen}
        onAdd={() => addItem('projects', { name: '', description: '', technologies: '', link: '' })}
        addLabel="Add"
      >
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">No projects added yet</p>
        ) : (
          projects.map((proj, i) => (
            <div key={i} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2 relative">
              <button onClick={() => removeItem('projects', i)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className={inputClass} placeholder="Project name" value={proj.name || ''} onChange={e => updateField('projects', 'name', e.target.value, i)} />
                <input className={inputClass} placeholder="Technologies" value={proj.technologies || ''} onChange={e => updateField('projects', 'technologies', e.target.value, i)} />
              </div>
              <textarea className={textareaClass} rows={2} placeholder="Description" value={proj.description || ''} onChange={e => updateField('projects', 'description', e.target.value, i)} />
              <input className={inputClass} placeholder="Link URL" value={proj.link || ''} onChange={e => updateField('projects', 'link', e.target.value, i)} />
            </div>
          ))
        )}
      </SectionEditor>
    </div>
  );
}
