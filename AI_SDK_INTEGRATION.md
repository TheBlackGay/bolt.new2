# AI SDK Integration Guide

This document describes how Bolt.new integrates with the AI SDK following best practices for provider-agnostic AI model usage.

## Architecture Overview

The integration follows the AI SDK's recommended unified provider architecture, providing a clean separation between:

1. **Provider Management** - Handles initialization and caching of AI providers
2. **Model Configuration** - Defines model capabilities and parameters
3. **Streaming Interface** - Unified API for text generation across providers
4. **UI Integration** - React hooks for chat interfaces

## File Structure

```
app/lib/.server/llm/
├── providers.ts          # Provider registry and initialization
├── model.ts              # Model configuration and validation
├── stream-text.ts        # Streaming text generation
├── api-key.ts            # API key management
├── constants.ts          # Constants (max tokens, etc.)
└── prompts.ts            # System prompts

app/routes/
└── api.chat.ts           # Chat API endpoint

app/components/
├── chat/
│   └── Chat.client.tsx   # Chat UI component
└── settings/
    └── ModelSelector.tsx # Model selection UI
```

## Core Components

### 1. Provider Registry (`providers.ts`)

The `ProviderRegistry` class implements a singleton pattern to manage AI provider instances:

```typescript
import { providerRegistry, getLanguageModel } from '~/lib/.server/llm/providers';

// Get a model from any provider
const model = getLanguageModel('OpenAI', 'gpt-4o', env);
```

**Features:**
- Caches provider instances to avoid recreation
- Supports custom API keys
- Automatic error handling for missing credentials
- Provider-agnostic interface

**Supported Providers:**
- Anthropic (Claude models)
- OpenAI (GPT models)
- Google (Gemini models)

### 2. Model Configuration (`model.ts`)

Defines model configurations following AI SDK best practices:

```typescript
export interface ModelConfig {
  provider: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

// Validate and normalize config
const config = validateModelConfig(userConfig);

// Get provider-specific settings
const providerConfig = getProviderConfig('Anthropic');
```

**Key Functions:**
- `validateModelConfig()` - Validates and normalizes model configuration
- `getProviderConfig()` - Returns provider-specific settings (headers, etc.)
- `DEFAULT_MODEL_CONFIG` - Fallback configuration

### 3. Streaming Text Generation (`stream-text.ts`)

Provides a unified interface for streaming text across all providers:

```typescript
import { streamText } from '~/lib/.server/llm/stream-text';

// Stream text with any provider
const result = await streamText(
  messages,
  env,
  options,
  customApiKey,
  modelConfig
);
```

**Features:**
- Provider-agnostic streaming
- Automatic message conversion to AI SDK format
- Support for temperature and topP parameters
- Provider-specific headers
- Optional custom API keys

**Additional Functions:**
- `generateText()` - Non-streaming generation for one-off requests

### 4. Chat API Route (`api.chat.ts`)

Implements the streaming chat endpoint following AI SDK patterns:

```typescript
POST /api/chat
{
  "messages": [...],
  "modelConfig": {
    "provider": "OpenAI",
    "model": "gpt-4o",
    "maxTokens": 8192
  },
  "apiKey": "optional-custom-key"
}
```

**Features:**
- Streaming responses with `SwitchableStream`
- Automatic message continuation for long responses
- Proper error handling with detailed messages
- Support for custom API keys

## Usage Examples

### Basic Streaming Chat

```typescript
import { streamText } from '~/lib/.server/llm/stream-text';

const result = await streamText(
  messages,
  env,
  {
    toolChoice: 'none',
    onFinish: ({ text }) => {
      console.log('Finished:', text);
    }
  },
  undefined,
  {
    provider: 'OpenAI',
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.7
  }
);

// Use the stream
return result.toAIStream();
```

### Custom Provider with API Key

```typescript
const customApiKey = 'sk-custom-key';

const result = await streamText(
  messages,
  env,
  options,
  customApiKey,
  {
    provider: 'OpenAI',
    model: 'gpt-4o-mini'
  }
);
```

### Non-Streaming Generation

```typescript
import { generateText } from '~/lib/.server/llm/stream-text';

const { text } = await generateText(
  'What is an AI agent?',
  env,
  {
    provider: 'Anthropic',
    model: 'claude-3-5-sonnet-20240620',
    temperature: 0.5
  }
);

console.log(text);
```

## UI Integration

### Model Selector Component

The `ModelSelector` component allows users to switch between providers and models:

```tsx
import { ModelSelector } from '~/components/settings/ModelSelector';

export function Header() {
  return (
    <div>
      <ModelSelector />
    </div>
  );
}
```

**Features:**
- Dialog-based UI
- Provider and model selection
- localStorage persistence
- Visual feedback

### Chat Component Integration

```tsx
import { useChat } from 'ai/react';
import { selectedProviderStore, selectedModelStore } from '~/lib/stores/model';

const selectedProvider = useStore(selectedProviderStore);
const selectedModel = useStore(selectedModelStore);

const { messages, input, handleInputChange } = useChat({
  api: '/api/chat',
  body: {
    modelConfig: {
      provider: selectedProvider,
      model: selectedModel,
      maxTokens: 8192
    }
  }
});
```

## Best Practices

### 1. Provider Initialization

✅ **Do:**
```typescript
// Use the provider registry for caching
const model = getLanguageModel(provider, modelName, env);
```

❌ **Don't:**
```typescript
// Don't create new providers on every request
const anthropic = createAnthropic({ apiKey });
const model = anthropic(modelName);
```

### 2. Error Handling

✅ **Do:**
```typescript
try {
  const result = await streamText(messages, env, options, undefined, config);
  return result.toAIStream();
} catch (error) {
  console.error('Streaming error:', error);
  return new Response(JSON.stringify({ error: error.message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 3. Configuration Validation

✅ **Do:**
```typescript
// Always validate configuration
const config = validateModelConfig(userConfig);
```

❌ **Don't:**
```typescript
// Don't use user config directly
const model = getLanguageModel(userConfig.provider, userConfig.model, env);
```

### 4. Type Safety

✅ **Do:**
```typescript
import type { ModelConfig } from '~/lib/.server/llm/model';

const config: Partial<ModelConfig> = {
  provider: 'OpenAI',
  model: 'gpt-4o'
};
```

## Environment Variables

Set these environment variables based on which providers you want to use:

```bash
# Required - at least one provider
ANTHROPIC_API_KEY=sk-ant-xxx

# Optional
OPENAI_API_KEY=sk-xxx
GOOGLE_GENERATIVE_AI_API_KEY=xxx
```

## Advanced Features

### Custom Model Parameters

```typescript
const result = await streamText(messages, env, options, undefined, {
  provider: 'OpenAI',
  model: 'gpt-4o',
  maxTokens: 4096,
  temperature: 0.7,  // Control randomness (0-2)
  topP: 0.9         // Nucleus sampling (0-1)
});
```

### Provider-Specific Headers

Headers are automatically added based on provider:

```typescript
// Anthropic - adds beta header automatically
{
  headers: {
    'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15'
  }
}
```

### Message Continuation

Long responses are automatically continued:

```typescript
const options: StreamingOptions = {
  onFinish: async ({ text, finishReason }) => {
    if (finishReason === 'length') {
      // Automatically continue the message
      messages.push({ role: 'assistant', content: text });
      messages.push({ role: 'user', content: CONTINUE_PROMPT });
      
      const result = await streamText(messages, env, options, undefined, config);
      return stream.switchSource(result.toAIStream());
    }
  }
};
```

## Testing

Run tests to ensure everything works:

```bash
# Type checking
pnpm typecheck

# Unit tests
pnpm test

# Build verification
pnpm run build
```

## Performance Considerations

1. **Provider Caching**: Providers are cached to avoid recreation overhead
2. **Streaming**: Uses streaming for better perceived performance
3. **Error Recovery**: Implements automatic retry and continuation
4. **Type Safety**: Full TypeScript support prevents runtime errors

## Migration Guide

### From Old Architecture

**Before:**
```typescript
const model = getAnthropicModel(apiKey);
const result = await streamText(messages, env);
```

**After:**
```typescript
const model = getLanguageModel('Anthropic', 'claude-3-5-sonnet', env);
const result = await streamText(messages, env, options, undefined, {
  provider: 'Anthropic',
  model: 'claude-3-5-sonnet-20240620'
});
```

## Troubleshooting

### "API key not configured" Error

**Solution:** Set the appropriate environment variable for your provider:
```bash
export OPENAI_API_KEY=sk-xxx
```

### Model Not Found

**Solution:** Check that the model name is correct for the provider:
- Anthropic: `claude-3-5-sonnet-20240620`
- OpenAI: `gpt-4o`
- Google: `gemini-1.5-pro-latest`

### Type Errors

**Solution:** Import and use the correct types:
```typescript
import type { ModelConfig } from '~/lib/.server/llm/model';
```

## Resources

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI SDK GitHub](https://github.com/vercel/ai)
- [Anthropic Documentation](https://docs.anthropic.com/)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Google AI Documentation](https://ai.google.dev/)
