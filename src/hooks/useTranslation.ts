import { useState, useCallback } from 'react';
import { saveTranslation } from '@/lib/history';
import { OutputMode, TranslationMode } from '@/lib/types';

interface UseTranslationParams {
    sourceLang: string;
    targetLang: string;
    context: string;
    translationMode: TranslationMode;
    meaningModel: string;
    directModel: string;
    reverseModel: string;
    onTranslationComplete?: () => void;
}

export function useTranslation({
    sourceLang,
    targetLang,
    context,
    translationMode,
    meaningModel,
    directModel,
    reverseModel,
    onTranslationComplete
}: UseTranslationParams) {
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [modelUsed, setModelUsed] = useState('');
    const [outputMode, setOutputMode] = useState<OutputMode>('meaning');

    const handleTranslate = useCallback(async () => {
        if (!sourceText.trim() || isLoading) return;

        setIsLoading(true);
        setError('');
        setTranslatedText('');
        setModelUsed('');

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: sourceText,
                    sourceLang,
                    targetLang,
                    context: context.trim() || undefined,
                    mode: translationMode,
                    model: translationMode === 'direct' ? directModel : translationMode === 'reverse' ? reverseModel : meaningModel
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Translation failed');
            }

            setTranslatedText(data.translation);
            setModelUsed(data.model);
            setOutputMode(data.mode);

            // Save to history
            saveTranslation({
                sourceText: sourceText.trim(),
                translatedText: data.translation,
                sourceLang,
                targetLang,
                context: context.trim() || undefined,
            });

            onTranslationComplete?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Translation failed');
        } finally {
            setIsLoading(false);
        }
    }, [
        sourceText, sourceLang, targetLang, context, isLoading, onTranslationComplete,
        translationMode, directModel, meaningModel, reverseModel
    ]);

    return {
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
    };
}
