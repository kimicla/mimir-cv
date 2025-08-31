import React, { useState, useCallback } from 'react';
import type { ResumeData, Experience, Education } from '../types';
import { SparklesIcon, PlusIcon, TrashIcon } from './icons';
import { refineTextWithAI } from '../services/geminiService';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

// FIX: Added optional `name` prop to InputField to pass to the underlying input element.
const InputField: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  name?: string;
}> = ({ label, id, value, onChange, placeholder, type = "text", name }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      name={name}
      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

// FIX: Added optional `name` prop to TextAreaWithAI to fix a bug in handleExperienceChange.
const TextAreaWithAI: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRefine: () => Promise<void>;
  placeholder?: string;
  rows?: number;
  name?: string;
}> = ({ label, id, value, onChange, onRefine, placeholder, rows = 4, name }) => {
  const [isRefining, setIsRefining] = useState(false);

  const handleRefineClick = async () => {
    setIsRefining(true);
    await onRefine();
    setIsRefining(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
        <button
          onClick={handleRefineClick}
          disabled={isRefining || !value}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRefining ? (
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SparklesIcon className="w-4 h-4" />
          )}
          {isRefining ? 'Refining...' : 'Refine with AI'}
        </button>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        name={name}
        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );
};


const AccordionSection: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void }> = ({ title, children, isOpen, onToggle }) => (
    <div className="border-b border-slate-200">
        <button onClick={onToggle} className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        {isOpen && <div className="p-4 bg-white space-y-4">{children}</div>}
    </div>
);

export const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData }) => {
    const [openSection, setOpenSection] = useState<string | null>('personal');

    const handleToggle = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };
  
    const handlePersonalInfoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [id]: value } }));
    }, [setResumeData]);

    const handleSummaryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResumeData(prev => ({ ...prev, summary: e.target.value }));
    }, [setResumeData]);

    const refineSummary = useCallback(async () => {
        const prompt = `Based on the following resume data, write a professional and compelling summary of 2-4 sentences. Focus on key achievements and skills.\n\nExperience: ${resumeData.experience.map(exp => `${exp.jobTitle} at ${exp.company}: ${exp.description}`).join('\n')}\n\nSkills: ${resumeData.skills.join(', ')}`;
        const refinedSummary = await refineTextWithAI(resumeData.summary || "A motivated professional", prompt);
        setResumeData(prev => ({ ...prev, summary: refinedSummary }));
    }, [resumeData.experience, resumeData.skills, resumeData.summary, setResumeData]);

    const handleExperienceChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newExperience = [...resumeData.experience];
        newExperience[index] = { ...newExperience[index], [name]: value };
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    }, [resumeData.experience, setResumeData]);
    
    const refineExperienceDescription = useCallback(async (index: number) => {
        const exp = resumeData.experience[index];
        if (!exp) return;
        const prompt = "Rewrite the following resume description to be more impactful. Use action verbs, focus on quantifiable achievements, and list as bullet points (using '- ').";
        const refinedDescription = await refineTextWithAI(exp.description, prompt);
        const newExperience = [...resumeData.experience];
        newExperience[index] = { ...newExperience[index], description: refinedDescription };
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    }, [resumeData.experience, setResumeData]);

    const addExperience = useCallback(() => {
        const newExperience: Experience = { id: Date.now().toString(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' };
        setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExperience] }));
    }, [setResumeData]);

    const removeExperience = useCallback((index: number) => {
        const newExperience = resumeData.experience.filter((_, i) => i !== index);
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    }, [resumeData.experience, setResumeData]);

    const handleEducationChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newEducation = [...resumeData.education];
        newEducation[index] = { ...newEducation[index], [name]: value };
        setResumeData(prev => ({ ...prev, education: newEducation }));
    }, [resumeData.education, setResumeData]);

    const addEducation = useCallback(() => {
        const newEducation: Education = { id: Date.now().toString(), degree: '', school: '', location: '', graduationDate: '' };
        setResumeData(prev => ({ ...prev, education: [...prev.education, newEducation] }));
    }, [setResumeData]);

    const removeEducation = useCallback((index: number) => {
        const newEducation = resumeData.education.filter((_, i) => i !== index);
        setResumeData(prev => ({ ...prev, education: newEducation }));
    }, [resumeData.education, setResumeData]);
    
    const handleSkillsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const skillsArray = e.target.value.split(',').map(skill => skill.trim());
        setResumeData(prev => ({ ...prev, skills: skillsArray }));
    }, [setResumeData]);
    
    const refineSkills = useCallback(async () => {
        const prompt = `Based on the following resume experience, suggest a comma-separated list of 10-15 relevant hard and soft skills. Do not add any introductory text. \n\nExperience: ${resumeData.experience.map(exp => `${exp.jobTitle}: ${exp.description}`).join('\n')}`;
        const refinedSkills = await refineTextWithAI(resumeData.skills.join(', '), prompt);
        setResumeData(prev => ({ ...prev, skills: refinedSkills.split(',').map(s => s.trim()) }));
    }, [resumeData.experience, resumeData.skills, setResumeData]);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <AccordionSection title="Personal Details" isOpen={openSection === 'personal'} onToggle={() => handleToggle('personal')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" id="name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} placeholder="e.g., Jane Doe" />
              <InputField label="Email" id="email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} placeholder="e.g., jane.doe@example.com" type="email" />
              <InputField label="Phone Number" id="phone" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} placeholder="e.g., (123) 456-7890" />
              <InputField label="Address" id="address" value={resumeData.personalInfo.address} onChange={handlePersonalInfoChange} placeholder="e.g., City, State" />
              <InputField label="LinkedIn Profile" id="linkedin" value={resumeData.personalInfo.linkedin} onChange={handlePersonalInfoChange} placeholder="e.g., linkedin.com/in/janedoe" />
              <InputField label="Website / Portfolio" id="website" value={resumeData.personalInfo.website} onChange={handlePersonalInfoChange} placeholder="e.g., janedoe.com" />
          </div>
      </AccordionSection>
      
      <AccordionSection title="Professional Summary" isOpen={openSection === 'summary'} onToggle={() => handleToggle('summary')}>
        <TextAreaWithAI
            label="Summary"
            id="summary"
            value={resumeData.summary}
            onChange={handleSummaryChange}
            onRefine={refineSummary}
            placeholder="Write a brief summary of your career and skills. Or, fill out your experience and skills, then click 'Refine with AI' to generate one."
            rows={5}
        />
      </AccordionSection>

      <AccordionSection title="Work Experience" isOpen={openSection === 'experience'} onToggle={() => handleToggle('experience')}>
          {resumeData.experience.map((exp, index) => (
              <div key={exp.id} className="p-4 border border-slate-200 rounded-lg space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Job Title" id={`jobTitle-${index}`} name="jobTitle" value={exp.jobTitle} onChange={(e) => handleExperienceChange(index, e)} placeholder="e.g., Software Engineer" />
                        <div>
                            <label htmlFor={`company-${index}`} className="block text-sm font-medium text-slate-700">Company</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    id={`company-${index}`}
                                    name="company"
                                    value={exp.company}
                                    onChange={(e) => handleExperienceChange(index, e)}
                                    placeholder="e.g., Tech Innovations Inc."
                                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <button onClick={() => removeExperience(index)} aria-label={`Remove ${exp.jobTitle} experience`} className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                             <InputField label="Location" id={`location-${index}`} name="location" value={exp.location} onChange={(e) => handleExperienceChange(index, e)} placeholder="e.g., San Francisco, CA" />
                        </div>
                        <InputField label="Start Date" id={`startDate-${index}`} name="startDate" value={exp.startDate} onChange={(e) => handleExperienceChange(index, e)} placeholder="e.g., Jan 2020" />
                        <InputField label="End Date" id={`endDate-${index}`} name="endDate" value={exp.endDate} onChange={(e) => handleExperienceChange(index, e)} placeholder="e.g., Present" />
                   </div>
                  <TextAreaWithAI
                    label="Description & Achievements"
                    id={`description-${index}`}
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, e)}
                    onRefine={() => refineExperienceDescription(index)}
                    placeholder="Describe your responsibilities and achievements in bullet points."
                    rows={6}
                    name="description"
                   />
              </div>
          ))}
          <button onClick={addExperience} className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors">
              <PlusIcon className="w-5 h-5" /> Add Experience
          </button>
      </AccordionSection>
      
      <AccordionSection title="Education" isOpen={openSection === 'education'} onToggle={() => handleToggle('education')}>
          {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="p-4 border border-slate-200 rounded-lg space-y-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Degree / Field of Study" id={`degree-${index}`} name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} placeholder="e.g., B.S. in Computer Science" />
                      <InputField label="School" id={`school-${index}`} name="school" value={edu.school} onChange={(e) => handleEducationChange(index, e)} placeholder="e.g., University of Technology" />
                      <InputField label="Location" id={`location-${index}`} name="location" value={edu.location} onChange={(e) => handleEducationChange(index, e)} placeholder="e.g., Techville, USA" />
                      <InputField label="Graduation Date" id={`graduationDate-${index}`} name="graduationDate" value={edu.graduationDate} onChange={(e) => handleEducationChange(index, e)} placeholder="e.g., May 2019" />
                  </div>
                  <button onClick={() => removeEducation(index)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                      <TrashIcon className="w-5 h-5" />
                  </button>
              </div>
          ))}
          <button onClick={addEducation} className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors">
              <PlusIcon className="w-5 h-5" /> Add Education
          </button>
      </AccordionSection>
      
      <AccordionSection title="Skills" isOpen={openSection === 'skills'} onToggle={() => handleToggle('skills')}>
        <TextAreaWithAI
            label="Skills"
            id="skills"
            value={resumeData.skills.join(', ')}
            onChange={handleSkillsChange}
            onRefine={refineSkills}
            placeholder="Enter skills separated by commas, e.g., React, TypeScript, Project Management"
            rows={4}
        />
      </AccordionSection>
    </div>
  );
};