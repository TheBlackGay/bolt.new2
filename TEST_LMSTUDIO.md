# LM Studio Integration Testing Guide

This guide will help you verify that the LM Studio integration is working correctly with Bolt.new.

## Prerequisites

### 1. Install LM Studio
- Download from: https://lmstudio.ai/
- Install and open LM Studio

### 2. Download a Model
Recommended models for testing:
- **Llama 3.1 8B** (Fast, ~5GB) - Good for quick testing
- **Llama 3.1 70B** (Powerful, ~40GB) - Best quality
- **CodeLlama 7B** (Fast, ~4GB) - Good for code tasks

**How to download:**
1. Open LM Studio
2. Go to "Search" tab
3. Search for "llama-3.1-8b-instruct"
4. Click download
5. Wait for download to complete

### 3. Load the Model
1. Go to "Chat" tab in LM Studio
2. Click "Select a model to load"
3. Choose your downloaded model
4. Wait for model to load (you'll see "Model loaded" message)

### 4. Start Local Server
1. Go to "Local Server" tab in LM Studio
2. Click "Start Server"
3. Default port: 1234
4. Server URL: `http://localhost:1234`
5. Verify you see "Server running" message

## Testing Steps

### Test 1: Verify LM Studio Server

**Check server is running:**

```bash
# Test 1: Check server health
curl http://localhost:1234/v1/models

# Expected output (example):
# {
#   "data": [
#     {
#       "id": "llama-3.1-8b-instruct",
#       "object": "model",
#       "owned_by": "meta"
#     }
#   ]
# }
```

**✅ Success if:** You get a JSON response with model list  
**❌ Fail if:** Connection refused or timeout

---

### Test 2: Test Chat Completion

```bash
# Test 2: Send a chat request
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instruct",
    "messages": [
      {"role": "user", "content": "Say hello in one sentence."}
    ],
    "temperature": 0.7,
    "max_tokens": 50
  }'

# Expected: JSON response with generated text
```

**✅ Success if:** You get a response with generated text  
**❌ Fail if:** Error message or no response

---

### Test 3: Bolt.new Configuration

1. **Start Bolt.new:**
   ```bash
   cd /path/to/bolt.new
   pnpm run dev
   ```

2. **Open in browser:**
   - Go to http://localhost:5173
   - You should see the welcome screen

3. **Check default configuration:**
   - Look for model selector on welcome screen
   - Should show "Chat with: [Provider] [Model]"

---

### Test 4: Discover Models

1. **Open Configuration:**
   - Click model selector
   - Choose "OpenAICompatible" provider
   - Should show "Configure Custom Models" button
   - Click it

2. **Check LM Studio Endpoint:**
   - Should see "LM Studio" endpoint pre-configured
   - URL: `http://localhost:1234/v1`
   - Click on it to select

3. **Test Connection:**
   - Click the 🔌 (plug) icon next to "LM Studio"
   - Should see popup: "✅ Connection successful!"
   - Should ask: "Found X models. Would you like to import?"
   - Click "OK"

4. **Verify Import:**
   - Should see success message with model names
   - Models should appear in the list
   - Each model should show name and token limit

**✅ Success if:** Models are discovered and imported  
**❌ Fail if:** Connection error or no models found

---

### Test 5: Chat with Local Model

1. **Close configuration dialog**

2. **Select your model:**
   - In model selector, choose "OpenAICompatible"
   - Select your imported model (e.g., "Llama 3.1 8B Instruct")
   - Should see token limit displayed

3. **Send a test message:**
   ```
   User: "Write a simple hello world in Python"
   ```

4. **Verify response:**
   - Should see streaming response from LM Studio
   - Response should be relevant to the request
   - Should see code if you asked for code

**✅ Success if:** 
- Response streams correctly
- Content is relevant and correct
- No errors in browser console

**❌ Fail if:**
- No response
- Error messages
- Response doesn't make sense

---

### Test 6: Model Switching

1. **Start a conversation** with one model

2. **Switch models mid-conversation:**
   - Click model selector in header
   - Choose different model from OpenAICompatible
   - Continue conversation

3. **Verify:**
   - New messages use new model
   - No errors
   - Conversation continues naturally

**✅ Success if:** Model switching works seamlessly  
**❌ Fail if:** Errors or conversation breaks

---

## Troubleshooting

### Issue 1: Connection Refused

**Symptoms:**
```
❌ Connection failed: Network error
```

**Solutions:**
1. **Check LM Studio server is running:**
   - Go to "Local Server" tab in LM Studio
   - Should say "Server running"
   - Port should be 1234

2. **Verify port:**
   - Check LM Studio server port (default: 1234)
   - Update Bolt.new config if different

3. **Test with curl:**
   ```bash
   curl http://localhost:1234/v1/models
   ```

4. **Check firewall:**
   - Ensure localhost connections allowed
   - Disable firewall temporarily to test

---

### Issue 2: No Models Found

**Symptoms:**
```
ℹ️ All discovered models are already configured.
```
or no models in list

**Solutions:**
1. **Verify model is loaded in LM Studio:**
   - Go to "Chat" tab
   - Should show loaded model name
   - If not, load a model

2. **Check models endpoint:**
   ```bash
   curl http://localhost:1234/v1/models
   ```
   - Should return list with at least one model

3. **Clear and re-import:**
   - Delete existing models in Bolt.new config
   - Click "Discover Models" again

---

### Issue 3: Model Not Responding

**Symptoms:**
- Message sent but no response
- Spinning/loading forever
- Error in console

**Solutions:**
1. **Check LM Studio console:**
   - Look for errors in LM Studio
   - Model might have crashed
   - Try reloading model

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Verify model ID:**
   - Model ID in Bolt.new must match exactly
   - Check with: `curl http://localhost:1234/v1/models`
   - Use exact ID from response

4. **Check API compatibility:**
   - Ensure LM Studio is up to date
   - Some older versions may have issues

---

### Issue 4: Slow Responses

**Symptoms:**
- Model responds but very slowly
- System becomes laggy

**Solutions:**
1. **Use smaller model:**
   - Try 7B or 8B models instead of 70B
   - They're much faster on consumer hardware

2. **Check system resources:**
   - LM Studio uses CPU/GPU heavily
   - Close other applications
   - Monitor RAM usage

3. **Adjust settings in LM Studio:**
   - Reduce context length
   - Lower temperature
   - Adjust generation parameters

---

### Issue 5: Response Quality Issues

**Symptoms:**
- Model gives poor answers
- Responses don't make sense
- Wrong information

**Solutions:**
1. **Try different model:**
   - Some models are better for certain tasks
   - CodeLlama for code
   - Llama 3.1 for general chat

2. **Adjust parameters:**
   - Temperature (0.7 default, lower = more focused)
   - Max tokens (increase for longer responses)
   - System prompt (customize in LM Studio)

3. **Check model is fully loaded:**
   - LM Studio should show "Model loaded"
   - May take time for large models

---

## Verification Checklist

Use this checklist to verify everything works:

- [ ] LM Studio installed and running
- [ ] Model downloaded and loaded
- [ ] Local server started (port 1234)
- [ ] `curl` test to `/v1/models` succeeds
- [ ] `curl` test to `/v1/chat/completions` succeeds
- [ ] Bolt.new dev server running
- [ ] Can access Bolt.new in browser
- [ ] Can open configuration dialog
- [ ] Can see LM Studio endpoint
- [ ] Connection test succeeds
- [ ] Models discovered and imported
- [ ] Can select imported model
- [ ] Can send message and get response
- [ ] Response quality is good
- [ ] Can switch between models
- [ ] No errors in browser console
- [ ] No errors in LM Studio console

**If all checked:** ✅ Integration is working perfectly!

---

## Quick Test Script

Save this as `test_lmstudio.sh`:

```bash
#!/bin/bash

echo "=== LM Studio Integration Test ==="
echo ""

# Test 1: Server Health
echo "Test 1: Checking LM Studio server..."
if curl -s http://localhost:1234/v1/models > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding"
    echo "   Please start LM Studio server"
    exit 1
fi

# Test 2: List Models
echo ""
echo "Test 2: Listing available models..."
MODELS=$(curl -s http://localhost:1234/v1/models | jq -r '.data[].id' 2>/dev/null)
if [ -z "$MODELS" ]; then
    echo "❌ No models found"
    echo "   Please load a model in LM Studio"
    exit 1
else
    echo "✅ Found models:"
    echo "$MODELS" | while read model; do
        echo "   - $model"
    done
fi

# Test 3: Chat Completion
echo ""
echo "Test 3: Testing chat completion..."
FIRST_MODEL=$(echo "$MODELS" | head -1)
RESPONSE=$(curl -s http://localhost:1234/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d "{
        \"model\": \"$FIRST_MODEL\",
        \"messages\": [{\"role\": \"user\", \"content\": \"Say 'test'\"}],
        \"max_tokens\": 10
    }" | jq -r '.choices[0].message.content' 2>/dev/null)

if [ -z "$RESPONSE" ]; then
    echo "❌ Chat completion failed"
    exit 1
else
    echo "✅ Chat completion working"
    echo "   Response: $RESPONSE"
fi

echo ""
echo "=== All Tests Passed! ==="
echo ""
echo "You can now use LM Studio with Bolt.new:"
echo "1. Open Bolt.new: pnpm run dev"
echo "2. Go to http://localhost:5173"
echo "3. Select OpenAICompatible provider"
echo "4. Click 'Discover Models'"
echo "5. Start chatting!"
```

**Run with:**
```bash
chmod +x test_lmstudio.sh
./test_lmstudio.sh
```

---

## Expected Test Results

### ✅ Successful Test Output

```
=== LM Studio Integration Test ===

Test 1: Checking LM Studio server...
✅ Server is running

Test 2: Listing available models...
✅ Found models:
   - llama-3.1-8b-instruct

Test 3: Testing chat completion...
✅ Chat completion working
   Response: test

=== All Tests Passed! ===
```

### ❌ Failed Test Examples

**Server not running:**
```
Test 1: Checking LM Studio server...
❌ Server is not responding
   Please start LM Studio server
```

**No model loaded:**
```
Test 2: Listing available models...
❌ No models found
   Please load a model in LM Studio
```

---

## Performance Benchmarks

Expected performance on different hardware:

### M1 Mac / AMD Ryzen 9
- 7B models: ~20-40 tokens/sec
- 13B models: ~10-20 tokens/sec
- 70B models: Requires GPU, ~5-10 tokens/sec

### Intel i7 / AMD Ryzen 5
- 7B models: ~10-20 tokens/sec
- 13B models: ~5-10 tokens/sec
- 70B models: Very slow without GPU

### High-end GPU (RTX 4090, etc.)
- 7B models: ~100+ tokens/sec
- 13B models: ~50+ tokens/sec
- 70B models: ~20-30 tokens/sec

---

## Next Steps

After successful testing:

1. **Try different models:**
   - Download more models
   - Compare quality and speed
   - Find best for your use case

2. **Customize configuration:**
   - Adjust token limits
   - Try different temperatures
   - Experiment with prompts

3. **Production use:**
   - Use larger models for better quality
   - Use smaller models for speed
   - Mix based on task complexity

---

## Support

If you encounter issues:

1. Check LM Studio console for errors
2. Check browser DevTools console
3. Review this troubleshooting guide
4. Check LM Studio documentation: https://lmstudio.ai/docs
5. Open issue on GitHub with test results

---

**Ready to test? Start with Test 1 and work through each step!** 🚀
