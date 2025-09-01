import React, { useState, useEffect, useRef } from 'react';

const A4_HEIGHT_MM = 297;
const A4_WIDTH_MM = 210;
const MM_TO_PX = 3.7795275591; // Based on 96 DPI

interface PagedPreviewProps {
    children: React.ReactElement;
}

// Generates a path of indices to reach an element from its root container.
const getElementPath = (root: Element, target: Element): number[] => {
    const path: number[] = [];
    let current = target;
    while (current && current !== root) {
        const parent = current.parentElement;
        if (!parent) break;
        path.unshift(Array.from(parent.children).indexOf(current));
        current = parent;
    }
    return path;
};

// Uses a path of indices to find an element within a new root.
const findElementByPath = (root: Element, path: number[]): Element | null => {
    let current: Element | null = root;
    for (const index of path) {
        if (!current?.children[index]) {
            current = null;
            break;
        }
        current = current.children[index];
    }
    return current;
};


export const PagedPreview: React.FC<PagedPreviewProps> = ({ children }) => {
    const [pages, setPages] = useState<string[]>([]);
    const [sourceClassName, setSourceClassName] = useState('');
    const sourceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPages([]); // Reset pages on each render
        const timer = setTimeout(() => {
            if (!sourceRef.current?.children[0]) return;

            const sourceNode = sourceRef.current.children[0] as HTMLElement;
            setSourceClassName(sourceNode.className);

            const PAGE_HEIGHT = (A4_HEIGHT_MM * MM_TO_PX) - 1; // -1 for safety margin

            // Create a shell for subsequent pages where the header is removed.
            const subsequentPageShell = sourceNode.cloneNode(true) as HTMLElement;
            const headerInSection = subsequentPageShell.querySelector('[data-page-header]');
            if (headerInSection) {
                // Remove the header content to prevent it from appearing on page 2+
                headerInSection.innerHTML = '';
                // Additionally, remove padding/margins/borders that might remain to prevent empty space
                headerInSection.setAttribute('style', 'padding: 0; margin: 0; border: none; height: 0; overflow: hidden;');
            }


            // Step 1: Get all fine-grained content nodes we want to paginate.
            const contentNodes = Array.from(sourceNode.querySelectorAll('.break-inside-avoid, main > section > div, aside > section > div, main > .grid > div > section'));
            if (contentNodes.length === 0) {
                 if (sourceNode.innerHTML) setPages([sourceNode.innerHTML]);
                 return;
            }

            // Create a map of parent elements to their paths and children nodes.
            const parentMap = new Map<Element, { path: number[], nodes: Element[] }>();
            for (const node of contentNodes) {
                const parent = node.parentElement;
                if (!parent) continue;

                if (!parentMap.has(parent)) {
                    parentMap.set(parent, { path: getElementPath(sourceNode, parent), nodes: [] });
                }
                parentMap.get(parent)!.nodes.push(node);
            }

            const newPages: string[] = [];
            let pageShell = sourceNode.cloneNode(true) as HTMLElement;
            
            // Empty all content from the shell.
            parentMap.forEach(({ path }) => {
                const parentInShell = findElementByPath(pageShell, path);
                if (parentInShell) parentInShell.replaceChildren();
            });
            
            let pageIsEmpty = true;
            
            const measureDiv = document.createElement('div');
            measureDiv.style.position = 'absolute';
            measureDiv.style.visibility = 'hidden';
            measureDiv.style.pointerEvents = 'none';
            measureDiv.style.width = `${A4_WIDTH_MM * MM_TO_PX}px`;
            document.body.appendChild(measureDiv);
            
            // Step 2: Iterate through content nodes and distribute them into pages.
            for (const parent of parentMap.keys()) {
                const { path, nodes } = parentMap.get(parent)!;
                
                for (const node of nodes) {
                    const parentInShell = findElementByPath(pageShell, path);
                    if (!parentInShell) continue;
                    
                    parentInShell.appendChild(node.cloneNode(true));
                    measureDiv.className = sourceNode.className;
                    measureDiv.innerHTML = pageShell.innerHTML;

                    if (measureDiv.scrollHeight > PAGE_HEIGHT) {
                        if (!pageIsEmpty) {
                            // Page is not empty, so this node caused the overflow.
                            // 1. Remove the node from the current page shell.
                            parentInShell.removeChild(parentInShell.lastChild!);
                            
                            // 2. Finalize and push the current page.
                            newPages.push(pageShell.innerHTML);

                            // 3. Start a new page shell using the header-less version.
                            pageShell = subsequentPageShell.cloneNode(true) as HTMLElement;
                            parentMap.forEach(({ path: pPath }) => {
                                const pInShell = findElementByPath(pageShell, pPath);
                                if (pInShell) pInShell.replaceChildren();
                            });
                            
                            // 4. Add the overflowing node to the new page.
                            const newParentInShell = findElementByPath(pageShell, path);
                            if (newParentInShell) newParentInShell.appendChild(node.cloneNode(true));
                            pageIsEmpty = false;
                            continue;
                        }
                    }
                    pageIsEmpty = false;
                }
            }
            
            // Push the last page if it has content.
            const finalMeasureDiv = document.createElement('div');
            finalMeasureDiv.innerHTML = pageShell.innerHTML;
            // Check for any visible content, not just whitespace
            if (finalMeasureDiv.textContent?.trim()) {
                 newPages.push(pageShell.innerHTML);
            }
           
            document.body.removeChild(measureDiv);
            setPages(newPages);
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [children]);

    if (!children) return null;

    return (
        <>
            <div ref={sourceRef} style={{ position: 'absolute', zIndex: -1, opacity: 0, pointerEvents: 'none', width: `${A4_WIDTH_MM * MM_TO_PX}px` }}>
                {children}
            </div>

            <div className="flex flex-col items-center gap-4">
                {pages.length > 0 ? (
                     pages.map((pageHtml, index) => (
                        <div
                            key={index}
                            className={`${sourceClassName} a4-width bg-white shadow-lg`}
                            style={{ height: `${A4_HEIGHT_MM}mm`, overflow: 'hidden' }}
                            dangerouslySetInnerHTML={{ __html: pageHtml }}
                        />
                    ))
                ) : (
                   <div 
                       className={`${sourceClassName || ''} a4-width bg-white shadow-lg flex items-center justify-center`}
                       style={{ height: `${A4_HEIGHT_MM}mm` }}
                   >
                       <div className="w-8 h-8 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                   </div>
                )}
            </div>
        </>
    );
};