#!/bin/bash

echo "🧪 Testing Chef AI Engine with Emergent API"
echo "============================================"

# Set environment variables
export EMERGENT_LLM_KEY="sk-emergent-9F51f0520965598045"
export AI_PROVIDER="openai"
export AI_MODEL="gpt-4o"

cd "$(dirname "$0")"

echo ""
echo "1️⃣ Testing Intent Extraction..."
python3 ai-service/ai_service.py extract_intent '{"prompt": "Build a todo app with user authentication"}'

echo ""
echo "2️⃣ Testing Plan Generation..."
python3 ai-service/ai_service.py generate_plan '{"intent": {"purpose": "Todo app", "features": ["auth", "crud"], "techStack": ["react", "convex"], "constraints": []}}'

echo ""
echo "✅ AI Service Tests Complete!"
echo ""
echo "To test the full pipeline:"
echo "  cd /app/packages/engine"
echo "  pnpm test"
