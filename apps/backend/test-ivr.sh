#!/bin/bash

# Quick IVR Builder Test Script for FusionPBX
# Usage: ./test-ivr.sh

BASE_URL="http://localhost:3001"
EMAIL="test@example.com"
PASSWORD="test123456"

echo "🧪 Testing IVR Builder with FusionPBX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Register user
echo "1️⃣  Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
  TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "   ✅ User registered"
  echo "   🔑 Token: ${TOKEN:0:30}..."
else
  echo "   ⚠️  User might already exist, trying login..."
  LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  if [ -z "$TOKEN" ]; then
    echo "   ❌ Failed to authenticate"
    exit 1
  fi
  echo "   ✅ Logged in"
fi

echo ""

# Step 2: Create workflow
echo "2️⃣  Creating test workflow..."
WORKFLOW_RESPONSE=$(curl -s -X POST $BASE_URL/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test IVR Flow",
    "description": "Simple test workflow for FusionPBX",
    "diagram": {
      "nodes": [
        {
          "id": "start-1",
          "type": "default",
          "position": {"x": 100, "y": 100},
          "data": {
            "type": "answer-call",
            "properties": {}
          }
        },
        {
          "id": "play-1",
          "type": "default",
          "position": {"x": 300, "y": 100},
          "data": {
            "type": "play-audio-tts",
            "properties": {
              "messageType": "tts",
              "messageText": "Hello! This is a test IVR call from the workflow builder. Press any key to continue."
            }
          }
        },
        {
          "id": "gather-1",
          "type": "default",
          "position": {"x": 500, "y": 100},
          "data": {
            "type": "gather-input",
            "properties": {
              "inputType": "dtmf",
              "maxDigits": 1,
              "timeout": 5
            }
          }
        },
        {
          "id": "hangup-1",
          "type": "default",
          "position": {"x": 700, "y": 100},
          "data": {
            "type": "hang-up-call",
            "properties": {}
          }
        }
      ],
      "edges": [
        {"id": "e1", "source": "start-1", "target": "play-1"},
        {"id": "e2", "source": "play-1", "target": "gather-1"},
        {"id": "e3", "source": "gather-1", "target": "hangup-1"}
      ]
    }
  }')

WORKFLOW_ID=$(echo $WORKFLOW_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$WORKFLOW_ID" ]; then
  echo "   ❌ Failed to create workflow"
  echo "   Response: $WORKFLOW_RESPONSE"
  exit 1
fi

echo "   ✅ Workflow created: $WORKFLOW_ID"
echo ""

# Step 3: Deploy to FusionPBX
echo "3️⃣  Deploying workflow to FusionPBX..."
DEPLOY_RESPONSE=$(curl -s -X POST $BASE_URL/api/workflows/$WORKFLOW_ID/deploy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"deploymentType": "fusionpbx"}')

DIALPLAN_UUID=$(echo $DEPLOY_RESPONSE | grep -o '"fusionpbxDialplanUuid":"[^"]*' | cut -d'"' -f4)

if [ -z "$DIALPLAN_UUID" ]; then
  echo "   ⚠️  Deployment might have issues"
  echo "   Response: $DEPLOY_RESPONSE"
else
  echo "   ✅ Deployed to FusionPBX"
  echo "   📋 Dialplan UUID: $DIALPLAN_UUID"
fi

echo ""

# Step 4: Check workflow status
echo "4️⃣  Checking workflow status..."
STATUS_RESPONSE=$(curl -s $BASE_URL/api/workflows/$WORKFLOW_ID \
  -H "Authorization: Bearer $TOKEN")

echo "   Workflow Status:"
echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4
echo "$STATUS_RESPONSE" | grep -o '"isActive":[^,]*' | head -1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Check FusionPBX dialplan manager: http://localhost"
echo "   2. Look for 'Test IVR Flow' dialplan"
echo "   3. To make a test call, use:"
echo "      curl -X POST $BASE_URL/api/calls \\"
echo "        -H 'Authorization: Bearer $TOKEN' \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"to\":\"+1234567890\",\"workflowId\":\"$WORKFLOW_ID\"}'"
echo ""
echo "📋 Workflow ID: $WORKFLOW_ID"
echo "📋 Dialplan UUID: ${DIALPLAN_UUID:-'Not deployed yet'}"

