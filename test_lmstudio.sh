#!/bin/bash

echo "=== LM Studio Integration Test ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Server Health
echo "Test 1: Checking LM Studio server..."
if curl -s -f http://localhost:1234/v1/models > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not responding${NC}"
    echo "   Please start LM Studio server on port 1234"
    echo ""
    echo "How to start:"
    echo "1. Open LM Studio"
    echo "2. Go to 'Local Server' tab"
    echo "3. Click 'Start Server'"
    exit 1
fi

# Test 2: List Models
echo ""
echo "Test 2: Listing available models..."
MODELS_JSON=$(curl -s http://localhost:1234/v1/models 2>/dev/null)

if command -v jq > /dev/null 2>&1; then
    MODELS=$(echo "$MODELS_JSON" | jq -r '.data[].id' 2>/dev/null)
else
    # Fallback if jq not installed
    MODELS=$(echo "$MODELS_JSON" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$MODELS" ]; then
    echo -e "${RED}❌ No models found${NC}"
    echo "   Please load a model in LM Studio"
    echo ""
    echo "How to load a model:"
    echo "1. Open LM Studio"
    echo "2. Go to 'Chat' tab"
    echo "3. Click 'Select a model to load'"
    echo "4. Choose a downloaded model"
    exit 1
else
    echo -e "${GREEN}✅ Found models:${NC}"
    echo "$MODELS" | while read -r model; do
        echo "   - $model"
    done
    MODEL_COUNT=$(echo "$MODELS" | wc -l)
    echo "   Total: $MODEL_COUNT model(s)"
fi

# Test 3: Chat Completion
echo ""
echo "Test 3: Testing chat completion..."
FIRST_MODEL=$(echo "$MODELS" | head -1)
echo "   Using model: $FIRST_MODEL"

CHAT_RESPONSE=$(curl -s http://localhost:1234/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d "{
        \"model\": \"$FIRST_MODEL\",
        \"messages\": [{\"role\": \"user\", \"content\": \"Reply with just the word 'SUCCESS' and nothing else.\"}],
        \"max_tokens\": 10,
        \"temperature\": 0.1
    }" 2>/dev/null)

if command -v jq > /dev/null 2>&1; then
    RESPONSE=$(echo "$CHAT_RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null)
else
    # Fallback if jq not installed
    RESPONSE=$(echo "$CHAT_RESPONSE" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$RESPONSE" ] || [ "$RESPONSE" = "null" ]; then
    echo -e "${RED}❌ Chat completion failed${NC}"
    echo "   Model might not be responding correctly"
    echo ""
    echo "Debug info:"
    echo "$CHAT_RESPONSE" | head -c 200
    exit 1
else
    echo -e "${GREEN}✅ Chat completion working${NC}"
    echo "   Model response: $RESPONSE"
fi

# Test 4: Model Info
echo ""
echo "Test 4: Checking model information..."
if command -v jq > /dev/null 2>&1; then
    MODEL_INFO=$(echo "$MODELS_JSON" | jq -r '.data[0] | "ID: \(.id)\nType: \(.object)"' 2>/dev/null)
    echo -e "${GREEN}✅ Model info retrieved${NC}"
    echo "$MODEL_INFO" | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  Install 'jq' for detailed model info${NC}"
fi

# Summary
echo ""
echo "=== All Tests Passed! ==="
echo ""
echo -e "${GREEN}Your LM Studio setup is working correctly!${NC}"
echo ""
echo "Next steps:"
echo "1. Start Bolt.new: ${YELLOW}pnpm run dev${NC}"
echo "2. Open browser: ${YELLOW}http://localhost:5173${NC}"
echo "3. Click model selector"
echo "4. Choose 'OpenAICompatible' provider"
echo "5. Click '🔍 Discover Models'"
echo "6. Start chatting with your local AI!"
echo ""
echo "Available models to use:"
echo "$MODELS" | while read -r model; do
    echo "  • $model"
done
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
