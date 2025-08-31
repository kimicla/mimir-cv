import React from 'react';
import type { ResumeData } from '../types';
import { DescriptionRenderer } from './DescriptionRenderer';

interface TemplateProps {
    data: ResumeData;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalInfo, summary, experience, education, skills } = data;

    return (
        <div className="p-10 font-sans text-gray-800 w-full">
            <header className="flex flex-col sm:flex-row items-center justify-between bg-teal-600 text-white p-8 -mx-10 -mt-10 mb-8">
                <div>
                    {personalInfo.name && <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{personalInfo.name}</h1>}
                </div>
                <div className="text-right text-sm space-y-1 mt-4 sm:mt-0">
                    {personalInfo.email && <div>{personalInfo.email}</div>}
                    {personalInfo.phone && <div>{personalInfo.phone}</div>}
                    {personalInfo.address && <div>{personalInfo.address}</div>}
                    {personalInfo.linkedin && <a href={personalInfo.linkedin} className="text-white hover:underline">{personalInfo.linkedin}</a>}
                    {personalInfo.website && <a href={personalInfo.website} className="text-white hover:underline">{personalInfo.website}</a>}
                </div>
            </header>

            <main className="space-y-10">
                {summary && (
                    <section>
                        <p className="text-center text-lg text-gray-600 italic border-y-2 border-teal-100 py-4">{summary}</p>
                    </section>
                )}

                {experience.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-teal-700 mb-4 uppercase tracking-wider">Experience</h2>
                        {experience.map(company => (
                            <div key={company.id} className="mb-6 relative pl-8 before:absolute before:left-2 before:top-2.5 before:w-2 before:h-2 before:bg-teal-500 before:rounded-full break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-xl font-semibold text-gray-900">{company.company}</h3>
                                    <p className="text-md italic text-gray-600">{company.location}</p>
                                </div>
                                {company.positions.map(pos => (
                                    <div key={pos.id} className="mt-2">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="text-lg font-semibold text-gray-800">{pos.jobTitle}</h4>
                                            <p className="text-sm font-medium text-gray-500">{pos.startDate} - {pos.endDate}</p>
                                        </div>
                                        <DescriptionRenderer text={pos.description} className="mt-1" />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {education.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-teal-700 mb-4 uppercase tracking-wider">Education</h2>
                            {education.map(edu => (
                                <div key={edu.id} className="mb-4 break-inside-avoid">
                                    <h3 className="text-xl font-semibold text-gray-900">{edu.degree}</h3>
                                    <p className="text-md italic text-gray-600">{edu.school}</p>
                                    <p className="text-sm font-medium text-gray-500">{edu.graduationDate}</p>
                                </div>
                            ))}
                        </section>
                    )}

                    {skills.length > 0 && skills[0] !== '' && (
                        <section>
                            <h2 className="text-2xl font-bold text-teal-700 mb-4 uppercase tracking-wider">Skills</h2>
                            <div className="flex flex-wrap gap-3">
                                {skills.map((skill, index) => (
                                    skill && <span key={index} className="bg-teal-100 text-teal-800 text-sm font-semibold px-4 py-1 rounded">{skill}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};
