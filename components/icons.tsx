import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10 2.5a.75.75 0 01.75.75v3.543l1.94 1.94a.75.75 0 01-1.06 1.06l-1.94-1.94v3.544a.75.75 0 01-1.5 0v-3.543l-1.94 1.94a.75.75 0 01-1.06-1.06l1.94-1.94V3.25A.75.75 0 0110 2.5zM15.06 10a.75.75 0 01.75-.75h3.543l-1.94-1.94a.75.75 0 011.06-1.06l1.94 1.94h3.544a.75.75 0 010 1.5h-3.543l-1.94 1.94a.75.75 0 01-1.06-1.06l1.94-1.94zM3.25 10a.75.75 0 01.75.75v3.543l1.94 1.94a.75.75 0 01-1.06 1.06l-1.94-1.94v3.544a.75.75 0 01-1.5 0v-3.543l-1.94 1.94a.75.75 0 01-1.06-1.06l1.94-1.94V10.75a.75.75 0 01.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
    />
  </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
      clipRule="evenodd"
    />
  </svg>
);

export const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0 1 18 8.653v4.097A2.25 2.25 0 0 1 15.75 15h-.241l.002.004H15.5A2.5 2.5 0 0 1 13 17.5h-6A2.5 2.5 0 0 1 4.5 15h-.241l.002-.004H4.25A2.25 2.25 0 0 1 2 12.75V8.653c0-.857.47-1.635 1.198-2.048a.25.25 0 0 1 .302-.005A7.7 7.7 0 0 1 5 6.302V2.75Zm1.75-.25a.25.25 0 0 0-.25.25v3.69c0 .092.023.18.065.26A1.75 1.75 0 0 0 8.25 8h3.5a1.75 1.75 0 0 0 1.685-1.3A.75.75 0 0 0 13.5 6.69V2.75a.25.25 0 0 0-.25-.25h-6.5Z" clipRule="evenodd" />
        <path d="M3.5 10a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1h-13Z" />
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M9.25 8.042a.75.75 0 0 1 .5.708V14.25a.75.75 0 0 0 1.5 0V8.75a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h3.25Z" />
        <path fillRule="evenodd" d="M3.513 6.187a.75.75 0 0 1 .586-1.126 4.5 4.5 0 0 1 8.526 2.128A3.001 3.001 0 0 1 15 11.25a2.98 2.98 0 0 1-2.75 2.993.75.75 0 1 1-.2-1.486A1.488 1.488 0 0 0 13.5 11.25a1.5 1.5 0 0 0-1.4-1.493.75.75 0 0 1-.736-.63 3 3 0 0 0-5.65-1.465.75.75 0 0 1-1.214.326Z" clipRule="evenodd" />
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
        <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
);

export const FileJsonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v2.564a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 10 2Zm-2.25 4.75a.75.75 0 0 0-1.5 0v4.332l-.54-.154a.75.75 0 0 0-.82 1.25l1.75 3.5a.75.75 0 0 0 1.342-.671L8.5 9.423V6.75Zm5 0a.75.75 0 0 1 1.5 0v4.332l.54-.154a.75.75 0 0 1 .82 1.25l-1.75 3.5a.75.75 0 0 1-1.342-.671L11.5 9.423V6.75Z" clipRule="evenodd" />
        <path d="M3.25 6.25a2.75 2.75 0 0 1 2.75-2.75h7.5A2.75 2.75 0 0 1 16.25 6.25v7.5a2.75 2.75 0 0 1-2.75 2.75h-7.5A2.75 2.75 0 0 1 3.25 13.75v-7.5ZM6 3.75A2.25 2.25 0 0 0 3.75 6v.25h12.5V6A2.25 2.25 0 0 0 14 3.75H6Zm-2.25 4v6A2.25 2.25 0 0 0 6 16.25h8a2.25 2.25 0 0 0 2.25-2.25v-6H3.75Z" />
    </svg>
);

export const GripVerticalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M7 3a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3ZM15 3a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3Z" />
    </svg>
);