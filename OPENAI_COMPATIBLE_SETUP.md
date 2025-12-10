# OpenAI Compatible Provider Setup Guide

Bolt.new now supports any OpenAI-compatible API endpoint, allowing you to use local models, custom deployments, or alternative AI providers.

> **🆕 New Feature**: You can now configure custom endpoints and models directly in the UI! See [CUSTOM_MODELS_GUIDE.md](./CUSTOM_MODELS_GUIDE.md) for the visual configuration guide.

## What is OpenAI Compatible?

The OpenAI Compatible provider allows you to connect to any service that implements the OpenAI API specification. Bolt.new uses the `chatModel()` method for better compatibility with services like LM Studio and Ollama.

This includes:

- **Local Models**: LM Studio, Ollama, LocalAI, llama.cpp
- **Cloud Services**: Azure AI, Together AI, Groq, Perplexity
- **Custom Deployments**: Your own hosted models
- **Development Servers**: Local inference servers

## Quick Start

### Option A: UI Configuration (Recommended) 🆕

The easiest way to configure custom models:

1. Open Bolt.new
2. Click model selector (in header or on welcome screen)
3. Choose "OpenAICompatible" provider
4. Click "Configure Custom Models"
5. Add your endpoint and models visually

See [CUSTOM_MODELS_GUIDE.md](./CUSTOM_MODELS_GUIDE.md) for detailed UI guide.

### Option B: Environment Variables (Advanced)

For system-wide or deployment configuration:

```bash
# .env.local
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
OPENAI_COMPATIBLE_API_KEY=not-needed  # Optional for local deployments
```

### 2. With Authentication

```bash
# .env.local
OPENAI_COMPATIBLE_BASE_URL=https://api.your-service.com/v1
OPENAI_COMPATIBLE_API_KEY=your-api-key-here
```

### 3. With Custom Headers

```bash
# .env.local
OPENAI_COMPATIBLE_BASE_URL=https://api.your-service.com/v1
OPENAI_COMPATIBLE_API_KEY=your-api-key
OPENAI_COMPATIBLE_HEADERS='{"X-Custom-Header":"value","X-Another":"value"}'
```

## Supported Services

### LM Studio

**Setup:**
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load a model (e.g., Llama 3.1, Mistral, CodeLlama)
3. Start the local server (default: http://localhost:1234)

**Configuration:**
```bash
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
# No API key needed for local deployment
```

**Recommended Models:**
- `llama-3.1-70b` - Best for general tasks
- `codellama-34b` - Best for coding
- `mistral-7b` - Fast and efficient

---

### Ollama

**Setup:**
1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull llama3.1`
3. The server runs on http://localhost:11434

**Configuration:**
```bash
OPENAI_COMPATIBLE_BASE_URL=http://localhost:11434/v1
```

---

### Together AI

**Setup:**
1. Sign up at [Together AI](https://together.ai/)
2. Get your API key

**Configuration:**
```bash
OPENAI_COMPATIBLE_BASE_URL=https://api.together.xyz/v1
OPENAI_COMPATIBLE_API_KEY=your-together-api-key
```

---

### Groq

**Setup:**
1. Sign up at [Groq](https://groq.com/)
2. Get your API key

**Configuration:**
```bash
OPENAI_COMPATIBLE_BASE_URL=https://api.groq.com/openai/v1
OPENAI_COMPATIBLE_API_KEY=your-groq-api-key
```

---

### Azure OpenAI

**Setup:**
1. Deploy a model in Azure OpenAI
2. Get your endpoint and API key

**Configuration:**
```bash
OPENAI_COMPATIBLE_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment
OPENAI_COMPATIBLE_API_KEY=your-azure-api-key
OPENAI_COMPATIBLE_HEADERS='{"api-version":"2024-02-15-preview"}'
```

---

### LocalAI

**Setup:**
1. Install [LocalAI](https://localai.io/)
2. Start the server with your model

**Configuration:**
```bash
OPENAI_COMPATIBLE_BASE_URL=http://localhost:8080/v1
```

---

## Model Configuration

The following models are pre-configured for OpenAI Compatible provider:

| Model ID | Label | Max Tokens | Best For |
|----------|-------|------------|----------|
| `llama-3.1-70b` | Llama 3.1 70B | 8192 | General purpose, reasoning |
| `llama-3.1-8b` | Llama 3.1 8B | 8192 | Fast responses |
| `codellama-34b` | CodeLlama 34B | 4096 | Code generation |
| `mistral-7b` | Mistral 7B | 8192 | Efficient, balanced |

### Adding Custom Models

You can use any model available on your endpoint. The model selection is just a reference - the actual model served depends on your backend configuration.

## Advanced Configuration

### Custom Headers

Some services require custom headers. Set them as a JSON string:

```bash
OPENAI_COMPATIBLE_HEADERS='{"Authorization":"Bearer custom-token","X-Custom":"value"}'
```

### Query Parameters

For services requiring query parameters (like Azure API version):

```bash
OPENAI_COMPATIBLE_BASE_URL=https://api.example.com/v1?api-version=2024-02-15
```

### Multiple Endpoints

To use multiple OpenAI Compatible endpoints, you'll need to:

1. Set up one as the default via environment variables
2. For others, you can modify the provider configuration in code

## Usage in Bolt.new

1. **Start your OpenAI compatible service**
   ```bash
   # Example: LM Studio
   # Just start the local server
   ```

2. **Configure environment variables**
   ```bash
   # .env.local
   OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
   ```

3. **Start Bolt.new**
   ```bash
   pnpm run dev
   ```

4. **Select the model**
   - Start a chat
   - Click the model selector in the header
   - Choose "OpenAICompatible" provider
   - Select your model

## Troubleshooting

### Connection Refused

**Problem:** Cannot connect to the endpoint

**Solutions:**
- Verify the service is running: `curl http://localhost:1234/v1/models`
- Check the URL format (must include `/v1`)
- Ensure no firewall is blocking the connection

### Model Not Found

**Problem:** Selected model doesn't work

**Solution:**
- Check what models are available: `curl http://localhost:1234/v1/models`
- Make sure the model ID matches exactly
- For local services, ensure the model is loaded

### Authentication Failed

**Problem:** 401 Unauthorized error

**Solutions:**
- Verify your API key is correct
- Check if the service requires specific headers
- Try without API key for local deployments

### Slow Response

**Problem:** Model responses are slow

**Solutions:**
- Use a smaller model (e.g., 8B instead of 70B)
- Check your hardware (GPU recommended for local models)
- Consider cloud services for better performance

### Invalid Response Format

**Problem:** API returns unexpected format

**Solution:**
- Ensure the service implements OpenAI API spec
- Check API version compatibility
- Verify baseURL includes `/v1` suffix

## Performance Tips

### For Local Deployment

1. **Hardware Requirements:**
   - 7B models: 8GB+ RAM
   - 13B models: 16GB+ RAM
   - 34B models: 32GB+ RAM or GPU
   - 70B models: GPU with 24GB+ VRAM recommended

2. **Optimization:**
   - Use quantized models (e.g., Q4, Q5)
   - Enable GPU acceleration if available
   - Use models appropriate for your hardware

### For Cloud Services

1. **Cost Optimization:**
   - Use smaller models for simple tasks
   - Monitor token usage
   - Consider rate limits

2. **Latency:**
   - Choose providers with servers near you
   - Use appropriate timeout settings
   - Consider caching strategies

## Security Considerations

### Local Deployment

- ✅ Data stays on your machine
- ✅ No external API calls
- ⚠️ Ensure server is not exposed to internet

### Remote Services

- ⚠️ Data sent to third-party service
- ✅ Use HTTPS connections
- ✅ Keep API keys secure
- ⚠️ Review provider's privacy policy

### Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for configuration
3. **Rotate keys regularly** for cloud services
4. **Monitor usage** to detect anomalies
5. **Use HTTPS** for remote connections

## Example Configurations

### Development (LM Studio)

```bash
# .env.local
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
```

### Production (Together AI)

```bash
# Production environment variables
OPENAI_COMPATIBLE_BASE_URL=https://api.together.xyz/v1
OPENAI_COMPATIBLE_API_KEY=${TOGETHER_API_KEY}
```

### Multi-Provider Setup

```bash
# Default providers
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# OpenAI Compatible for local development
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
```

## Testing Your Setup

### 1. Test Endpoint Connection

```bash
curl http://localhost:1234/v1/models
```

Expected response:
```json
{
  "data": [
    {
      "id": "llama-3.1-70b",
      "object": "model",
      ...
    }
  ]
}
```

### 2. Test Chat Completion

```bash
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 3. Test in Bolt.new

1. Start Bolt.new: `pnpm run dev`
2. Navigate to http://localhost:5173
3. Start a chat
4. Select OpenAICompatible provider
5. Send a message

## Migration Guide

### From OpenAI to OpenAI Compatible

**Before:**
```bash
OPENAI_API_KEY=sk-xxx
```

**After:**
```bash
# Keep OpenAI
OPENAI_API_KEY=sk-xxx

# Add compatible endpoint
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
```

### From Anthropic to Local Model

**Before:**
- Using Claude via Anthropic API

**After:**
- Set up LM Studio with Llama 3.1
- Configure OpenAI Compatible
- Switch provider in UI

## Resources

### Documentation
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [LM Studio Docs](https://lmstudio.ai/docs)

### Community
- [Bolt.new GitHub](https://github.com/stackblitz/bolt.new)
- [AI SDK GitHub](https://github.com/vercel/ai)
- [LM Studio Discord](https://discord.gg/lmstudio)

### Models
- [Hugging Face Models](https://huggingface.co/models)
- [Ollama Model Library](https://ollama.ai/library)
- [LM Studio Model Library](https://lmstudio.ai/models)

## FAQ

**Q: Do I need an API key for local models?**  
A: No, local deployments typically don't require API keys. You can leave it empty or set a dummy value.

**Q: Can I use multiple OpenAI Compatible endpoints?**  
A: Currently, one endpoint at a time via environment variables. Multi-endpoint support is planned.

**Q: What's the difference between this and native OpenAI?**  
A: This provider is for OpenAI-compatible services. Use native OpenAI provider for official OpenAI API.

**Q: Why is my local model slow?**  
A: Large models require significant compute. Use smaller models or GPU acceleration.

**Q: Can I use this in production?**  
A: Yes! It works with cloud services like Together AI, Groq, etc.

**Q: How do I know what model IDs to use?**  
A: Query the `/v1/models` endpoint or check your service's documentation.

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [AI_SDK_INTEGRATION.md](./AI_SDK_INTEGRATION.md)
3. Open an issue on [GitHub](https://github.com/stackblitz/bolt.new/issues)
