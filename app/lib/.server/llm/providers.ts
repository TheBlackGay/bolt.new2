import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { getAPIKey } from './api-key';
import { env } from 'node:process';

/**
 * Get custom endpoint configuration from client
 * This will be passed from the client when making API calls
 */
interface CustomEndpointConfig {
  baseURL?: string;
  apiKey?: string;
}

/**
 * Provider registry - Singleton pattern to reuse provider instances
 * This follows AI SDK best practices for provider management
 */
class ProviderRegistry {
  private providers: Map<string, any> = new Map();

  /**
   * Get or create a provider instance
   * Providers are cached to avoid recreating them on each request
   */
  getProvider(providerName: string, env: Env): any {
    // OpenAI Compatible is handled separately (not cached)
    if (providerName === 'OpenAICompatible') {
      return null;
    }
    
    const apiKey = getAPIKey(env, providerName);
    
    if (!apiKey) {
      throw new Error(
        `API key for provider "${providerName}" is not configured. ` +
        `Please set the appropriate environment variable.`
      );
    }

    // Create cache key with provider name and hashed API key (for security)
    const cacheKey = `${providerName}:${apiKey.substring(0, 10)}`;

    if (!this.providers.has(cacheKey)) {
      const provider = this.createProvider(providerName, apiKey);
      this.providers.set(cacheKey, provider);
    }

    return this.providers.get(cacheKey);
  }

  private createProvider(providerName: string, apiKey: string) {
    switch (providerName) {
      case 'Anthropic':
        return createAnthropic({ apiKey });
      
      case 'OpenAI':
        return createOpenAI({ apiKey });
      
      case 'Google':
        return createGoogleGenerativeAI({ apiKey });
      
      case 'OpenAICompatible':
        // Note: OpenAI Compatible providers are created per-request
        // to support custom endpoint configurations
        return null; // Handled separately in getLanguageModel
      
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }

  /**
   * Get custom headers for OpenAI Compatible provider
   * Can be configured via environment variables
   */
  private getCustomHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Allow custom headers via environment
    if (env.OPENAI_COMPATIBLE_HEADERS) {
      try {
        Object.assign(headers, JSON.parse(env.OPENAI_COMPATIBLE_HEADERS));
      } catch (error) {
        console.warn('Failed to parse OPENAI_COMPATIBLE_HEADERS:', error);
      }
    }
    
    return headers;
  }

  /**
   * Clear cached providers (useful for testing or credential rotation)
   */
  clearCache() {
    this.providers.clear();
  }
}

// Export singleton instance
export const providerRegistry = new ProviderRegistry();

/**
 * Get a language model from any supported provider
 * This follows the AI SDK's unified architecture
 */
export function getLanguageModel(
  provider: string,
  modelName: string,
  env: Env,
  customApiKey?: string,
  customEndpointConfig?: CustomEndpointConfig
) {
  // For OpenAI Compatible, always create a fresh instance with proper configuration
  if (provider === 'OpenAICompatible') {
    const baseURL = customEndpointConfig?.baseURL || env.OPENAI_COMPATIBLE_BASE_URL || 'http://localhost:1234/v1';
    const apiKey = customEndpointConfig?.apiKey || customApiKey || env.OPENAI_COMPATIBLE_API_KEY || '';
    
    const compatibleProvider = createOpenAICompatible({
      name: 'lmstudio', // Use a specific name for better compatibility
      apiKey: apiKey,
      baseURL: baseURL,
    });
    
    // Use chatModel() for better compatibility with LM Studio and similar providers
    return compatibleProvider.chatModel(modelName);
  }

  // If a custom API key is provided, create provider directly
  if (customApiKey) {
    const tempProvider = createProviderWithKey(provider, customApiKey);
    return tempProvider(modelName);
  }

  // Otherwise use the provider registry
  const providerInstance = providerRegistry.getProvider(provider, env);
  return providerInstance(modelName);
}

/**
 * Helper to create provider with custom API key
 */
function createProviderWithKey(providerName: string, apiKey: string) {
  switch (providerName) {
    case 'Anthropic':
      return createAnthropic({ apiKey });
    case 'OpenAI':
      return createOpenAI({ apiKey });
    case 'Google':
      return createGoogleGenerativeAI({ apiKey });
    case 'OpenAICompatible':
      // This path shouldn't be used anymore, but keep for backward compatibility
      const baseURL = env.OPENAI_COMPATIBLE_BASE_URL || 'http://localhost:1234/v1';
      return createOpenAICompatible({
        name: 'lmstudio',
        apiKey: apiKey,
        baseURL: baseURL,
      });
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}
