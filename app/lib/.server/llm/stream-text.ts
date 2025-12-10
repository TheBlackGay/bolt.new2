import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getLanguageModel } from './providers';
import { validateModelConfig, getProviderConfig, type ModelConfig } from './model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';
import type { CoreMessage } from 'ai';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model' | 'system' | 'maxTokens' | 'messages'>;

/**
 * Stream text from AI model
 * This follows AI SDK best practices for streaming responses
 * 
 * @param messages - Chat messages
 * @param env - Environment variables (for API keys)
 * @param options - Additional streaming options
 * @param customApiKey - Optional custom API key for the selected provider
 * @param modelConfig - Model configuration (provider, model name, parameters)
 */
export function streamText(
  messages: Messages,
  env: Env,
  options?: StreamingOptions,
  customApiKey?: string,
  modelConfig?: Partial<ModelConfig>,
  customEndpointConfig?: { baseURL?: string; apiKey?: string },
) {
  // Validate and normalize model configuration
  const config = validateModelConfig(modelConfig || {});
  
  // Get provider-specific configuration
  const providerConfig = getProviderConfig(config.provider);

  // Get the language model using the unified provider architecture
  const model = getLanguageModel(
    config.provider,
    config.model,
    env,
    customApiKey,
    customEndpointConfig
  );

  // Convert messages to AI SDK core format
  const coreMessages: CoreMessage[] = convertToCoreMessages(messages);

  // Build streaming configuration
  const streamConfig = {
    model,
    system: getSystemPrompt(),
    maxTokens: config.maxTokens || MAX_TOKENS,
    messages: coreMessages,
    ...(config.temperature !== undefined && { temperature: config.temperature }),
    ...(config.topP !== undefined && { topP: config.topP }),
    ...(providerConfig.headers && { headers: providerConfig.headers }),
    ...options,
  };

  return _streamText(streamConfig);
}

/**
 * Helper to create a simple text generation (non-streaming)
 * Useful for one-off requests or testing
 */
export async function generateText(
  prompt: string,
  env: Env,
  modelConfig?: Partial<ModelConfig>,
) {
  const config = validateModelConfig(modelConfig || {});
  const model = getLanguageModel(config.provider, config.model, env);

  const { generateText: _generateText } = await import('ai');
  
  return _generateText({
    model,
    system: getSystemPrompt(),
    prompt,
    maxTokens: config.maxTokens || MAX_TOKENS,
  });
}
