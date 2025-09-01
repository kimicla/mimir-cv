import React, { useState, useEffect, useRef } from 'react';

const A4_HEIGHT_MM = 297;
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

            const PAGE_HEIGHT_PX = (A4_HEIGHT_MM * MM_TO_PX) - (parseFloat(getComputedStyle(sourceNode).paddingTop) * 2);

            const subsequentPageShell = sourceNode.cloneNode(true) as HTMLElement;
            const headerInSection = subsequentPageShell.querySelector('[data-page-header]');
            if (headerInSection) {
                headerInSection.innerHTML = '';
                headerInSection.setAttribute('style', 'padding: 0; margin: 0; border: none; height: 0; overflow: hidden;');
            }

            const contentNodes = Array.from(sourceNode.querySelectorAll('.break-inside-avoid, [data-breakable]'));
            if (contentNodes.length === 0) {
                 if (sourceNode.innerHTML) setPages([sourceNode.innerHTML]);
                 return;
            }

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
            
            parentMap.forEach(({ path }) => {
                const parentInShell = findElementByPath(pageShell, path);
                if (parentInShell) parentInShell.innerHTML = '';
            });
            
            let pageIsEmpty = true;
            
            const measureDiv = document.createElement('div');
            measureDiv.style.position = 'absolute';
            measureDiv.style.visibility = 'hidden';
            measureDiv.style.pointerEvents = 'none';
            measureDiv.style.width = getComputedStyle(sourceNode).width;
            document.body.appendChild(measureDiv);
            
            for (const parent of parentMap.keys()) {
                const { path, nodes } = parentMap.get(parent)!;
                
                for (const node of nodes) {
                    const parentInShell = findElementByPath(pageShell, path);
                    if (!parentInShell) continue;
                    
                    parentInShell.appendChild(node.cloneNode(true));
                    measureDiv.className = sourceNode.className;
                    measureDiv.innerHTML = pageShell.innerHTML;

                    if (measureDiv.scrollHeight > PAGE_HEIGHT_PX) {
                         if (!pageIsEmpty) {
                            parentInShell.removeChild(parentInShell.lastChild!);
                            newPages.push(pageShell.innerHTML);

                            pageShell = subsequentPageShell.cloneNode(true) as HTMLElement;
                            parentMap.forEach(({ path: pPath }) => {
                                const pInShell = findElementByPath(pageShell, pPath);
                                if (pInShell) pInShell.innerHTML = '';
                            });
                            
                            const newParentInShell = findElementByPath(pageShell, path);
                            if (newParentInShell) newParentInShell.appendChild(node.cloneNode(true));
                            pageIsEmpty = false;
                            continue;
                        }
                    }
                     pageIsEmpty = false;
                }
            }
            
            const finalMeasureDiv = document.createElement('div');
            finalMeasureDiv.innerHTML = pageShell.innerHTML;
            if (finalMeasureDiv.textContent?.trim()) {
                 newPages.push(pageShell.innerHTML);
            }
           
            document.body.removeChild(measureDiv);
            setPages(newPages.length > 0 ? newPages : [sourceNode.innerHTML]);
        }, 500); // Debounce to wait for user to stop typing

        return () => clearTimeout(timer);
    }, [children]);

    if (!children) return null;

    return (
        <>
            <div ref={sourceRef} style={{ position: 'absolute', zIndex: -1, opacity: 0, pointerEvents: 'none' }}>
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
                       className="a4-width bg-white shadow-lg flex items-center justify-center"
                       style={{ height: `${A4_HEIGHT_MM}mm` }}
                   >
                       <div className="w-8 h-8 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                   </div>
                )}
            </div>
        </>
    );
};
