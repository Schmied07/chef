#!/bin/bash

# Real-time monitoring dashboard for Chef Backend

BASE_URL="${BASE_URL:-http://localhost:3001}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear

while true; do
  # Move cursor to top
  tput cup 0 0
  
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║          🚀 Chef Backend Monitoring Dashboard             ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  
  # Health Check
  echo -e "${BLUE}📊 System Health${NC}"
  echo "───────────────────────────────────────────────────────────"
  HEALTH=$(curl -s "$BASE_URL/health" 2>/dev/null)
  
  if [ -n "$HEALTH" ]; then
    STATUS=$(echo "$HEALTH" | jq -r '.status')
    REDIS=$(echo "$HEALTH" | jq -r '.services.redis')
    DOCKER=$(echo "$HEALTH" | jq -r '.services.docker')
    
    if [ "$STATUS" = "ok" ]; then
      echo -e "Status: ${GREEN}✓ Healthy${NC}"
    else
      echo -e "Status: ${YELLOW}⚠ Degraded${NC}"
    fi
    
    echo -e "Redis:  $([ "$REDIS" = "up" ] && echo "${GREEN}✓ Up${NC}" || echo "${RED}✗ Down${NC}")"
    echo -e "Docker: $([ "$DOCKER" = "up" ] && echo "${GREEN}✓ Up${NC}" || echo "${RED}✗ Down${NC}")"
  else
    echo -e "${RED}✗ Backend Unreachable${NC}"
  fi
  
  echo ""
  
  # Metrics
  echo -e "${BLUE}📈 Build Metrics${NC}"
  echo "───────────────────────────────────────────────────────────"
  METRICS=$(curl -s "$BASE_URL/metrics" 2>/dev/null)
  
  if [ -n "$METRICS" ]; then
    TOTAL=$(echo "$METRICS" | jq -r '.summary.total // 0')
    COMPLETED=$(echo "$METRICS" | jq -r '.summary.completed // 0')
    SUCCESSFUL=$(echo "$METRICS" | jq -r '.summary.successful // 0')
    FAILED=$(echo "$METRICS" | jq -r '.summary.failed // 0')
    IN_PROGRESS=$(echo "$METRICS" | jq -r '.summary.inProgress // 0')
    SUCCESS_RATE=$(echo "$METRICS" | jq -r '.summary.successRate // 0')
    AVG_DURATION=$(echo "$METRICS" | jq -r '.summary.avgDuration // 0')
    
    echo "Total Jobs:      $TOTAL"
    echo "Completed:       $COMPLETED"
    echo -e "Successful:      ${GREEN}$SUCCESSFUL${NC}"
    echo -e "Failed:          ${RED}$FAILED${NC}"
    echo -e "In Progress:     ${YELLOW}$IN_PROGRESS${NC}"
    echo "Success Rate:    $(printf "%.1f" "$SUCCESS_RATE")%"
    echo "Avg Duration:    ${AVG_DURATION}ms"
  else
    echo "No metrics available"
  fi
  
  echo ""
  
  # Redis Stats (if available)
  echo -e "${BLUE}🗄️  Queue Stats${NC}"
  echo "───────────────────────────────────────────────────────────"
  
  # Try to get Redis info via docker if available
  REDIS_INFO=$(docker-compose exec -T redis redis-cli info stats 2>/dev/null | grep "total_commands_processed" || echo "")
  
  if [ -n "$REDIS_INFO" ]; then
    COMMANDS=$(echo "$REDIS_INFO" | cut -d: -f2 | tr -d '\r')
    echo "Commands Processed: $COMMANDS"
  else
    echo "Queue stats not available"
  fi
  
  echo ""
  
  # Recent Activity (last 5 jobs)
  echo -e "${BLUE}📝 Recent Activity${NC}"
  echo "───────────────────────────────────────────────────────────"
  
  if [ -n "$METRICS" ]; then
    echo "$METRICS" | jq -r '.jobs[-5:] | reverse | .[] | 
      "[\(.status)] Job \(.jobId[0:8])... - Phase: \(.phase // "N/A") - Duration: \(.duration // 0)ms"' 2>/dev/null || echo "No recent jobs"
  fi
  
  echo ""
  echo "───────────────────────────────────────────────────────────"
  echo "Press Ctrl+C to exit | Refreshing every 2s..."
  echo ""
  
  sleep 2
done
