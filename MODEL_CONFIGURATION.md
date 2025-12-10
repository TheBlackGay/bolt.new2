# AI Model Configuration Guide

This project now supports multiple AI model providers. You can switch between different providers and models directly from the UI.

## Supported Providers

### 1. Anthropic (Claude)
- **Models:**
  - Claude 3.5 Sonnet (Default)
  - Claude 3 Opus
  - Claude 3 Sonnet
  - Claude 3 Haiku

**Environment Variable:** `ANTHROPIC_API_KEY`

Get your API key from: https://console.anthropic.com/

### 2. OpenAI (GPT)
- **Models:**
  - GPT-4o
  - GPT-4o Mini
  - GPT-4 Turbo
  - GPT-3.5 Turbo

**Environment Variable:** `OPENAI_API_KEY`

Get your API key from: https://platform.openai.com/api-keys

### 3. Google (Gemini)
- **Models:**
  - Gemini 1.5 Pro
  - Gemini 1.5 Flash

**Environment Variable:** `GOOGLE_GENERATIVE_AI_API_KEY`

Get your API key from: https://makersuite.google.com/app/apikey

### 4. OpenAI Compatible (Local & Custom Models)
- **Models:**
  - Llama 3.1 70B
  - Llama 3.1 8B
  - CodeLlama 34B
  - Mistral 7B
  - Any custom model you configure

**Configuration Methods:**
- 🆕 **UI Configuration** (Recommended): Configure endpoints and models visually
- **Environment Variables**: System-wide configuration

**Environment Variables:** 
- `OPENAI_COMPATIBLE_BASE_URL` (optional, fallback)
- `OPENAI_COMPATIBLE_API_KEY` (optional)
- `OPENAI_COMPATIBLE_HEADERS` (optional)

**Supported Services:**
- LM Studio (local models)
- Ollama (local models)
- Together AI
- Groq
- Azure OpenAI
- LocalAI
- Any OpenAI-compatible API

**Documentation:**
- [CUSTOM_MODELS_GUIDE.md](./CUSTOM_MODELS_GUIDE.md) - Visual configuration guide 🆕
- [OPENAI_COMPATIBLE_SETUP.md](./OPENAI_COMPATIBLE_SETUP.md) - Detailed setup guide

## Setup Instructions

### Development Environment

1. Create or update your `.env.local` file in the project root:

```bash
# Required - at least one provider must be configured
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional - add these if you want to use other providers
OPENAI_API_KEY=your_openai_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key_here

# OpenAI Compatible - for local or custom models
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1  # LM Studio default
OPENAI_COMPATIBLE_API_KEY=optional_for_local         # Optional for local models
```

2. Restart your development server after adding new keys

### Production Deployment (Cloudflare)

Add the environment variables to your Cloudflare Pages project:

1. Go to your Cloudflare Pages project
2. Navigate to Settings > Environment Variables
3. Add the API keys for the providers you want to use

```bash
# Using wrangler CLI
wrangler pages secret put ANTHROPIC_API_KEY
wrangler pages secret put OPENAI_API_KEY
wrangler pages secret put GOOGLE_GENERATIVE_AI_API_KEY
wrangler pages secret put OPENAI_COMPATIBLE_BASE_URL
wrangler pages secret put OPENAI_COMPATIBLE_API_KEY
```

## Using the Model Selector

1. Start a chat session (the model selector appears in the header after chat starts)
2. Click on the model selector button showing the current model
3. Select your desired provider (Anthropic, OpenAI, or Google)
4. Choose a specific model from that provider
5. The new model will be used for all subsequent messages

**Note:** Your selection is saved in browser localStorage and will persist across sessions.

## Model Capabilities

| Model | Provider | Max Tokens | Best For |
|-------|----------|------------|----------|
| Claude 3.5 Sonnet | Anthropic | 8192 | Balanced performance & coding |
| Claude 3 Opus | Anthropic | 4096 | Complex reasoning tasks |
| GPT-4o | OpenAI | 8192 | General purpose, latest features |
| GPT-4o Mini | OpenAI | 8192 | Fast, cost-effective |
| Gemini 1.5 Pro | Google | 8192 | Advanced reasoning |
| Gemini 1.5 Flash | Google | 8192 | Fast responses |
| Llama 3.1 70B | OpenAICompatible | 8192 | Local/custom deployment |
| CodeLlama 34B | OpenAICompatible | 4096 | Code generation (local) |

## Troubleshooting

### "API key not configured" error

This means the selected provider's API key is not set in your environment variables. Either:
- Add the missing API key to your `.env.local` file
- Switch to a provider that has an API key configured

### Model not responding

1. Check that your API key is valid
2. Verify you have credits/quota available with the provider
3. Check the browser console for detailed error messages
4. Ensure your firewall/network allows connections to the AI provider

## Cost Considerations

Different models have different pricing structures:
- Check each provider's pricing page for current rates
- Smaller models (like GPT-4o Mini, Claude 3 Haiku) are more cost-effective
- Monitor your usage through each provider's dashboard

## Technical Details

The model configuration is stored in two places:
1. **Browser localStorage**: Persists your selection across sessions
2. **Request body**: Sent with each API call to use the selected model

The backend automatically routes requests to the appropriate provider based on your selection.
