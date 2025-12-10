/**
 * Model Configuration
 * Defines model capabilities and settings for each provider
 * This follows AI SDK best practices for model configuration
 */

export interface ModelConfig {
  provider: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  provider: 'Anthropic',
  model: 'claude-3-5-sonnet-20240620',
  maxTokens: 8192,
};

/**
 * Provider-specific configurations
 * These can be extended to support provider-specific features
 */
export interface ProviderConfig {
  headers?: Record<string, string>;
  baseURL?: string;
  organization?: string;
}

export function getProviderConfig(provider: string): ProviderConfig {
  switch (provider) {
    case 'Anthropic':
      return {
        headers: {
          'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
        },
      };
    case 'OpenAI':
      return {
        // OpenAI specific config can be added here
      };
    case 'Google':
      return {
        // Google specific config can be added here
      };
    case 'OpenAICompatible':
      return {
        // OpenAI Compatible uses settings from provider creation
        // See providers.ts for baseURL and headers configuration
      };
    default:
      return {};
  }
}

/**
 * Validate model configuration
 */
export function validateModelConfig(config: Partial<ModelConfig>): ModelConfig {
  return {
    provider: config.provider || DEFAULT_MODEL_CONFIG.provider,
    model: config.model || DEFAULT_MODEL_CONFIG.model,
    maxTokens: config.maxTokens || DEFAULT_MODEL_CONFIG.maxTokens,
    temperature: config.temperature,
    topP: config.topP,
  };
}
