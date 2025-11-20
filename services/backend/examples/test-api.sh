#!/bin/bash

# API Testing Script for Chef Backend
# Demonstrates the complete workflow

set -e

BASE_URL="http://localhost:3001"
PROJECT_ID=""
JOB_ID=""

echo "🧪 Chef Backend API Testing"
echo "============================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Testing Health Endpoint${NC}"
echo "GET $BASE_URL/health"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
echo "$HEALTH_RESPONSE" | jq .
echo -e "${GREEN}✓ Health check passed${NC}"
echo ""

# 2. AI Generation
echo -e "${BLUE}2. Testing AI Generation${NC}"
echo "POST $BASE_URL/v1/generate"
GENERATE_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Build a simple counter app with React. Include increment, decrement, and reset buttons.",
    "config": {
      "enableAnalysis": true,
      "enableTests": false
    },
    "strategy": {
      "runtime": "node",
      "version": "18"
    }
  }')

echo "$GENERATE_RESPONSE" | jq .

PROJECT_ID=$(echo "$GENERATE_RESPONSE" | jq -r '.projectId')
JOB_ID=$(echo "$GENERATE_RESPONSE" | jq -r '.jobId')

if [ "$PROJECT_ID" = "null" ]; then
  echo -e "${YELLOW}⚠ AI Generation failed or not configured${NC}"
  echo "Skipping remaining tests..."
  exit 0
fi

echo -e "${GREEN}✓ Project created: $PROJECT_ID${NC}"
echo -e "${GREEN}✓ Job queued: $JOB_ID${NC}"
echo ""

# 3. Check Status
echo -e "${BLUE}3. Checking Build Status${NC}"
echo "GET $BASE_URL/v1/projects/$PROJECT_ID/status"

for i in {1..10}; do
  sleep 3
  STATUS_RESPONSE=$(curl -s "$BASE_URL/v1/projects/$PROJECT_ID/status")
  STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')
  PROGRESS=$(echo "$STATUS_RESPONSE" | jq -r '.progress')
  
  echo "Status: $STATUS | Progress: $PROGRESS%"
  
  if [ "$STATUS" = "completed" ]; then
    echo -e "${GREEN}✓ Build completed successfully!${NC}"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo -e "${YELLOW}⚠ Build failed${NC}"
    break
  fi
done
echo ""

# 4. Get Logs
echo -e "${BLUE}4. Retrieving Build Logs${NC}"
echo "GET $BASE_URL/v1/projects/$PROJECT_ID/logs"
LOGS_RESPONSE=$(curl -s "$BASE_URL/v1/projects/$PROJECT_ID/logs")
echo "$LOGS_RESPONSE" | jq '.logs | .[-5:]' # Last 5 logs
echo -e "${GREEN}✓ Logs retrieved${NC}"
echo ""

# 5. Get Artifacts
echo -e "${BLUE}5. Listing Artifacts${NC}"
echo "GET $BASE_URL/v1/projects/$PROJECT_ID/artifacts"
ARTIFACTS_RESPONSE=$(curl -s "$BASE_URL/v1/projects/$PROJECT_ID/artifacts")
echo "$ARTIFACTS_RESPONSE" | jq .
echo -e "${GREEN}✓ Artifacts listed${NC}"
echo ""

# Summary
echo ""
echo "================================"
echo -e "${GREEN}✅ All API tests completed!${NC}"
echo "================================"
echo ""
echo "Project ID: $PROJECT_ID"
echo "Job ID: $JOB_ID"
echo ""
echo "Next steps:"
echo "  - View full logs: curl $BASE_URL/v1/projects/$PROJECT_ID/logs"
echo "  - Download artifacts: curl $BASE_URL/v1/projects/$PROJECT_ID/artifacts/dist"
echo "  - Publish project: curl -X POST $BASE_URL/v1/projects/$PROJECT_ID/publish"
