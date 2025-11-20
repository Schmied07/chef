#!/bin/bash

# Test Queue Features - Priorities, DLQ, and Monitoring
# Usage: bash examples/test-queue-features.sh

BASE_URL="http://localhost:3001"

echo "🧪 Testing Queue Features"
echo "=========================="
echo ""

# Test 1: Queue Stats
echo "📊 Test 1: Get Queue Statistics"
curl -s "$BASE_URL/v1/queue/stats" | jq '.'
echo ""
echo ""

# Test 2: Create jobs with different priorities
echo "📥 Test 2: Creating jobs with different priorities"
echo ""

echo "Creating LOW priority job..."
LOW_JOB=$(curl -s -X POST "$BASE_URL/v1/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [{"path": "index.js", "content": "console.log(\"Low priority\");"}],
    "dependencies": {},
    "strategy": {"runtime": "node", "version": "18"},
    "priority": "low"
  }' | jq -r '.jobId')
echo "Job ID: $LOW_JOB"
echo ""

echo "Creating NORMAL priority job..."
NORMAL_JOB=$(curl -s -X POST "$BASE_URL/v1/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [{"path": "index.js", "content": "console.log(\"Normal priority\");"}],
    "dependencies": {},
    "strategy": {"runtime": "node", "version": "18"},
    "priority": "normal"
  }' | jq -r '.jobId')
echo "Job ID: $NORMAL_JOB"
echo ""

echo "Creating HIGH priority job..."
HIGH_JOB=$(curl -s -X POST "$BASE_URL/v1/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [{"path": "index.js", "content": "console.log(\"High priority\");"}],
    "dependencies": {},
    "strategy": {"runtime": "node", "version": "18"},
    "priority": "high"
  }' | jq -r '.jobId')
echo "Job ID: $HIGH_JOB"
echo ""

echo "Creating CRITICAL priority job..."
CRITICAL_JOB=$(curl -s -X POST "$BASE_URL/v1/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [{"path": "index.js", "content": "console.log(\"Critical priority\");"}],
    "dependencies": {},
    "strategy": {"runtime": "node", "version": "18"},
    "priority": "critical"
  }' | jq -r '.jobId')
echo "Job ID: $CRITICAL_JOB"
echo ""
echo ""

# Test 3: Check queue stats again
echo "📊 Test 3: Queue Statistics After Adding Jobs"
sleep 2
curl -s "$BASE_URL/v1/queue/stats" | jq '.'
echo ""
echo ""

# Test 4: Dead Letter Queue
echo "💀 Test 4: Dead Letter Queue"
echo "Checking DLQ jobs..."
curl -s "$BASE_URL/v1/queue/dead-letter?start=0&end=10" | jq '.'
echo ""
echo ""

# Test 5: Create a job that will fail (to test DLQ)
echo "❌ Test 5: Creating a job that will fail"
FAILING_JOB=$(curl -s -X POST "$BASE_URL/v1/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [{"path": "index.js", "content": "throw new Error(\"Intentional error\");"}],
    "dependencies": {"nonexistent-package": "999.999.999"},
    "strategy": {
      "runtime": "node", 
      "version": "18",
      "installCommand": "npm install",
      "buildCommand": "node index.js"
    }
  }' | jq -r '.jobId')
echo "Failing Job ID: $FAILING_JOB"
echo ""

# Wait for jobs to process
echo "⏳ Waiting 30 seconds for jobs to process..."
sleep 30
echo ""

# Test 6: Final queue stats
echo "📊 Test 6: Final Queue Statistics"
curl -s "$BASE_URL/v1/queue/stats" | jq '.'
echo ""
echo ""

# Test 7: Check DLQ again
echo "💀 Test 7: Dead Letter Queue After Processing"
curl -s "$BASE_URL/v1/queue/dead-letter?start=0&end=10" | jq '.'
echo ""
echo ""

echo "✅ Queue features test completed!"
echo ""
echo "Available endpoints:"
echo "  GET  $BASE_URL/v1/queue/stats"
echo "  GET  $BASE_URL/v1/queue/dead-letter"
echo "  POST $BASE_URL/v1/queue/dead-letter/:jobId/retry"
echo "  DELETE $BASE_URL/v1/queue/dead-letter"
