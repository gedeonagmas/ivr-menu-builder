# Testing FusionPBX Integration with IVR Builder

This guide shows you how to test the IVR builder with your local FusionPBX installation.

## Prerequisites

1. ✅ Backend server running (`npm run dev`)
2. ✅ FusionPBX running on `http://localhost`
3. ✅ Database migrated (`npm run db:migrate`)
4. ✅ FusionPBX credentials configured in `.env`

## Step-by-Step Testing Guide

### Step 1: Create a Test User Account

First, you need to authenticate. Create a user account:

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

**Response:**
```json
{
  "user": { "id": "...", "email": "test@example.com" },
  "token": "eyJhbGc..."
}
```

**Save the token** - you'll need it for all API calls.

### Step 2: Create a Simple IVR Workflow

Create a workflow with basic IVR nodes:

```bash
# Replace YOUR_TOKEN with the token from Step 1
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test IVR Flow",
    "description": "Simple test workflow",
    "diagram": {
      "nodes": [
        {
          "id": "start-1",
          "type": "default",
          "position": { "x": 100, "y": 100 },
          "data": {
            "type": "answer-call",
            "properties": {}
          }
        },
        {
          "id": "play-1",
          "type": "default",
          "position": { "x": 300, "y": 100 },
          "data": {
            "type": "play-audio-tts",
            "properties": {
              "messageType": "tts",
              "messageText": "Welcome to our IVR system. Press 1 for support, press 2 for sales."
            }
          }
        },
        {
          "id": "gather-1",
          "type": "default",
          "position": { "x": 500, "y": 100 },
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
          "position": { "x": 700, "y": 100 },
          "data": {
            "type": "hang-up-call",
            "properties": {}
          }
        }
      ],
      "edges": [
        { "id": "e1", "source": "start-1", "target": "play-1" },
        { "id": "e2", "source": "play-1", "target": "gather-1" },
        { "id": "e3", "source": "gather-1", "target": "hangup-1" }
      ]
    }
  }'
```

**Response:**
```json
{
  "workflow": {
    "id": "workflow-uuid-here",
    "name": "Test IVR Flow",
    "status": "DRAFT"
  }
}
```

**Save the workflow ID** - you'll need it for deployment.

### Step 3: Deploy Workflow to FusionPBX

Deploy the workflow to your local FusionPBX:

```bash
# Replace WORKFLOW_ID with the ID from Step 2
# Replace YOUR_TOKEN with your auth token
curl -X POST http://localhost:3001/api/workflows/WORKFLOW_ID/deploy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deploymentType": "fusionpbx"
  }'
```

**Response:**
```json
{
  "workflow": {
    "id": "...",
    "fusionpbxDialplanUuid": "dialplan-uuid-here",
    "isActive": true,
    "status": "ACTIVE"
  },
  "fusionpbxDialplanUuid": "dialplan-uuid-here"
}
```

### Step 4: Configure Phone Number

You need to register a phone number in the system:

```bash
curl -X POST http://localhost:3001/api/phone-numbers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "number": "+1234567890",
    "friendlyName": "Test Number"
  }'
```

**Note:** Use a phone number that exists in your FusionPBX system (like an extension).

### Step 5: Make a Test Call

Make an outbound call through FusionPBX:

```bash
curl -X POST http://localhost:3001/api/calls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "to": "+1234567890",
    "workflowId": "WORKFLOW_ID"
  }'
```

**Response:**
```json
{
  "call": {
    "id": "call-uuid",
    "fusionpbxCallUuid": "fusionpbx-call-uuid",
    "status": "INITIATED",
    "fromNumber": "...",
    "toNumber": "+1234567890"
  }
}
```

### Step 6: Check Call Status

Monitor the call status:

```bash
# Replace CALL_ID with the call ID from Step 5
curl http://localhost:3001/api/calls/CALL_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 7: Verify in FusionPBX

1. **Check Dialplan:**
   - Login to FusionPBX web interface: `http://localhost`
   - Go to: Advanced → Dialplan Manager
   - Look for "Test IVR Flow" dialplan

2. **Check Call Logs:**
   - Go to: Reports → CDR (Call Detail Records)
   - Find your test call

3. **Check FreeSWITCH CLI:**
   ```bash
   # SSH into your FusionPBX server
   fs_cli -x "show calls"
   fs_cli -x "show channels"
   ```

## Quick Test Script

Save this as `test-ivr.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"
EMAIL="test@example.com"
PASSWORD="test123456"

echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Token: ${TOKEN:0:20}..."

echo "2. Creating workflow..."
WORKFLOW_RESPONSE=$(curl -s -X POST $BASE_URL/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @- <<EOF
{
  "name": "Test IVR",
  "diagram": {
    "nodes": [
      {
        "id": "start-1",
        "type": "default",
        "position": {"x": 100, "y": 100},
        "data": {"type": "answer-call", "properties": {}}
      },
      {
        "id": "play-1",
        "type": "default",
        "position": {"x": 300, "y": 100},
        "data": {
          "type": "play-audio-tts",
          "properties": {
            "messageType": "tts",
            "messageText": "Hello, this is a test call."
          }
        }
      },
      {
        "id": "hangup-1",
        "type": "default",
        "position": {"x": 500, "y": 100},
        "data": {"type": "hang-up-call", "properties": {}}
      }
    ],
    "edges": [
      {"id": "e1", "source": "start-1", "target": "play-1"},
      {"id": "e2", "source": "play-1", "target": "hangup-1"}
    ]
  }
}
EOF
)

WORKFLOW_ID=$(echo $WORKFLOW_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Workflow ID: $WORKFLOW_ID"

echo "3. Deploying to FusionPBX..."
DEPLOY_RESPONSE=$(curl -s -X POST $BASE_URL/api/workflows/$WORKFLOW_ID/deploy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"deploymentType": "fusionpbx"}')

echo "✅ Deployment response:"
echo $DEPLOY_RESPONSE | jq '.' 2>/dev/null || echo $DEPLOY_RESPONSE

echo "\n✅ Test complete! Check FusionPBX dialplan manager for your workflow."
```

Make it executable and run:
```bash
chmod +x test-ivr.sh
./test-ivr.sh
```

## Troubleshooting

### Issue: "Workflow not found or not deployed"
- Make sure you deployed the workflow first (Step 3)
- Check that `fusionpbxDialplanUuid` exists in the workflow

### Issue: "No active phone number configured"
- Register a phone number first (Step 4)
- Make sure it's marked as `isActive: true`

### Issue: Call doesn't connect
- Verify FusionPBX is running: `curl http://localhost/login.php`
- Check FusionPBX logs: `/var/log/freeswitch/freeswitch.log`
- Verify phone number exists in FusionPBX

### Issue: Dialplan not created
- Check FusionPBX API access
- Verify credentials in `.env` file
- Check backend logs for errors

## Next Steps

Once basic testing works:
1. Add more complex workflows (menus, conditions, transfers)
2. Test recording functionality
3. Test DTMF input collection
4. Test call forwarding
5. Monitor call analytics

