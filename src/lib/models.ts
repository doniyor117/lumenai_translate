export type ModelProvider = 'google' | 'groq';

export interface Model {
    id: string;
    displayName: string;
    provider: ModelProvider;
}

export const GOOGLE_MODELS: Model[] = [
    { id: 'gemini-3.1-flash-lite', displayName: 'Gemini 3.1 Flash-Lite', provider: 'google' },
    { id: 'gemma-4-31b-it', displayName: 'Gemma 4 31B', provider: 'google' },
    { id: 'gemma-4-26b-a4b-it', displayName: 'Gemma 4 26B MoE', provider: 'google' },
];

export const GROQ_MODELS: Model[] = [
    { id: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B', provider: 'groq' },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', displayName: 'Llama 4 Scout 17B', provider: 'groq' },
    { id: 'qwen/qwen3-32b', displayName: 'Qwen 3 32B', provider: 'groq' },
    { id: 'openai/gpt-oss-120b', displayName: 'GPT-OSS 120B', provider: 'groq' },
    { id: 'openai/gpt-oss-20b', displayName: 'GPT-OSS 20B', provider: 'groq' },
    { id: 'llama-3.1-8b-instant', displayName: 'Llama 3.1 8B', provider: 'groq' },
];

export const ALL_MODELS = [...GOOGLE_MODELS, ...GROQ_MODELS];

export function getModelDisplayName(id: string): string {
    if (id === 'auto') return 'Auto Selection (Recommended)';
    const model = ALL_MODELS.find((m) => m.id === id);
    return model ? model.displayName : id;
}

export function getModelProvider(id: string): ModelProvider | null {
    const model = ALL_MODELS.find((m) => m.id === id);
    return model ? model.provider : null;
}
