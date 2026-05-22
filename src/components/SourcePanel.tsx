import React, { useRef } from 'react';
import { MAX_CHARS, CONTEXT_PRESETS } from '@/lib/constants';

interface SourcePanelProps {
    sourceText: string;
    setSourceText: (text: string) => void;
    context: string;
    setContext: (text: string) => void;
    showContext: boolean;
    setShowContext: (show: boolean) => void;
    handleTranslate: () => void;
    isLoading: boolean;
    isListening: boolean;
    toggleListening: () => void;
    isSpeakingSource: boolean;
    handleSpeakSource: (text: string) => void;
    handleClear: () => void;
}

export function SourcePanel({
    sourceText,
    setSourceText,
    context,
    setContext,
    showContext,
    setShowContext,
    handleTranslate,
    isLoading,
    isListening,
    toggleListening,
    isSpeakingSource,
    handleSpeakSource,
    handleClear
}: SourcePanelProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const charCount = sourceText.length;
    const isOverLimit = charCount > MAX_CHARS;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleTranslate();
        }
    };

    return (
        <div className="flex flex-col rounded-xl border border-[var(--border)] glass overflow-hidden min-h-[200px] lg:min-h-0 bg-[var(--surface)]">
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter text..."
                    className="w-full h-full p-4 bg-transparent resize-none focus:outline-none text-lg text-[var(--foreground)]"
                    autoFocus
                />
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-hover)]">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    {/* Mic Button */}
                    <button
                        onClick={toggleListening}
                        className={`p-1.5 rounded-full transition-all ${isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
                            }`}
                        title="Speech to Text"
                        aria-label="Use voice input"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>

                    {sourceText && (
                        <>
                            {/* Speaker Button */}
                            <button
                                onClick={() => handleSpeakSource(sourceText)}
                                className={`p-1.5 rounded-full transition-all ${isSpeakingSource
                                    ? 'text-[var(--primary)] bg-[var(--surface)]'
                                    : 'hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
                                    }`}
                                title="Listen to input pronunciation"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            </button>

                            <button
                                onClick={() => {
                                    handleClear();
                                    textareaRef.current?.focus();
                                }}
                                className="p-1.5 hover:bg-[var(--surface)] rounded-full transition-colors"
                                title="Clear text"
                                aria-label="Clear text"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setShowContext(!showContext)}
                        className={`text-xs px-3 py-1.5 ml-1 rounded-md border transition-colors ${showContext || context ? 'text-[var(--primary)] font-medium border-[var(--primary)] bg-[var(--primary)]/5' : 'text-[var(--text-muted)] border-[var(--border)] bg-[var(--surface)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                            }`}
                    >
                        Context
                    </button>
                </div>

                <button
                    onClick={handleTranslate}
                    disabled={!sourceText.trim() || isOverLimit || isLoading}
                    className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${!sourceText.trim() || isOverLimit || isLoading
                        ? 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                        : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-md shadow-[var(--primary)]/20 active:scale-95'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Translating...
                        </>
                    ) : (
                        <>
                            Translate
                            <span className="text-xs opacity-70 hidden sm:inline-block ml-1">⌘↵</span>
                        </>
                    )}
                </button>
            </div>

            {/* Context Input */}
            {showContext && (
                <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface-hover)]">
                    <input
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Add context (e.g., 'formal email', 'technical documentation')"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] placeholder-[var(--text-muted)]"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {CONTEXT_PRESETS.map((preset) => {
                            const isActive = context.toLowerCase() === preset.value.toLowerCase();
                            return (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => setContext(isActive ? '' : preset.value)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                        isActive
                                            ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                            : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--border)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
