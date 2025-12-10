# Custom Models Configuration Guide

Bolt.new now supports custom OpenAI Compatible endpoints with a visual configuration interface. You can add, edit, and manage multiple endpoints and their models directly from the UI.

## 🎯 Overview

The Custom Models feature allows you to:
- **Add multiple endpoints**: Configure LM Studio, Ollama, Together AI, etc.
- **Manage models per endpoint**: Add/remove models for each service
- **Test connections**: Verify endpoints before using them
- **Switch easily**: Select active endpoint and model on the fly
- **Persistent storage**: All configurations saved in browser

## 🚀 Quick Start

### 1. Open Configuration

**From Header (during chat):**
1. Click the model selector button (shows current model)
2. Select "OpenAICompatible" provider
3. Click "Configure Custom Models" button

**From Initial Screen:**
1. On the welcome screen, you'll see model selection
2. Select "OpenAICompatible" from provider dropdown
3. Configuration automatically uses custom endpoints

### 2. Add Your First Endpoint

1. Click "+ Add Endpoint"
2. Fill in the details:
   - **Name**: "LM Studio" (or any friendly name)
   - **Base URL**: `http://localhost:1234/v1`
   - **API Key**: (leave empty for local)
3. Click "Save"

### 3. Add Models

#### Option A: Auto-Discovery (Recommended) 🆕

1. Select your endpoint from the list
2. Click **"🔍 Discover Models"** button
3. Wait a moment while Bolt.new queries the endpoint
4. Review the list of found models (e.g., "Found 5 models")
5. Click **"OK"** to import all models automatically
6. Done! All models are now configured with:
   - Exact model IDs from the endpoint
   - Auto-generated friendly names
   - Intelligent token limit detection

#### Option B: Manual Entry

1. Select your endpoint from the list
2. Click "+ Add Manually"
3. Fill in model details:
   - **Model ID**: `llama-3.1-70b` (exact model ID)
   - **Display Name**: "Llama 3.1 70B" (friendly name)
   - **Max Tokens**: 8192
4. Click "Add Model"

**💡 Tip:** Auto-discovery is much faster and more accurate! Use manual entry only if auto-discovery doesn't work for your endpoint.

### 4. Test & Use

1. Click the plug icon (🔌) to test connection
2. If successful, close the configuration
3. Your models are now available in the model selector!

## 📝 Detailed Configuration

### Endpoint Configuration

#### Required Fields

**Name**
- Friendly name for the endpoint
- Example: "LM Studio", "Ollama", "Together AI"
- Used in UI to identify the endpoint

**Base URL**
- Full URL to the OpenAI-compatible API
- Must end with `/v1`
- Examples:
  - Local: `http://localhost:1234/v1`
  - Remote: `https://api.together.xyz/v1`

#### Optional Fields

**API Key**
- Authentication key for the service
- Not required for local deployments
- Required for cloud services
- Stored securely in browser localStorage

### Model Configuration

#### Required Fields

**Model ID**
- Exact identifier used by the API
- Must match the model name on the endpoint
- Examples: `llama-3.1-70b`, `codellama-34b`, `mistral-7b`

**Display Name**
- Human-readable name shown in UI
- Can be anything descriptive
- Examples: "Llama 3.1 70B", "CodeLlama 34B"

**Max Tokens**
- Maximum token limit for the model
- Used to enforce context limits
- Common values: 4096, 8192, 16384

## 🎨 UI Features

### Endpoint Management

**List View**
- Shows all configured endpoints
- Displays URL and model count
- Click to select active endpoint
- Highlight shows selected endpoint

**Actions**
- 🔌 **Test**: Verify endpoint connection
- ✏️ **Edit**: Modify endpoint settings
- 🗑️ **Delete**: Remove endpoint (with confirmation)

### Model Management

**Per-Endpoint Models**
- Models are organized by endpoint
- Only shows models for selected endpoint
- Add as many models as needed
- Delete models individually

**Model Display**
- Shows display name prominently
- Lists model ID and max tokens
- Clear visual hierarchy

### Connection Testing

**Test Button**
- Sends request to `/models` endpoint
- Verifies API accessibility
- Shows success/error message
- No models required to test

## 💡 Common Configurations

### LM Studio (Local)

```
Name: LM Studio
Base URL: http://localhost:1234/v1
API Key: (empty)

Models:
- ID: llama-3.1-70b-instruct
  Name: Llama 3.1 70B Instruct
  Tokens: 8192

- ID: codellama-34b-instruct
  Name: CodeLlama 34B
  Tokens: 4096
```

### Ollama (Local)

```
Name: Ollama
Base URL: http://localhost:11434/v1
API Key: (empty)

Models:
- ID: llama3.1
  Name: Llama 3.1
  Tokens: 8192

- ID: codellama
  Name: CodeLlama
  Tokens: 4096

- ID: mistral
  Name: Mistral 7B
  Tokens: 8192
```

### Together AI (Cloud)

```
Name: Together AI
Base URL: https://api.together.xyz/v1
API Key: your-together-api-key

Models:
- ID: meta-llama/Llama-3-70b-chat-hf
  Name: Llama 3 70B Chat
  Tokens: 8192

- ID: codellama/CodeLlama-34b-Instruct-hf
  Name: CodeLlama 34B Instruct
  Tokens: 16384
```

### Groq (Cloud)

```
Name: Groq
Base URL: https://api.groq.com/openai/v1
API Key: your-groq-api-key

Models:
- ID: llama-3.1-70b-versatile
  Name: Llama 3.1 70B (Groq)
  Tokens: 8192

- ID: mixtral-8x7b-32768
  Name: Mixtral 8x7B
  Tokens: 32768
```

### Azure OpenAI (Enterprise)

```
Name: Azure OpenAI
Base URL: https://your-resource.openai.azure.com/openai/deployments/your-deployment-name/v1
API Key: your-azure-api-key

Models:
- ID: gpt-4
  Name: GPT-4 (Azure)
  Tokens: 8192
```

## 🔧 Advanced Features

### Auto-Discovery of Models 🆕

Bolt.new can automatically discover and import models from any OpenAI-compatible endpoint!

**How it works:**
1. Click "🔍 Discover Models" or test connection (🔌)
2. Bolt.new queries the `/v1/models` endpoint
3. Parses the response to find all available models
4. Generates friendly names automatically
5. Estimates token limits intelligently
6. Imports all models with one click

**Auto-Generated Names:**
- `llama-3.1-70b-instruct` → "Llama 3.1 70B Instruct"
- `codellama-34b` → "Codellama 34B"
- `meta-llama/Llama-3-70b` → "Meta Llama Llama 3 70B"

**Token Limit Detection:**
- Uses `context_length` from API response if available
- Parses model ID for hints (e.g., "32k", "16384")
- Falls back to sensible defaults (8192 tokens)

**Duplicate Prevention:**
- Skips models that are already configured
- Shows count of newly imported models
- Won't duplicate existing models

### Multiple Endpoints

You can configure multiple endpoints and switch between them:

1. **Development**: Local LM Studio for testing
2. **Production**: Together AI for deployment
3. **Backup**: Groq for failover

Simply select different endpoint from the list!

### Manual Model Discovery

If auto-discovery doesn't work, you can query manually:

```bash
# Query the models endpoint
curl http://localhost:1234/v1/models

# Response shows available models
{
  "data": [
    { "id": "llama-3.1-70b", ... },
    { "id": "codellama-34b", ... }
  ]
}
```

### Custom Headers

Currently configured via environment variables:
```bash
OPENAI_COMPATIBLE_HEADERS='{"X-Custom":"value"}'
```

Future versions will support per-endpoint custom headers in the UI.

## 🐛 Troubleshooting

### Connection Test Fails

**Error: Network Error**
- Check if the service is running
- Verify the URL is correct
- Ensure no firewall blocking
- Try: `curl http://localhost:1234/v1/models`

**Error: 401 Unauthorized**
- API key might be required
- Check API key is correct
- Verify key has proper permissions

**Error: 404 Not Found**
- URL might be incorrect
- Ensure path ends with `/v1`
- Check service documentation

### Auto-Discovery Not Working

**No models found**
- Endpoint might not support `/v1/models` endpoint
- Try manual discovery with curl
- Add models manually instead

**Wrong model format**
- Some endpoints return non-standard format
- Check API documentation
- Add models manually with correct IDs

**Models not responding correctly**
- Bolt.new uses `chatModel()` for OpenAI Compatible providers
- This ensures compatibility with LM Studio, Ollama, etc.
- If issues persist, check the model is loaded and running

### Model Not Working

**Model ID doesn't match**
- Use "🔍 Discover Models" to get exact IDs
- Or query `/v1/models` manually to see available IDs
- Use exact ID from the response
- Case-sensitive!

**Context too long**
- Reduce max tokens setting
- Try shorter prompts
- Check model's actual limit

**Slow responses**
- Local: Check hardware (CPU/GPU)
- Cloud: Check network latency
- Consider smaller model

### Configuration Not Saved

**Changes lost on refresh**
- Check browser localStorage is enabled
- Try different browser
- Check for browser extensions blocking storage

**Can't delete endpoint**
- Must have at least one endpoint
- Try adding another first
- Then delete the old one

## 📊 Data Storage

### Where Configuration is Stored

All custom endpoint and model configurations are stored in:
- **Browser localStorage**
- **Key**: `customEndpoints`
- **Format**: JSON array

### Data Structure

```json
[
  {
    "id": "lm-studio",
    "name": "LM Studio",
    "baseURL": "http://localhost:1234/v1",
    "apiKey": "optional-key",
    "models": [
      {
        "id": "llama-3.1-70b",
        "name": "Llama 3.1 70B",
        "maxTokens": 8192
      }
    ]
  }
]
```

### Backup & Restore

**Backup Configuration:**
1. Open browser DevTools (F12)
2. Go to Application/Storage → localStorage
3. Find `customEndpoints` key
4. Copy the value

**Restore Configuration:**
1. Open browser DevTools
2. Go to localStorage
3. Set `customEndpoints` with your backup
4. Refresh Bolt.new

### Export/Import (Manual)

```javascript
// Export
const config = localStorage.getItem('customEndpoints');
console.log(config); // Copy this

// Import
localStorage.setItem('customEndpoints', 'paste-config-here');
location.reload();
```

## 🔒 Security Considerations

### Local Endpoints
- ✅ Data stays on your machine
- ✅ No external API calls
- ⚠️ Ensure service not exposed to internet

### Cloud Endpoints
- ⚠️ API keys stored in browser localStorage
- ⚠️ Data sent to third-party service
- ✅ Uses HTTPS for encryption
- ✅ Keys not visible in network tab

### Best Practices

1. **Never share localStorage data** - contains API keys
2. **Use HTTPS** for remote endpoints
3. **Rotate keys regularly** for cloud services
4. **Test with non-sensitive data** first
5. **Review provider privacy policies**

## 💡 Tips & Tricks

### Quick Setup for LM Studio

1. Start LM Studio
2. Load a model
3. Start server (default port 1234)
4. In Bolt.new:
   - Add endpoint: `http://localhost:1234/v1`
   - Test connection
   - Add your loaded model

Done! No API keys needed.

### Finding Model IDs

**LM Studio:**
- Check the model card in LM Studio
- Or query: `curl http://localhost:1234/v1/models`

**Ollama:**
- Run: `ollama list`
- Use model name as ID

**Cloud Services:**
- Check provider documentation
- Usually in format: `provider/model-name`

### Optimizing Token Limits

**Set realistic limits:**
- Too high: Wasted context, slower
- Too low: Truncated responses
- Sweet spot: Model's actual limit

**Common limits:**
- 7B models: 4096-8192
- 13B models: 8192
- 34B models: 4096-16384
- 70B models: 8192-32768

### Performance Tips

**Local Models:**
- Use quantized versions (Q4, Q5)
- Enable GPU acceleration
- Close other applications
- Use appropriate model size

**Cloud Services:**
- Choose nearest region
- Use CDN if available
- Monitor rate limits
- Consider caching

## 🆕 Default Endpoints

Bolt.new comes with two pre-configured endpoints:

### 1. LM Studio (Default)
- URL: `http://localhost:1234/v1`
- Pre-configured models: Llama 3.1 70B, Llama 3.1 8B, CodeLlama 34B

### 2. Ollama
- URL: `http://localhost:11434/v1`
- Pre-configured models: Llama 3.1, CodeLlama, Mistral

You can edit or delete these anytime!

## 📚 Related Documentation

- [OPENAI_COMPATIBLE_SETUP.md](./OPENAI_COMPATIBLE_SETUP.md) - Setup guides
- [AI_SDK_INTEGRATION.md](./AI_SDK_INTEGRATION.md) - Technical architecture
- [MODEL_CONFIGURATION.md](./MODEL_CONFIGURATION.md) - General model config

## 🎯 Use Cases

### Solo Developer
- Configure LM Studio locally
- No API costs during development
- Privacy-first coding assistant

### Team Development
- Share endpoint configurations
- Standardize on specific models
- Track usage internally

### Enterprise
- Use Azure OpenAI endpoints
- Corporate compliance friendly
- Data stays within infrastructure

### AI Experimentation
- Test multiple providers
- Compare model performance
- Quick A/B testing

## 🚀 Future Enhancements

Planned features:
- [ ] Import/export configurations
- [ ] Auto-discover models from endpoint
- [ ] Per-endpoint custom headers in UI
- [ ] Model capabilities/tags
- [ ] Performance metrics
- [ ] Usage statistics
- [ ] Shared configurations
- [ ] Cloud sync (optional)

## ❓ FAQ

**Q: Can I use multiple endpoints simultaneously?**
A: You can configure multiple endpoints but only one is active at a time. Switch between them in the configuration.

**Q: Are my API keys secure?**
A: Keys are stored in browser localStorage. They're not sent anywhere except the configured endpoint. Use environment variables for production deployments.

**Q: Can I share my configuration?**
A: Yes! Export your localStorage `customEndpoints` key and share with team members. They can import it manually.

**Q: What if I delete all endpoints?**
A: Bolt.new will recreate default endpoints (LM Studio and Ollama) on next load.

**Q: Does this work offline?**
A: Yes! Local endpoints (LM Studio, Ollama) work completely offline.

**Q: Can I use this in production?**
A: Yes! Configure your production endpoints and deploy. Consider using environment variables for sensitive keys.

## 🆘 Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Verify your endpoint is accessible
3. Test connection using curl
4. Check browser console for errors
5. Open issue on [GitHub](https://github.com/stackblitz/bolt.new/issues)

## 🎓 Examples

### Complete Setup: LM Studio

```bash
# 1. Download and install LM Studio
# https://lmstudio.ai/

# 2. Load Llama 3.1 70B model

# 3. Start local server (port 1234)

# 4. Test connection
curl http://localhost:1234/v1/models
```

In Bolt.new:
1. Open model selector
2. Choose "OpenAICompatible"
3. Click "Configure Custom Models"
4. Select "LM Studio" endpoint
5. Click "+ Add Model"
6. Add: `llama-3.1-70b` / "Llama 3.1 70B" / 8192
7. Save and start chatting!

### Complete Setup: Together AI

```bash
# 1. Sign up at https://together.ai/
# 2. Get API key from dashboard
```

In Bolt.new:
1. Open configuration
2. Click "+ Add Endpoint"
3. Fill:
   - Name: "Together AI"
   - URL: `https://api.together.xyz/v1`
   - Key: Your API key
4. Save endpoint
5. Add models from Together AI catalog
6. Test connection
7. Start using!

---

**Happy configuring! 🚀**

For more help, see [OPENAI_COMPATIBLE_SETUP.md](./OPENAI_COMPATIBLE_SETUP.md)
