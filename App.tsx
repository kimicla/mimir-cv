import React, { useState, useRef } from 'react';
import { ResumeForm } from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import type { ResumeData, CompanyExperience, Education, Position, SectionType } from './types';
import { PrintIcon, DownloadIcon, FileJsonIcon } from './components/icons';
import { TemplateSelector } from './components/TemplateSelector';
import { ResumeImporter } from './components/ResumeImporter';

declare const html2pdf: any;

const initialResumeData: ResumeData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    website: '',
    photo: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  sections: ['summary', 'experience', 'education', 'skills'],
};

const Header: React.FC<{ 
    onPrint: () => void; 
    onExport: () => void; 
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isPrinting: boolean;
}> = ({ onPrint, onExport, onImport, isPrinting }) => {
    const importInputRef = useRef<HTMLInputElement>(null);
    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-screen-2xl mx-auto p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-800">Mimir CV</h1>
                </div>
                <div className="flex items-center gap-2">
                    <input type="file" ref={importInputRef} onChange={onImport} className="hidden" accept=".json" />
                    <button onClick={() => importInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium">
                        <FileJsonIcon className="w-5 h-5" />
                        <span>Import JSON</span>
                    </button>
                    <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium">
                        <DownloadIcon className="w-5 h-5" />
                        <span>Export JSON</span>
                    </button>
                    <button
                        onClick={onPrint}
                        disabled={isPrinting}
                        className="flex items-center justify-center gap-2 px-4 py-2 w-[180px] bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium disabled:bg-indigo-400 disabled:cursor-wait"
                    >
                        {isPrinting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                <span>Saving PDF...</span>
                            </>
                        ) : (
                            <>
                                <PrintIcon className="w-5 h-5" />
                                <span>Print / Save PDF</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

type ImportedResumeData = Omit<ResumeData, 'experience' | 'education' | 'sections'> & {
    experience: (Omit<CompanyExperience, 'id' | 'positions'> & {
        positions: Omit<Position, 'id'>[];
    })[];
    education: Omit<Education, 'id'>[];
};

const App: React.FC = () => {
    const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
    const [template, setTemplate] = useState<string>('classic');
    const [importError, setImportError] = useState<string | null>(null);
    const [isPrinting, setIsPrinting] = useState<boolean>(false);
    
    const handlePrint = () => {
        if (isPrinting) return;

        const element = document.getElementById('resume-preview');
        if (!element) {
            console.error("Resume preview element not found.");
            return;
        }

        // The scroll container is the direct parent of the resume element
        const scrollWrapper = element.parentElement;
        if (!scrollWrapper) {
            console.error("Scroll wrapper not found.");
            return;
        }

        setIsPrinting(true);

        // Store original styles
        const originalMaxHeight = scrollWrapper.style.maxHeight;
        const originalOverflowY = scrollWrapper.style.overflowY;
        const originalPadding = scrollWrapper.style.padding;

        // Temporarily adjust styles for accurate PDF capture
        scrollWrapper.style.padding = '0';
        scrollWrapper.style.maxHeight = 'none';
        scrollWrapper.style.overflowY = 'visible';
        
        const opt = {
            margin: 0,
            filename: `${resumeData.personalInfo.name.replace(/\s/g, '_').toLowerCase() || 'resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save().finally(() => {
            // Restore original styles
            scrollWrapper.style.padding = originalPadding;
            scrollWrapper.style.maxHeight = originalMaxHeight;
            scrollWrapper.style.overflowY = originalOverflowY;
            setIsPrinting(false);
        });
    };

    const handleExportJson = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(resumeData, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "resume.json";
        link.click();
    };

    const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (event.target.files && event.target.files[0]) {
            fileReader.readAsText(event.target.files[0], "UTF-8");
            fileReader.onload = e => {
                try {
                    if (e.target?.result) {
                        const imported = JSON.parse(e.target.result as string) as Partial<ResumeData>;
                         const experienceWithIds = (imported.experience || []).map((company, cIdx) => ({
                            ...company,
                            id: company.id || `comp-import-${Date.now()}-${cIdx}`,
                            positions: (company.positions || []).map((pos, pIdx) => ({
                                ...pos,
                                id: pos.id || `pos-import-${Date.now()}-${cIdx}-${pIdx}`
                            }))
                        }));
                        const educationWithIds = (imported.education || []).map((edu, eIdx) => ({
                            ...edu,
                            id: edu.id || `edu-import-${Date.now()}-${eIdx}`
                        }));

                        setResumeData({
                            ...initialResumeData,
                            ...imported,
                            personalInfo: {
                                ...initialResumeData.personalInfo,
                                ...(imported.personalInfo || {})
                            },
                            experience: experienceWithIds,
                            education: educationWithIds,
                            skills: imported.skills || [],
                            sections: imported.sections || initialResumeData.sections,
                        });
                        setImportError(null);
                    }
                } catch (err) {
                    setImportError("Error parsing JSON file. Please ensure it's a valid resume format.");
                }
            };
        }
    };

    const handleImportSuccess = (importedData: ImportedResumeData) => {
         const experienceWithIds = (importedData.experience || []).map((company, cIdx) => ({
            ...company,
            id: `comp-ai-${Date.now()}-${cIdx}`,
            positions: (company.positions || []).map((pos, pIdx) => ({
                ...pos,
                id: `pos-ai-${Date.now()}-${cIdx}-${pIdx}`
            }))
        }));
        const educationWithIds = (importedData.education || []).map((edu, eIdx) => ({
            ...edu,
            id: `edu-ai-${Date.now()}-${eIdx}`
        }));
        
        setResumeData({
            ...initialResumeData,
            ...importedData,
            personalInfo: {
                ...initialResumeData.personalInfo,
                ...(importedData.personalInfo || {})
            },
            experience: experienceWithIds,
            education: educationWithIds,
            skills: importedData.skills || [],
            sections: initialResumeData.sections, // Use default order on AI import
        });
        setImportError(null);
    };

    const isResumeEmpty = !resumeData.personalInfo.name && !resumeData.summary && resumeData.experience.length === 0 && resumeData.education.length === 0;

    return (
        <>
            <Header onPrint={handlePrint} onExport={handleExportJson} onImport={handleImportJson} isPrinting={isPrinting} />
            <main id="main-content" className="max-w-screen-2xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Form & Controls */}
                <div className="space-y-6 lg:col-span-2">
                    <TemplateSelector selectedTemplate={template} onSelect={setTemplate} />
                    <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />
                </div>

                {/* Right Column: Preview */}
                <div id="preview-wrapper" className="relative lg:col-span-3">
                    <div className="sticky top-24 p-4 bg-slate-200/50 rounded-lg overflow-y-auto overflow-x-hidden max-h-[calc(100vh-8rem)]">
                        {importError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm" role="alert">
                                <p className="font-semibold">Import Failed</p>
                                <p>{importError}</p>
                            </div>
                        )}
                        {isResumeEmpty ? (
                            <div className="p-8 bg-white rounded-lg shadow-inner border border-slate-200 flex flex-col items-center justify-center text-center h-[297mm]">
                                <h2 className="text-xl font-semibold text-slate-700 mb-4">Your resume is empty</h2>
                                <p className="text-slate-500 mb-6">Get started by importing your existing resume.</p>
                                <ResumeImporter onImportSuccess={handleImportSuccess} onImportError={setImportError} />
                            </div>
                        ) : (
                           <ResumePreview data={resumeData} template={template} />
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default App;