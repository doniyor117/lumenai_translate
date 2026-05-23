'use client';

import React, { useState, useEffect } from 'react';
import { TranslationEntry, TranslationMode } from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useSpeech } from '@/hooks/useSpeech';
import { SourcePanel } from './SourcePanel';
import { TargetPanel } from './TargetPanel';
import { LanguageSelect } from './LanguageSelect';
import { getModelDisplayName } from '@/lib/models';

interface TranslatorPanelProps {
    onTranslationComplete?: () => void;
    restoredEntry: TranslationEntry | null;
    translationMode: TranslationMode;
    onModeChange: (mode: TranslationMode) => void;
    meaningModel: string;
    directModel: string;
    reverseModel: string;
    sourceLang: string;
    targetLang: string;
    onSourceLangChange: (lang: string) => void;
    onTargetLangChange: (lang: string) => void;
}

export function TranslatorPanel({ 
    onTranslationComplete, 
    restoredEntry,
    translationMode,
    onModeChange,
    meaningModel,
    directModel,
    reverseModel,
    sourceLang,
    targetLang,
    onSourceLangChange,
    onTargetLangChange
}: TranslatorPanelProps) {
    const [context, setContext] = useState('');
    const [showContext, setShowContext] = useState(false);

    const {
        sourceText,
        setSourceText,
        translatedText,
        setTranslatedText,
        isLoading,
        error,
        setError,
        modelUsed,
        setModelUsed,
        outputMode,
        setOutputMode,
        handleTranslate
    } = useTranslation({
        sourceLang,
        targetLang,
        context,
        translationMode,
        meaningModel,
        directModel,
        reverseModel,
        onTranslationComplete
    });

    const {
        isListening,
        isSpeakingSource,
        isSpeakingTarget,
        toggleListening,
        handleSpeakSource,
        handleSpeakTarget
    } = useSpeech({
        sourceLang,
        targetLang,
        setSourceText,
        translatedText,
        outputMode
    });

    // Restore from history
    useEffect(() => {
        if (restoredEntry) {
            setSourceText(restoredEntry.sourceText);
            setTranslatedText(restoredEntry.translatedText);
            onSourceLangChange(restoredEntry.sourceLang);
            onTargetLangChange(restoredEntry.targetLang);
            if (restoredEntry.context) {
                setContext(restoredEntry.context);
                setShowContext(true);
            }
            setError('');
            setModelUsed('');
        }
    }, [restoredEntry, setSourceText, setTranslatedText, setError, setModelUsed]);

    const handleSwapLanguages = () => {
        if (sourceLang === 'auto') {
            onSourceLangChange(targetLang);
            onTargetLangChange('en');
        } else {
            const temp = sourceLang;
            onSourceLangChange(targetLang);
            onTargetLangChange(temp);
        }
        setSourceText(translatedText.replace(/\*/g, '').replace(/\[.*?\]/g, '').trim());
        setTranslatedText('');
        setModelUsed('');
        setError('');
    };

    const handleClear = () => {
        setSourceText('');
        setTranslatedText('');
        setError('');
        setModelUsed('');
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            <LanguageSelect
                sourceLang={sourceLang}
                targetLang={targetLang}
                setSourceLang={onSourceLangChange}
                setTargetLang={onTargetLangChange}
                handleSwapLanguages={handleSwapLanguages}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-[400px]">
                <SourcePanel
                    sourceText={sourceText}
                    setSourceText={setSourceText}
                    context={context}
                    setContext={setContext}
                    showContext={showContext}
                    setShowContext={setShowContext}
                    handleTranslate={handleTranslate}
                    isLoading={isLoading}
                    isListening={isListening}
                    toggleListening={toggleListening}
                    isSpeakingSource={isSpeakingSource}
                    handleSpeakSource={handleSpeakSource}
                    handleClear={handleClear}
                />

                <TargetPanel
                    translatedText={translatedText}
                    error={error}
                    isLoading={isLoading}
                    modelUsed={modelUsed || getModelDisplayName(translationMode === 'direct' ? directModel : translationMode === 'reverse' ? reverseModel : meaningModel)}
                    outputMode={outputMode || translationMode}
                    isSpeakingTarget={isSpeakingTarget}
                    handleSpeakTarget={handleSpeakTarget}
                />
            </div>
        </div>
    );
}
