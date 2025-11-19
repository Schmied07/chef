#!/bin/bash

# Demo script for Chef Workers API
# This script demonstrates the API endpoints

BASE_URL="http://localhost:3001"

echo "🧪 Chef Workers API Demo"
echo "========================"
echo ""

# Check if server is running
echo "1️⃣ Health Check..."
curl -s "${BASE_URL}/api/health" | jq '.' || echo "❌ Server not running. Start with: pnpm run dev"
echo ""
echo ""

# Create a build job
echo "2️⃣ Creating Build Job..."
JOB_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "build",
    "priority": 5,
    "data": {
      "chatId": "demo-chat-123",
      "projectFiles": {
        "index.js": "console.log(\"Hello from Chef!\");",
        "package.json": "{\"name\": \"demo-app\", \"version\": \"1.0.0\"}"
      },
      "dependencies": {
        "react": "^18.0.0"
      }
    }
  }')

echo "$JOB_RESPONSE" | jq '.'
JOB_ID=$(echo "$JOB_RESPONSE" | jq -r '.jobId')
echo ""
echo "✅ Job created with ID: $JOB_ID"
echo ""

# Wait a bit for processing
echo "⏳ Waiting for job to process (3 seconds)..."
sleep 3
echo ""

# Get job status
echo "3️⃣ Checking Job Status..."
curl -s "${BASE_URL}/api/jobs/${JOB_ID}" | jq '.'
echo ""
echo ""

# Create a test job
echo "4️⃣ Creating Test Job..."
TEST_JOB=$(curl -s -X POST "${BASE_URL}/api/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "priority": 10,
    "data": {
      "chatId": "demo-chat-456",
      "projectFiles": {
        "test.js": "describe(\"Test\", () => { it(\"works\", () => { expect(true).toBe(true); }); });"
      },
      "testCommand": "npm test"
    }
  }')

echo "$TEST_JOB" | jq '.'
echo ""
echo ""

# Get queue statistics
echo "5️⃣ Queue Statistics..."
curl -s "${BASE_URL}/api/stats" | jq '.'
echo ""
echo ""

echo "✅ Demo Complete!"
echo ""
echo "📝 You can also try:"
echo "   - View job: curl ${BASE_URL}/api/jobs/\${JOB_ID}"
echo "   - Health check: curl ${BASE_URL}/api/health"
echo "   - Stats: curl ${BASE_URL}/api/stats"
