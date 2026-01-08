#!/bin/bash

# Test script for all 5 JARVIS v4 routes
# Tests chat, debug, docs, ultrawork, and create-workflow routes

BASE_URL="http://localhost:5000/api/chat"
SESSION="test-session-$(date +%s)"

echo "=== JARVIS v4 Route Testing Script ==="
echo "Session: $SESSION"
echo ""

# Test 1: Chat Route (default)
echo "=== TEST 1: Chat Route (default) ==="
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"olá JARVIS\",\"sessionId\":\"$SESSION\"}")
echo "$RESPONSE" | jq '.'

# Check success flag
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
TOOL_USED=$(echo "$RESPONSE" | jq -r '.tool_used')
EXEC_TIME=$(echo "$RESPONSE" | jq -r '.execution_time_ms')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Test 1 PASSED - Tool: $TOOL_USED, Time: ${EXEC_TIME}ms"
else
  echo "❌ Test 1 FAILED"
fi
echo ""

# Test 2: Debug Route
echo "=== TEST 2: Debug Route ==="
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"debug: meu código não funciona\",\"sessionId\":\"$SESSION\"}")
echo "$RESPONSE" | jq '.'

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
TOOL_USED=$(echo "$RESPONSE" | jq -r '.tool_used')
MODEL_USED=$(echo "$RESPONSE" | jq -r '.model_used')

if [ "$SUCCESS" = "true" ] && [ "$TOOL_USED" = "claude" ]; then
  echo "✅ Test 2 PASSED - Tool: $TOOL_USED, Model: $MODEL_USED"
else
  echo "❌ Test 2 FAILED"
fi
echo ""

# Test 3: Docs Route
echo "=== TEST 3: Docs Route ==="
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"docs: como usar React hooks\",\"sessionId\":\"$SESSION\"}")
echo "$RESPONSE" | jq '.'

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
TOOL_USED=$(echo "$RESPONSE" | jq -r '.tool_used')
MODEL_USED=$(echo "$RESPONSE" | jq -r '.model_used')

if [ "$SUCCESS" = "true" ] && [ "$TOOL_USED" = "openCode" ]; then
  echo "✅ Test 3 PASSED - Tool: $TOOL_USED, Model: $MODEL_USED"
else
  echo "❌ Test 3 FAILED"
fi
echo ""

# Test 4: Ultrawork Route
echo "=== TEST 4: Ultrawork Route ==="
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"ulw: criar API RESTful\",\"sessionId\":\"$SESSION\"}")
echo "$RESPONSE" | jq '.'

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
TOOL_USED=$(echo "$RESPONSE" | jq -r '.tool_used')
MODEL_USED=$(echo "$RESPONSE" | jq -r '.model_used')

if [ "$SUCCESS" = "true" ] && [ "$TOOL_USED" = "openCode" ]; then
  echo "✅ Test 4 PASSED - Tool: $TOOL_USED, Model: $MODEL_USED"
else
  echo "❌ Test 4 FAILED"
fi
echo ""

# Test 5: Create Workflow Route
echo "=== TEST 5: Create Workflow Route ==="
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"crie workflow de email\",\"sessionId\":\"$SESSION\"}")
echo "$RESPONSE" | jq '.'

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
TOOL_USED=$(echo "$RESPONSE" | jq -r '.tool_used')
MODEL_USED=$(echo "$RESPONSE" | jq -r '.model_used')
WORKFLOW_ID=$(echo "$RESPONSE" | jq -r '.workflowId')

if [ "$SUCCESS" = "true" ] && [ "$TOOL_USED" = "openCode" ]; then
  echo "✅ Test 5 PASSED - Tool: $TOOL_USED, Model: $MODEL_USED, Workflow ID: $WORKFLOW_ID"
else
  echo "❌ Test 5 FAILED"
fi
echo ""

# Summary
echo "=== TEST SUMMARY ==="
echo "All 5 routes tested"
echo "Check responses above for detailed results"
echo ""
