import React from 'react';
import type { ResumeData } from '../types';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { CreativeTemplate } from './CreativeTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  template: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template }) => {
  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate data={data} />;
      case 'creative':
        return <CreativeTemplate data={data} />;
      case 'classic':
      default:
        return <ClassicTemplate data={data} />;
    }
  };

  return (
    <div 
      id="resume-preview" 
      className="a4-width bg-white shadow-lg mx-auto"
    >
      {renderTemplate()}
    </div>
  );
};

export default ResumePreview;