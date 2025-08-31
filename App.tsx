import React, { useState, useRef } from 'react';
import { ResumeForm } from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import type { ResumeData, Experience, Education } from './types';
import { PrintIcon, DownloadIcon, FileJsonIcon } from './components/icons';
import { TemplateSelector } from './components/TemplateSelector';
import { ResumeImporter } from './components/ResumeImporter';

const initialResumeData: ResumeData = {
  personalInfo: {
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '123-456-7890',
    address: 'City, State',
    linkedin: 'linkedin.com/in/janedoe',
    website: 'janedoe.dev',
  },
  summary: 'A highly motivated and results-oriented professional with 5+ years of experience in software development. Proven ability to design, develop, and deploy high-quality web applications using modern technologies.',
  experience: [
    {
      id: '1',
      jobTitle: 'Senior Software Engineer',
      company: 'Innovatech Solutions',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description: '- Led the development of a new customer-facing analytics dashboard, resulting in a 20% increase in user engagement.\n- Mentored junior developers, improving team productivity by 15%.\n- Optimized application performance, reducing page load times by 30%.',
    },
  ],
  education: [
    {
      id: '1',
      degree: 'B.S. in Computer Science',
      school: 'University of Technology',
      location: 'Techville, USA',
      graduationDate: 'May 2018',
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Agile Methodologies', 'CI/CD'],
};

const Header: React.FC<{ onPrint: () => void; onExport: () => void; }> = ({ onPrint, onExport }) => (
  <header className="bg-white shadow-md p-4 flex justify-between items-center">
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            M
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Mimir CV</h1>
    </div>
    <div className="flex items-center gap-4">
        <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
            <DownloadIcon className="w-5 h-5" />
            Export JSON
        </button>
        <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            <PrintIcon className="w-5 h-5" />
            Print / Download PDF
        </button>
    </div>
  </header>
);

type ImportedResumeData = Omit<ResumeData, 'experience' | 'education'> & {
    experience: Omit<Experience, 'id'>[];
    education: Omit<Education, 'id'>[];
};


const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [template, setTemplate] = useState<string>('classic');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
      window.print();
  };
  
  const handleExportJson = () => {
    try {
        const jsonString = JSON.stringify(resumeData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "resume-data.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export JSON:", error);
        setImportError("Could not export your data as JSON. Please try again.");
    }
  };

  const handleImportSuccess = (importedData: ImportedResumeData) => {
    const experienceWithIds = (importedData.experience || []).map((exp, index) => ({
      ...exp,
      id: `exp-${Date.now()}-${index}`,
    }));
    const educationWithIds = (importedData.education || []).map((edu, index) => ({
      ...edu,
      id: `edu-${Date.now()}-${index}`,
    }));

    const newResumeData = {
      personalInfo: importedData.personalInfo || { name: '', email: '', phone: '', linkedin: '', website: '', address: '' },
      summary: importedData.summary || '',
      experience: experienceWithIds,
      education: educationWithIds,
      skills: importedData.skills || [],
    };

    setResumeData(newResumeData);
    setImportError(null);
    setImportSuccessMessage('Successfully imported resume! Please review the populated fields below.');
    setTimeout(() => setImportSuccessMessage(null), 5000); // Hide message after 5 seconds
  };

  const handleImportError = (error: string | null) => {
    setImportError(error);
    setImportSuccessMessage(null);
  };
  
  const handleJsonImportClick = () => {
    jsonInputRef.current?.click();
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("Failed to read file content.");
            }
            const data: Partial<ResumeData> = JSON.parse(text);

            // Robust validation to prevent crashes from malformed JSON
            if (
                data &&
                data.personalInfo &&
                typeof data.personalInfo === 'object' &&
                !Array.isArray(data.personalInfo) &&
                typeof data.summary === 'string' &&
                Array.isArray(data.experience) &&
                Array.isArray(data.education) &&
                Array.isArray(data.skills)
            ) {
                setResumeData(data as ResumeData);
                setImportError(null);
                setImportSuccessMessage('Successfully loaded data from JSON!');
                setTimeout(() => setImportSuccessMessage(null), 5000);
            } else {
                throw new Error("JSON file does not have the expected resume data structure.");
            }
        } catch (error) {
            handleImportError(error instanceof Error ? `Invalid JSON file: ${error.message}` : "Could not parse the JSON file.");
        }
    };
    reader.onerror = () => {
        handleImportError("Failed to read the selected file.");
    };

    reader.readAsText(file);

    if (event.target) {
        event.target.value = "";
    }
  };


  return (
    <div className="min-h-screen bg-slate-100 font-sans">
        <Header onPrint={handlePrint} onExport={handleExportJson} />
        <main id="main-content" className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-8">
            <div className="bg-white rounded-xl shadow-lg h-full overflow-y-auto" style={{maxHeight: 'calc(100vh - 120px)'}}>
                <div className="p-6 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ResumeImporter onImportSuccess={handleImportSuccess} onImportError={handleImportError} />
                    <div>
                        <input
                            type="file"
                            ref={jsonInputRef}
                            onChange={handleJsonFileChange}
                            className="hidden"
                            accept=".json"
                            aria-hidden="true"
                        />
                        <button
                            onClick={handleJsonImportClick}
                            className="w-full h-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-50 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FileJsonIcon className="w-6 h-6" />
                            <span>Import from JSON</span>
                        </button>
                    </div>
                </div>

                {importError && (
                    <div className="px-6 pb-2">
                        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md text-sm" role="alert">
                            {importError}
                        </div>
                    </div>
                )}
                {importSuccessMessage && (
                    <div className="px-6 pb-2">
                        <div className="p-4 border border-green-300 bg-green-50 text-green-800 rounded-md text-sm" role="status">
                            {importSuccessMessage}
                        </div>
                    </div>
                )}
                <TemplateSelector selectedTemplate={template} onSelect={setTemplate} />
                <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />
            </div>
            <div id="preview-wrapper" className="lg:fixed lg:right-8 lg:top-[104px] lg:w-[calc(50%-48px)] lg:h-[calc(100vh-120px)]">
                <div className="w-full h-full bg-slate-200 p-4 md:p-6 rounded-xl overflow-auto">
                   <ResumePreview data={resumeData} template={template} />
                </div>
            </div>
        </main>
    </div>
  );
};

export default App;