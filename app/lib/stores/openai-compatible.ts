import { atom } from 'nanostores';

export interface CustomEndpoint {
  id: string;
  name: string;
  baseURL: string;
  apiKey?: string;
  models: CustomModel[];
}

export interface CustomModel {
  id: string;
  name: string;
  maxTokens: number;
}

// Load from localStorage or use defaults
const getInitialEndpoints = (): CustomEndpoint[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('customEndpoints');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse custom endpoints:', error);
      }
    }
  }
  
  // Default endpoints
  return [
    {
      id: 'lm-studio',
      name: 'LM Studio',
      baseURL: 'http://localhost:1234/v1',
      models: [
        { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', maxTokens: 8192 },
        { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', maxTokens: 8192 },
        { id: 'codellama-34b', name: 'CodeLlama 34B', maxTokens: 4096 },
      ],
    },
    {
      id: 'ollama',
      name: 'Ollama',
      baseURL: 'http://localhost:11434/v1',
      models: [
        { id: 'llama3.1', name: 'Llama 3.1', maxTokens: 8192 },
        { id: 'codellama', name: 'CodeLlama', maxTokens: 4096 },
        { id: 'mistral', name: 'Mistral', maxTokens: 8192 },
      ],
    },
  ];
};

export const customEndpointsStore = atom<CustomEndpoint[]>(getInitialEndpoints());
export const selectedEndpointIdStore = atom<string>(getInitialEndpoints()[0]?.id || '');

// Persist to localStorage when changed
customEndpointsStore.subscribe((endpoints) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('customEndpoints', JSON.stringify(endpoints));
  }
});

selectedEndpointIdStore.subscribe((id) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedEndpointId', id);
  }
});

/**
 * Add a new custom endpoint
 */
export function addCustomEndpoint(endpoint: CustomEndpoint) {
  const endpoints = customEndpointsStore.get();
  customEndpointsStore.set([...endpoints, endpoint]);
}

/**
 * Update an existing endpoint
 */
export function updateCustomEndpoint(id: string, updates: Partial<CustomEndpoint>) {
  const endpoints = customEndpointsStore.get();
  const index = endpoints.findIndex((e) => e.id === id);
  
  if (index !== -1) {
    const updated = [...endpoints];
    updated[index] = { ...updated[index], ...updates };
    customEndpointsStore.set(updated);
  }
}

/**
 * Delete a custom endpoint
 */
export function deleteCustomEndpoint(id: string) {
  const endpoints = customEndpointsStore.get();
  customEndpointsStore.set(endpoints.filter((e) => e.id !== id));
  
  // If deleted endpoint was selected, select first available
  if (selectedEndpointIdStore.get() === id) {
    const remaining = customEndpointsStore.get();
    selectedEndpointIdStore.set(remaining[0]?.id || '');
  }
}

/**
 * Get a specific endpoint by ID
 */
export function getEndpointById(id: string): CustomEndpoint | undefined {
  return customEndpointsStore.get().find((e) => e.id === id);
}

/**
 * Get currently selected endpoint
 */
export function getSelectedEndpoint(): CustomEndpoint | undefined {
  const id = selectedEndpointIdStore.get();
  return getEndpointById(id);
}
