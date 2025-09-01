import React from 'react';

interface DescriptionRendererProps {
  text: string;
  className?: string;
}

// This helper parses a single line for inline formatting like bold text.
const renderLineWithInlineFormatting = (line: string): React.ReactNode => {
    // This regex will find text wrapped in double asterisks.
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = line.split(boldRegex);

    return (
        <React.Fragment>
            {parts.map((part, index) =>
                // Parts at odd indices are the ones captured by the regex, so they should be bold.
                index % 2 === 1 ? <strong key={index}>{part}</strong> : part
            )}
        </React.Fragment>
    );
};

type Block = 
    | { type: 'paragraph'; content: string }
    | { type: 'list'; items: string[] };

export const DescriptionRenderer: React.FC<DescriptionRendererProps> = ({ text, className = '' }) => {
    // Step 1: Parse text into structured blocks (paragraphs and lists of items)
    const blocks = text.split('\n').reduce<Block[]>((acc, line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return acc; // Ignore empty lines

        const isListItem = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
        const lastBlock = acc[acc.length - 1];

        if (isListItem) {
            const content = trimmedLine.substring(2); // Get content after '- ' or '* '
            // If the last block was a list, append to it. Otherwise, create a new list block.
            if (lastBlock?.type === 'list') {
                lastBlock.items.push(content);
            } else {
                acc.push({ type: 'list', items: [content] });
            }
        } else {
            // If the last block was a paragraph, append the new line to it.
            // This groups consecutive non-list lines into a single paragraph.
            if (lastBlock?.type === 'paragraph') {
                lastBlock.content += '\n' + trimmedLine;
            } else {
                // Otherwise, create a new paragraph block.
                acc.push({ type: 'paragraph', content: trimmedLine });
            }
        }
        return acc;
    }, []);

    // Step 2: Render the blocks into React elements
    const content = blocks.map((block, index) => {
        if (block.type === 'list') {
            return (
                <ul key={`ul-${index}`} className="list-disc list-outside ml-5 space-y-1 my-2">
                    {block.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="break-inside-avoid">{renderLineWithInlineFormatting(item)}</li>
                    ))}
                </ul>
            );
        } else { // Block type is 'paragraph'
            return (
                <p key={`p-${index}`} className="mb-1">
                    {block.content.split('\n').map((line, i, arr) => (
                       <React.Fragment key={i}>
                           {renderLineWithInlineFormatting(line)}
                           {i < arr.length - 1 && <br />}
                       </React.Fragment>
                    ))}
                </p>
            );
        }
    });

    return (
        <div className={`text-sm text-gray-700 leading-relaxed ${className}`}>
            {content}
        </div>
    );
};