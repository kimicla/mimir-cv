import React from 'react';

interface DescriptionRendererProps {
  text: string;
  className?: string;
}

const parseDescription = (text: string) => {
  const elements = [];
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-outside ml-4 space-y-1 mt-1">
          {listItems.map((item, index) => (
            <li key={index} className="text-sm text-gray-700 leading-snug pl-1">{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  // Check if text has explicit formatting
  const hasExplicitBullets = lines.some(line => 
    line.trim().startsWith('* ') || 
    line.trim().startsWith('- ') || 
    line.trim().startsWith('**')
  );

  // If no explicit formatting and multiple sentences, treat as bullet points
  const shouldAutoBullet = !hasExplicitBullets && lines.length > 1;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      listItems.push(trimmedLine.substring(2));
      continue;
    }
    
    if (shouldAutoBullet && trimmedLine.length > 0) {
      listItems.push(trimmedLine);
      continue;
    }
    
    flushList(); // End any existing list

    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      elements.push(
        <h4 key={elements.length} className="font-semibold text-sm mt-2 mb-1 text-gray-800">
          {trimmedLine.substring(2, trimmedLine.length - 2)}
        </h4>
      );
    } else {
      elements.push(
        <p key={elements.length} className="mb-1 text-sm text-gray-700 leading-snug">{trimmedLine}</p>
      );
    }
  }
  
  flushList(); // Add any remaining list items at the end

  return elements;
};


export const DescriptionRenderer: React.FC<DescriptionRendererProps> = ({ text, className = '' }) => {
  const content = parseDescription(text);
  
  return (
    <div className={`${className}`}>
        {content}
    </div>
  );
};