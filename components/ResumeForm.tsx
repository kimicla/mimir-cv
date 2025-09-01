import React, { useState, useCallback } from 'react';
import type { ResumeData, CompanyExperience, Position, Education, SectionType } from '../types';
import { SparklesIcon, PlusIcon, TrashIcon, GripVerticalIcon } from './icons';
import { refineTextWithAI } from '../services/geminiService';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

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


const AccordionSection: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; isDraggable?: boolean }> = ({ title, children, isOpen, onToggle, isDraggable = false }) => (
    <div className="border-b border-slate-200 bg-white">
        <button onClick={onToggle} className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
            <div className="flex items-center gap-3">
                {isDraggable && <GripVerticalIcon className="w-5 h-5 text-slate-400 cursor-grab" aria-hidden="true" />}
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            </div>
            <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        {isOpen && <div className="p-4 bg-white space-y-4">{children}</div>}
    </div>
);

const parseExperienceDate = (dateStr?: string, isEndDate: boolean = false): Date => {
    if (!dateStr || dateStr.trim() === '') {
        return isEndDate ? new Date() : new Date(0); // Treat empty end date as "Present", empty start date as very old
    }
    const lowerDateStr = dateStr.toLowerCase().trim();
    if (['present', 'current'].includes(lowerDateStr)) {
        return new Date();
    }
    
    const date = new Date(lowerDateStr);
    if (!isNaN(date.getTime())) {
        return date;
    }
    
    const yearMatch = lowerDateStr.match(/\d{4}/);
    if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        const monthMatch = lowerDateStr.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
        if (monthMatch) {
            const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(monthMatch[0].toLowerCase());
            return new Date(year, monthIndex);
        }
        return new Date(year, 0);
    }
    
    return new Date(0); // Fallback for unparseable strings
};

export const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData }) => {
    const [openSection, setOpenSection] = useState<string | null>('personal');
    const [draggedSection, setDraggedSection] = useState<SectionType | null>(null);

    const handleToggle = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };
  
    const handlePersonalInfoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [id]: value } }));
    }, [setResumeData]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, photo: event.target.result as string } }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const removePhoto = () => {
        setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, photo: '' } }));
    };

    const handleSummaryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResumeData(prev => ({ ...prev, summary: e.target.value }));
    }, [setResumeData]);

    const refineSummary = useCallback(async () => {
        const experienceText = resumeData.experience.map(comp =>
            `Company: ${comp.company}\n` + comp.positions.map(pos => `${pos.jobTitle}: ${pos.description}`).join('\n')
        ).join('\n\n');
        const prompt = `Based on the following resume data, write a professional and compelling summary of 2-4 sentences. Focus on key achievements and skills. Your response must ONLY contain the summary text itself, without any introductory phrases or labels.\n\nExperience: ${experienceText}\n\nSkills: ${resumeData.skills.join(', ')}`;
        const refinedSummary = await refineTextWithAI(resumeData.summary || "A motivated professional", prompt);
        setResumeData(prev => ({ ...prev, summary: refinedSummary }));
    }, [resumeData.experience, resumeData.skills, resumeData.summary, setResumeData]);

    const handleCompanyChange = useCallback((companyIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newExperience = [...resumeData.experience];
        newExperience[companyIndex] = { ...newExperience[companyIndex], [name]: value };
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    }, [resumeData.experience, setResumeData]);
    
    const handlePositionChange = useCallback((companyIndex: number, positionIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newExperience = [...resumeData.experience];
        const newPositions = [...newExperience[companyIndex].positions];
        newPositions[positionIndex] = { ...newPositions[positionIndex], [name]: value };
        newExperience[companyIndex] = { ...newExperience[companyIndex], positions: newPositions };
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    }, [resumeData.experience, setResumeData]);
    
    const refineExperienceDescription = useCallback(async (companyIndex: number, positionIndex: number) => {
        const pos = resumeData.experience[companyIndex]?.positions[positionIndex];
        if (!pos) return;
        const prompt = "Rewrite the following resume description to be more impactful. Use action verbs, focus on quantifiable achievements, and list as bullet points (using '- '). Your response must ONLY contain the bullet points, without any introductory sentences or explanations.";
        const refinedDescription = await refineTextWithAI(pos.description, prompt);
        
        const newExperience = [...resumeData.experience];
        const newPositions = [...newExperience[companyIndex].positions];
        newPositions[positionIndex] = { ...newPositions[positionIndex], description: refinedDescription };
        newExperience[companyIndex] = { ...newExperience[companyIndex], positions: newPositions };
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    }, [resumeData.experience, setResumeData]);
    
    const sortExperience = useCallback(() => {
        type FlatPosition = {
            companyInfo: Omit<CompanyExperience, 'positions'>;
            position: Position;
        };

        const flatPositions: FlatPosition[] = resumeData.experience.flatMap(company => 
            company.positions.map(position => ({
                companyInfo: { id: company.id, company: company.company, location: company.location },
                position
            }))
        );

        flatPositions.sort((a, b) => {
            const endDateA = parseExperienceDate(a.position.endDate, true);
            const endDateB = parseExperienceDate(b.position.endDate, true);
            if (endDateB.getTime() !== endDateA.getTime()) {
                return endDateB.getTime() - endDateA.getTime();
            }
            const startDateA = parseExperienceDate(a.position.startDate, false);
            const startDateB = parseExperienceDate(b.position.startDate, false);
            return startDateB.getTime() - startDateA.getTime();
        });

        const sortedAndGroupedExperience: CompanyExperience[] = [];
        if (flatPositions.length > 0) {
            let currentGroup: CompanyExperience = {
                id: `sorted-comp-${Date.now()}-0`,
                company: flatPositions[0].companyInfo.company,
                location: flatPositions[0].companyInfo.location,
                positions: [flatPositions[0].position],
            };

            for (let i = 1; i < flatPositions.length; i++) {
                const flatPos = flatPositions[i];
                if (flatPos.companyInfo.company === currentGroup.company && flatPos.companyInfo.location === currentGroup.location) {
                    currentGroup.positions.push(flatPos.position);
                } else {
                    sortedAndGroupedExperience.push(currentGroup);
                    currentGroup = {
                        id: `sorted-comp-${Date.now()}-${i}`,
                        company: flatPos.companyInfo.company,
                        location: flatPos.companyInfo.location,
                        positions: [flatPos.position],
                    };
                }
            }
            sortedAndGroupedExperience.push(currentGroup);
        }
        setResumeData(prev => ({ ...prev, experience: sortedAndGroupedExperience }));
    }, [resumeData.experience, setResumeData]);

    const addCompany = useCallback(() => {
        const newPosition: Position = { id: `${Date.now()}-pos`, jobTitle: '', startDate: '', endDate: '', description: '' };
        const newCompany: CompanyExperience = { id: `${Date.now()}-comp`, company: '', location: '', positions: [newPosition] };
        setResumeData(prev => ({ ...prev, experience: [...prev.experience, newCompany] }));
    }, [setResumeData]);

    const removeCompany = useCallback((companyIndex: number) => {
        const newExperience = resumeData.experience.filter((_, i) => i !== companyIndex);
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    }, [resumeData.experience, setResumeData]);

    const addPosition = useCallback((companyIndex: number) => {
        const newPosition: Position = { id: Date.now().toString(), jobTitle: '', startDate: '', endDate: '', description: '' };
        const newExperience = [...resumeData.experience];
        newExperience[companyIndex].positions.push(newPosition);
        setResumeData(prev => ({ ...prev, experience: newExperience }));
    }, [resumeData.experience, setResumeData]);

    const removePosition = useCallback((companyIndex: number, positionIndex: number) => {
        const newExperience = [...resumeData.experience];
        const newPositions = newExperience[companyIndex].positions.filter((_, i) => i !== positionIndex);
        newExperience[companyIndex].positions = newPositions;
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
        const experienceText = resumeData.experience.map(comp => 
            comp.positions.map(pos => `${pos.jobTitle}: ${pos.description}`).join('\n')
        ).join('\n\n');
        const prompt = `Based on the following resume experience, suggest a comma-separated list of 10-15 relevant hard and soft skills. Your response must ONLY be the comma-separated list of skills, without any introductory text or explanations.\n\nExperience: ${experienceText}`;
        const refinedSkills = await refineTextWithAI(resumeData.skills.join(', '), prompt);
        setResumeData(prev => ({ ...prev, skills: refinedSkills.split(',').map(s => s.trim()) }));
    }, [resumeData.experience, resumeData.skills, setResumeData]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, section: SectionType) => {
        setDraggedSection(section);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        document.querySelectorAll('[data-drag-over="true"]').forEach(el => el.removeAttribute('data-drag-over'));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetSection: SectionType) => {
        e.preventDefault();
        if (!draggedSection || draggedSection === targetSection) {
            return;
        }

        const sections = [...resumeData.sections];
        const draggedIndex = sections.indexOf(draggedSection);
        const targetIndex = sections.indexOf(targetSection);

        const [removed] = sections.splice(draggedIndex, 1);
        sections.splice(targetIndex, 0, removed);
      
        setResumeData(prev => ({...prev, sections }));
        setDraggedSection(null);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.currentTarget.dataset.sectionId !== draggedSection) {
        e.currentTarget.setAttribute('data-drag-over', 'true');
      }
    };
  
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.removeAttribute('data-drag-over');
    };

  const totalPositions = resumeData.experience.reduce((acc, comp) => acc + comp.positions.length, 0);

  const sectionTitles: Record<SectionType, string> = {
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
  };

  const sectionComponents: Record<SectionType, React.ReactNode> = {
    summary: (
      <TextAreaWithAI
            label="Summary"
            id="summary"
            value={resumeData.summary}
            onChange={handleSummaryChange}
            onRefine={refineSummary}
            placeholder="Write a brief summary of your career and skills. Or, fill out your experience and skills, then click 'Refine with AI' to generate one."
            rows={5}
        />
    ),
    experience: (
      <>
        <div className="flex justify-end mb-4 -mt-2">
            <button
                onClick={sortExperience}
                disabled={totalPositions < 2}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Sort by Date (Newest First)
            </button>
          </div>
          {resumeData.experience.map((company, companyIndex) => (
              <div key={company.id} className="p-4 border border-slate-200 rounded-lg space-y-4 bg-slate-50/50">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <InputField label="Company" id={`company-${companyIndex}`} name="company" value={company.company} onChange={(e) => handleCompanyChange(companyIndex, e)} placeholder="e.g., Tech Innovations Inc." />
                        <div>
                            <label htmlFor={`location-${companyIndex}`} className="block text-sm font-medium text-slate-700">Location</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    id={`location-${companyIndex}`}
                                    name="location"
                                    value={company.location}
                                    onChange={(e) => handleCompanyChange(companyIndex, e)}
                                    placeholder="e.g., San Francisco, CA"
                                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <button onClick={() => removeCompany(companyIndex)} aria-label={`Remove ${company.company} experience`} className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                   </div>

                   {company.positions.map((pos, posIndex) => (
                       <div key={pos.id} className="p-4 border border-slate-300/80 rounded-lg bg-white space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 items-end">
                                <InputField label="Job Title" id={`jobTitle-${companyIndex}-${posIndex}`} name="jobTitle" value={pos.jobTitle} onChange={(e) => handlePositionChange(companyIndex, posIndex, e)} placeholder="e.g., Software Engineer" />
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => removePosition(companyIndex, posIndex)}
                                        disabled={company.positions.length <= 1}
                                        aria-label={`Remove ${pos.jobTitle} position`}
                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Start Date" id={`startDate-${companyIndex}-${posIndex}`} name="startDate" value={pos.startDate} onChange={(e) => handlePositionChange(companyIndex, posIndex, e)} placeholder="e.g., Jan 2020" />
                                <InputField label="End Date" id={`endDate-${companyIndex}-${posIndex}`} name="endDate" value={pos.endDate} onChange={(e) => handlePositionChange(companyIndex, posIndex, e)} placeholder="e.g., Present" />
                           </div>
                           <TextAreaWithAI
                                label="Description & Achievements"
                                id={`description-${companyIndex}-${posIndex}`}
                                name="description"
                                value={pos.description}
                                onChange={(e) => handlePositionChange(companyIndex, posIndex, e)}
                                onRefine={() => refineExperienceDescription(companyIndex, posIndex)}
                                placeholder="Describe your responsibilities and achievements in bullet points."
                                rows={6}
                           />
                       </div>
                   ))}
                   <button onClick={() => addPosition(companyIndex)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200/80 text-slate-600 text-sm font-semibold rounded-md hover:bg-slate-300/80 transition-colors">
                       <PlusIcon className="w-4 h-4" /> Add Position
                   </button>
              </div>
          ))}
          <button onClick={addCompany} className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors">
              <PlusIcon className="w-5 h-5" /> Add Company
          </button>
      </>
    ),
    education: (
      <>
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
      </>
    ),
    skills: (
      <TextAreaWithAI
            label="Skills"
            id="skills"
            value={resumeData.skills.join(', ')}
            onChange={handleSkillsChange}
            onRefine={refineSkills}
            placeholder="Enter skills separated by commas, e.g., React, TypeScript, Project Management"
            rows={4}
        />
    ),
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden data-[drag-over=true]:bg-indigo-100/50">
      <AccordionSection title="Personal Details" isOpen={openSection === 'personal'} onToggle={() => handleToggle('personal')}>
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-slate-200">
              <div className="w-24 h-24 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {resumeData.personalInfo.photo ? (
                      <img src={resumeData.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                  )}
              </div>
              <div className="space-y-2 flex flex-col items-center sm:items-start">
                  <input type="file" id="photo-upload" className="hidden" accept="image/png, image/jpeg" onChange={handlePhotoChange} />
                  <label htmlFor="photo-upload" className="cursor-pointer px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium text-center">
                      Upload Photo
                  </label>
                  {resumeData.personalInfo.photo && (
                      <button onClick={removePhoto} className="flex items-center gap-1 px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium">
                          <TrashIcon className="w-4 h-4" /> Remove
                      </button>
                  )}
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" id="name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} placeholder="e.g., Jane Doe" />
              <InputField label="Email" id="email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} placeholder="e.g., jane.doe@example.com" type="email" />
              <InputField label="Phone Number" id="phone" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} placeholder="e.g., (123) 456-7890" />
              <InputField label="Address" id="address" value={resumeData.personalInfo.address} onChange={handlePersonalInfoChange} placeholder="e.g., City, State" />
              <InputField label="LinkedIn Profile" id="linkedin" value={resumeData.personalInfo.linkedin} onChange={handlePersonalInfoChange} placeholder="e.g., linkedin.com/in/janedoe" />
              <InputField label="Website / Portfolio" id="website" value={resumeData.personalInfo.website} onChange={handlePersonalInfoChange} placeholder="e.g., janedoe.com" />
          </div>
      </AccordionSection>
      
      {resumeData.sections.map((sectionId) => (
        <div
            key={sectionId}
            draggable
            onDragStart={(e) => handleDragStart(e, sectionId)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, sectionId)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            data-section-id={sectionId}
            className="transition-all"
        >
          <AccordionSection
            title={sectionTitles[sectionId]}
            isOpen={openSection === sectionId}
            onToggle={() => handleToggle(sectionId)}
            isDraggable
          >
            {sectionComponents[sectionId]}
          </AccordionSection>
        </div>
      ))}
    </div>
  );
};