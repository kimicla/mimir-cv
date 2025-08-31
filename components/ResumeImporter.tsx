import React, { useState, useRef } from 'react';
import { parseResumeWithAI } from '../services/geminiService';
import { UploadIcon } from './icons';
import type { ResumeData, Experience, Education } from '../types';

type ImportedResumeData = Omit<ResumeData, 'experience' | 'education'> & {
    experience: Omit<Experience, 'id'>[];
    education: Omit<Education, 'id'>[];
};

interface ResumeImporterProps {
  onImportSuccess: (data: ImportedResumeData) => void;
  onImportError: (error: string | null) => void;
}

export const ResumeImporter: React.FC<ResumeImporterProps> = ({ onImportSuccess, onImportError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    onImportError(null);

    try {
      const parsedData = await parseResumeWithAI(file);
      onImportSuccess(parsedData);
    } catch (error) {
      console.error("Failed to parse resume:", error);
      onImportError(error instanceof Error ? `Error: ${error.message}` : "An unknown error occurred during parsing. Please check the file and try again.");
    } finally {
      setIsLoading(false);
      // Reset file input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        aria-hidden="true"
      />
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className="w-full h-full flex items-center justify-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-wait"
        aria-live="polite"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Parsing Your Resume...</span>
          </>
        ) : (
          <>
            <UploadIcon className="w-6 h-6" />
            <span>Import Resume <span className="font-normal text-indigo-600/80">(PDF, PNG, TXT...)</span></span>
          </>
        )}
      </button>
    </>
  );
};