import React from 'react';
import type { ResumeData } from '../types';
import { DescriptionRenderer } from './DescriptionRenderer';

interface TemplateProps {
  data: ResumeData;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, summary, experience, education, skills } = data;

  return (
    <div className="p-8 md:p-12 font-serif text-gray-800 w-full">
      <header className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        {personalInfo.name && <h1 className="text-4xl font-bold tracking-wider uppercase text-gray-900">{personalInfo.name}</h1>}
        <div className="flex justify-center items-center flex-wrap space-x-4 mt-2 text-xs text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span className="before:content-['|'] before:mr-4">{personalInfo.phone}</span>}
          {personalInfo.address && <span className="before:content-['|'] before:mr-4">{personalInfo.address}</span>}
        </div>
        <div className="flex justify-center items-center flex-wrap space-x-4 mt-1 text-xs text-blue-700">
          {personalInfo.linkedin && <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">{personalInfo.linkedin}</a>}
          {personalInfo.website && <span className="before:content-['|'] before:mr-4"><a href={personalInfo.website} target="_blank" rel="noopener noreferrer">{personalInfo.website}</a></span>}
        </div>
      </header>

      <main>
        {summary && (
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest text-gray-900">Summary</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest text-gray-900">Experience</h2>
            {experience.map(company => (
              <div key={company.id} className="mb-6 break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-semibold text-gray-800">{company.company}</h3>
                  <p className="text-md italic text-gray-700">{company.location}</p>
                </div>
                {company.positions.map(pos => (
                  <div key={pos.id} className="mt-2 pl-2">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-md font-semibold text-gray-700">{pos.jobTitle}</h4>
                      <p className="text-sm font-light text-gray-600">{pos.startDate} - {pos.endDate}</p>
                    </div>
                    <DescriptionRenderer text={pos.description} className="mt-1" />
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest text-gray-900">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-2 break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                  <p className="text-sm font-light text-gray-600">{edu.graduationDate}</p>
                </div>
                <div className="flex justify-between items-baseline">
                    <p className="text-md italic text-gray-700">{edu.school}</p>
                    <p className="text-sm font-light text-gray-600">{edu.location}</p>
                </div>
              </div>
            ))}
          </section>
        )}
        
        {skills.length > 0 && skills[0] !== '' && (
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-widest text-gray-900">Skills</h2>
            <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                    skill && <span key={index} className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">{skill}</span>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
