import React, { useState, useRef, useEffect } from 'react';

interface ModelOption {
    id: string;
    displayName: string;
}

interface ModelGroup {
    label: string;
    models: ModelOption[];
}

interface ModelSelectProps {
    value: string;
    onChange: (val: string) => void;
    groups: ModelGroup[];
}

export function ModelSelect({ value, onChange, groups }: ModelSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Find the currently selected model name
    let selectedName = 'Auto Selection (Recommended)';
    if (value !== 'auto') {
        for (const g of groups) {
            const m = g.models.find(mod => mod.id === value);
            if (m) {
                selectedName = m.displayName;
                break;
            }
        }
    }

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-shadow flex items-center justify-between text-left group"
            >
                <span className="truncate text-[var(--foreground)] pr-4">{selectedName}</span>
                <svg className={`w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--foreground)] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl max-h-60 overflow-y-auto animate-scale-in origin-top">
                    <button
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === 'auto' ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium' : 'text-[var(--foreground)] hover:bg-[var(--surface-hover)]'}`}
                        onClick={() => {
                            onChange('auto');
                            setIsOpen(false);
                        }}
                    >
                        Auto Selection (Recommended)
                    </button>
                    
                    {groups.map((group, gIdx) => (
                        <div key={gIdx}>
                            <div className="px-3 py-2 text-xs font-bold text-[var(--foreground)] bg-[var(--surface-hover)] mt-1 mb-1 uppercase tracking-widest border-y border-[var(--border)]">
                                {group.label}
                            </div>
                            {group.models.map(model => (
                                <button
                                    key={model.id}
                                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === model.id ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium' : 'text-[var(--foreground)] hover:bg-[var(--surface-hover)]'}`}
                                    onClick={() => {
                                        onChange(model.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    {model.displayName}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
