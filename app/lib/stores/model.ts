import { atom } from 'nanostores';
import { customEndpointsStore, getSelectedEndpoint } from './openai-compatible';

export interface ModelProvider {
  name: string;
  staticModels: ModelInfo[];
}

export interface ModelInfo {
  name: string;
  label: string;
  provider: string;
  maxTokenAllowed: number;
}

/**
 * Get dynamic models from custom OpenAI Compatible endpoints
 */
function getOpenAICompatibleModels(): ModelInfo[] {
  const endpoint = getSelectedEndpoint();
  
  if (!endpoint || endpoint.models.length === 0) {
    // Return default models if no custom endpoint configured
    return [
      {
        name: 'llama-3.1-70b',
        label: 'Llama 3.1 70B',
        provider: 'OpenAICompatible',
        maxTokenAllowed: 8192,
      },
      {
        name: 'llama-3.1-8b',
        label: 'Llama 3.1 8B',
        provider: 'OpenAICompatible',
        maxTokenAllowed: 8192,
      },
      {
        name: 'codellama-34b',
        label: 'CodeLlama 34B',
        provider: 'OpenAICompatible',
        maxTokenAllowed: 4096,
      },
      {
        name: 'mistral-7b',
        label: 'Mistral 7B',
        provider: 'OpenAICompatible',
        maxTokenAllowed: 8192,
      },
    ];
  }
  
  // Return models from selected custom endpoint
  return endpoint.models.map((model) => ({
    name: model.id,
    label: model.name,
    provider: 'OpenAICompatible',
    maxTokenAllowed: model.maxTokens,
  }));
}

// Static models that don't change
const STATIC_MODEL_LIST: ModelInfo[] = [
  {
    name: 'claude-3-5-sonnet-20240620',
    label: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    maxTokenAllowed: 8192,
  },
  {
    name: 'claude-3-opus-20240229',
    label: 'Claude 3 Opus',
    provider: 'Anthropic',
    maxTokenAllowed: 4096,
  },
  {
    name: 'claude-3-sonnet-20240229',
    label: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    maxTokenAllowed: 4096,
  },
  {
    name: 'claude-3-haiku-20240307',
    label: 'Claude 3 Haiku',
    provider: 'Anthropic',
    maxTokenAllowed: 4096,
  },
  {
    name: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'OpenAI',
    maxTokenAllowed: 8192,
  },
  {
    name: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: 'OpenAI',
    maxTokenAllowed: 8192,
  },
  {
    name: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    provider: 'OpenAI',
    maxTokenAllowed: 4096,
  },
  {
    name: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    maxTokenAllowed: 4096,
  },
  {
    name: 'gemini-1.5-pro-latest',
    label: 'Gemini 1.5 Pro',
    provider: 'Google',
    maxTokenAllowed: 8192,
  },
  {
    name: 'gemini-1.5-flash-latest',
    label: 'Gemini 1.5 Flash',
    provider: 'Google',
    maxTokenAllowed: 8192,
  },
];

/**
 * Get all models including dynamic OpenAI Compatible models
 */
export function getModelList(): ModelInfo[] {
  const staticModels = STATIC_MODEL_LIST;
  const dynamicModels = getOpenAICompatibleModels();
  
  return [...staticModels, ...dynamicModels];
}

/**
 * Get provider list with dynamic OpenAI Compatible models
 */
export function getProviderList(): ModelProvider[] {
  const modelList = getModelList();
  
  return [
    {
      name: 'Anthropic',
      staticModels: modelList.filter((model) => model.provider === 'Anthropic'),
    },
    {
      name: 'OpenAI',
      staticModels: modelList.filter((model) => model.provider === 'OpenAI'),
    },
    {
      name: 'Google',
      staticModels: modelList.filter((model) => model.provider === 'Google'),
    },
    {
      name: 'OpenAICompatible',
      staticModels: modelList.filter((model) => model.provider === 'OpenAICompatible'),
    },
  ];
}

// Export for backward compatibility
export const MODEL_LIST = getModelList();
export const PROVIDER_LIST = getProviderList();

// Subscribe to custom endpoints changes to update MODEL_LIST
if (typeof window !== 'undefined') {
  customEndpointsStore.subscribe(() => {
    // Force re-evaluation of model list when endpoints change
    // This will be picked up by components using these functions
  });
}

// Load from localStorage or use default
const getInitialProvider = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('selectedProvider');
    return stored || 'Anthropic';
  }
  return 'Anthropic';
};

const getInitialModel = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('selectedModel');
    return stored || 'claude-3-5-sonnet-20240620';
  }
  return 'claude-3-5-sonnet-20240620';
};

export const selectedProviderStore = atom<string>(getInitialProvider());
export const selectedModelStore = atom<string>(getInitialModel());

// Persist to localStorage when changed
selectedProviderStore.subscribe((provider) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedProvider', provider);
  }
});

selectedModelStore.subscribe((model) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedModel', model);
  }
});

export function getModelInfo(modelName: string): ModelInfo | undefined {
  return MODEL_LIST.find((model) => model.name === modelName);
}
