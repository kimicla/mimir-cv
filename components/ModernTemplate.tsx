import React from 'react';
import type { ResumeData } from '../types';
import { DescriptionRenderer } from './DescriptionRenderer';

interface TemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalInfo, summary, experience, education, skills } = data;

    return (
        <div className="font-sans text-slate-800 w-full flex">
            {/* Left Column */}
            <aside className="w-1/3 bg-slate-50 p-8 flex flex-col gap-8">
                <div>
                    {personalInfo.name && <h1 className="text-3xl font-bold text-slate-900">{personalInfo.name}</h1>}
                </div>
                
                <section>
                    <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-3">Contact</h2>
                    <div className="space-y-2 text-sm text-slate-700">
                        {personalInfo.email && <div>{personalInfo.email}</div>}
                        {personalInfo.phone && <div>{personalInfo.phone}</div>}
                        {personalInfo.address && <div>{personalInfo.address}</div>}
                        {personalInfo.linkedin && <a href={personalInfo.linkedin} className="block hover:text-indigo-600 break-all">{personalInfo.linkedin}</a>}
                        {personalInfo.website && <a href={personalInfo.website} className="block hover:text-indigo-600 break-all">{personalInfo.website}</a>}
                    </div>
                </section>

                {education.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-3">Education</h2>
                        {education.map(edu => (
                            <div key={edu.id} className="mb-4 break-inside-avoid">
                                <h3 className="font-semibold text-slate-800">{edu.degree}</h3>
                                <p className="text-sm text-slate-600">{edu.school}</p>
                                <p className="text-xs text-slate-500">{edu.graduationDate}</p>
                            </div>
                        ))}
                    </section>
                )}

                {skills.length > 0 && skills[0] !== '' && (
                    <section>
                        <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-3">Skills</h2>
                        <ul className="list-inside list-disc text-sm text-slate-700 space-y-1">
                            {skills.map((skill, index) => skill && <li key={index}>{skill}</li>)}
                        </ul>
                    </section>
                )}
            </aside>

            {/* Right Column */}
            <main className="w-2/3 p-8">
                {summary && (
                    <section className="mb-8">
                        <p className="text-md text-slate-700 leading-relaxed italic">{summary}</p>
                    </section>
                )}

                {experience.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">Experience</h2>
                        {experience.map(exp => (
                            <div key={exp.id} className="mb-6 break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-semibold text-slate-900">{exp.jobTitle}</h3>
                                    <p className="text-sm text-slate-500">{exp.startDate} - {exp.endDate}</p>
                                </div>
                                <div className="mb-2">
                                    <p className="text-md text-slate-600">{exp.company}</p>
                                    <p className="text-sm text-slate-500 text-right">{exp.location}</p>
                                </div>
                                <DescriptionRenderer text={exp.description} className="mt-1 text-slate-600" />
                            </div>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
};