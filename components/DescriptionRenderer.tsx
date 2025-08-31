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
        <ul key={`ul-${elements.length}`} className="list-disc list-outside ml-5 space-y-1">
          {listItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      listItems.push(trimmedLine.substring(2));
      continue;
    }
    
    flushList(); // End any existing list

    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      elements.push(
        <h4 key={elements.length} className="font-semibold text-md mt-2 mb-1">
          {trimmedLine.substring(2, trimmedLine.length - 2)}
        </h4>
      );
    } else {
      elements.push(
        <p key={elements.length} className="mb-1">{trimmedLine}</p>
      );
    }
  }
  
  flushList(); // Add any remaining list items at the end

  return elements;
};


export const DescriptionRenderer: React.FC<DescriptionRendererProps> = ({ text, className = '' }) => {
  const content = parseDescription(text);
  
  return (
    <div className={`text-sm text-gray-700 leading-relaxed ${className}`}>
        {content}
    </div>
  );
};