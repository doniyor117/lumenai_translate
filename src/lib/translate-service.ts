import { GOOGLE_MODELS, GROQ_MODELS, getModelProvider } from './models';
import { buildMeaningPrompt, buildDirectPrompt, buildReverseLookupPrompt, PromptResult } from './prompts';

// API endpoints
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const CONFIGURABLE_REASONING_MODELS = [
    'qwen/qwen3-32b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b'
];

export type OutputMode = 'meaning' | 'direct' | 'reverse';

export interface TranslateRequest {
    text: string;
    sourceLang: string;
    targetLang: string;
    context?: string;
    mode?: string;
    model?: string;
}

export interface TranslateResponse {
    translation: string;
    model: string;
    mode: OutputMode;
}

/**
 * Custom error class for rate limiting
 */
class RateLimitError extends Error {
    constructor(model: string, status: number, message: string) {
        super(`Rate limit hit for ${model}: ${status} - ${message}`);
        this.name = 'RateLimitError';
    }
}

/**
 * Translate with Groq API
 */
async function translateWithGroq(
    model: string,
    prompt: PromptResult,
    apiKey: string
): Promise<string> {
    const body: any = {
        model,
        messages: [
            { role: 'system', content: prompt.systemInstruction },
            { role: 'user', content: prompt.userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
    };

    if (CONFIGURABLE_REASONING_MODELS.includes(model)) {
        body.reasoning_effort = "none";
    }

    const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429 || response.status === 503 || response.status === 529) {
            throw new RateLimitError(model, response.status, errorText);
        }
        throw new Error(`Groq ${model} failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

/**
 * Translate with Gemini API
 */
async function translateWithGemini(
    model: string,
    prompt: PromptResult,
    apiKey: string
): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: prompt.systemInstruction }]
            },
            contents: [{ parts: [{ text: prompt.userPrompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2000,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429 || response.status === 503) {
            throw new RateLimitError(model, response.status, errorText);
        }
        throw new Error(`Gemini ${model} failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Main translation function
 */
export async function translate(
    request: TranslateRequest,
    groqApiKey?: string,
    geminiApiKey?: string
): Promise<TranslateResponse> {
    const execMode: OutputMode = (request.mode as OutputMode) || 'meaning';

    const promptParams = {
        text: request.text,
        sourceLang: request.sourceLang,
        targetLang: request.targetLang,
        context: request.context,
    };

    let prompt: PromptResult;
    if (execMode === 'reverse') {
        prompt = buildReverseLookupPrompt(promptParams);
    } else if (execMode === 'direct') {
        prompt = buildDirectPrompt(promptParams);
    } else {
        prompt = buildMeaningPrompt(promptParams);
    }

    // Determine the list of models to try
    let modelsToTry: string[] = [];
    const preferredModel = request.model && request.model !== 'auto' ? request.model : null;

    const TOP_5_MODELS = [
        'gemini-3.1-flash-lite',
        'openai/gpt-oss-120b',
        'llama-3.3-70b-versatile',
        'qwen/qwen3-32b',
        'gemma-4-31b-it'
    ];

    if (preferredModel) {
        const provider = getModelProvider(preferredModel);
        if (provider === 'google') {
            modelsToTry = [preferredModel, ...GOOGLE_MODELS.map(m => m.id).filter(id => id !== preferredModel)];
        } else if (provider === 'groq') {
            modelsToTry = [preferredModel, ...GROQ_MODELS.map(m => m.id).filter(id => id !== preferredModel)];
        }
    } else {
        // Auto model selection uses the unified Top 5 ranking
        modelsToTry = [...TOP_5_MODELS];
    }

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
        const provider = getModelProvider(model);

        if (provider === 'google') {
            if (!geminiApiKey) {
                lastError = new Error(`GEMINI_API_KEY is not configured for model ${model}`);
                continue;
            }
            try {
                const translation = await translateWithGemini(model, prompt, geminiApiKey);
                if (!translation) throw new Error("Empty response from API");
                return {
                    translation,
                    model,
                    mode: execMode,
                };
            } catch (error) {
                console.warn(`Gemini model ${model} failed, trying next fallback:`, error);
                lastError = error instanceof Error ? error : new Error(String(error));
            }
        } else {
            if (!groqApiKey) {
                lastError = new Error(`GROQ_API_KEY is not configured for model ${model}`);
                continue;
            }
            try {
                const translation = await translateWithGroq(model, prompt, groqApiKey);
                if (!translation) throw new Error("Empty response from API");
                return {
                    translation,
                    model,
                    mode: execMode,
                };
            } catch (error) {
                console.warn(`Groq model ${model} failed, trying next fallback:`, error);
                lastError = error instanceof Error ? error : new Error(String(error));
            }
        }
    }

    throw lastError || new Error('All models failed to translate');
}
