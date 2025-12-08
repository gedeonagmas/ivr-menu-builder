# Inbound Call Routing Setup for FusionPBX

This guide explains how to set up inbound call routing so that calls coming into your FusionPBX system are handled by your IVR workflows.

## Problem Solved

Previously, dialplans were created in the `default` context (for internal extensions), but **inbound calls** from external sources (like SIP trunks, gateways, or softphones like Blink) route through the `public` context. This update fixes that.

## How It Works

1. **Associate a Phone Number with a Workflow**: When deploying a workflow, you can specify a phone number
2. **Dialplan in Public Context**: The system creates a dialplan in the `public` context matching your phone number
3. **Automatic Routing**: Inbound calls to that number automatically route to your workflow

## Step-by-Step Setup

### Step 1: Register/Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword"
  }'
```

Save the `token` from the response.

### Step 2: Register Your Phone Number

Register the phone number that will receive inbound calls:

```bash
curl -X POST http://localhost:3001/api/phone-numbers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "number": "+1234567890",
    "friendlyName": "Main IVR Number"
  }'
```

**Important**: Use the exact phone number format that FusionPBX receives for inbound calls. This might be:
- E.164 format: `+1234567890`
- Local format: `1234567890`
- Extension format: `1000` (if using internal routing)

Save the `id` of the phone number.

### Step 3: Create Your Workflow

Create a workflow with your IVR nodes (Answer Call, Play Audio, Gather Input, etc.):

```bash
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Main IVR",
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
              "messageText": "Welcome to our IVR system. Press 1 for support, press 2 for sales."
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
  }'
```

Save the workflow `id`.

### Step 4: Deploy Workflow with Phone Number

**This is the key step** - deploy the workflow and associate it with your phone number:

```bash
curl -X POST http://localhost:3001/api/workflows/WORKFLOW_ID/deploy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deploymentType": "fusionpbx",
    "phoneNumberId": "PHONE_NUMBER_ID"
  }'
```

This will:
- Create a dialplan in the `public` context
- Match calls to your phone number
- Route them to your workflow

### Step 5: Test Inbound Call

Call your phone number from Blink or any SIP client. The call should:
1. Be answered automatically
2. Play your TTS message
3. Execute your workflow nodes
4. Be tracked in the IVR Builder

### Step 6: Verify in FusionPBX

1. Login to FusionPBX: `http://localhost`
2. Go to: **Advanced → Dialplan Manager**
3. Look for your workflow name
4. Check that:
   - Context is `public` (not `default`)
   - Number matches your phone number
   - Dialplan is enabled

## Troubleshooting

### Calls Not Routing to Workflow

1. **Check Phone Number Format**: 
   - The number in FusionPBX must match exactly what you registered
   - Check FusionPBX CDR logs to see what `destination_number` is received
   - Update your phone number registration to match

2. **Check Dialplan Context**:
   - Inbound calls use `public` context
   - Internal extensions use `default` context
   - Verify your dialplan is in `public` context

3. **Check Dialplan Order**:
   - Dialplans are processed in order
   - Make sure your IVR dialplan comes before catch-all dialplans
   - Check `dialplan_order` in FusionPBX

4. **Check FreeSWITCH Logs**:
   ```bash
   # SSH into FusionPBX server
   tail -f /var/log/freeswitch/freeswitch.log
   ```
   Look for dialplan matching attempts

### Dialplan Not Created

1. Check FusionPBX API credentials in `.env`:
   ```
   FUSIONPBX_URL=http://localhost
   FUSIONPBX_USERNAME=admin
   FUSIONPBX_PASSWORD=admin
   ```

2. Check backend logs for errors:
   ```bash
   # In backend directory
   npm run dev
   ```

3. Test FusionPBX connection:
   ```bash
   curl http://localhost/login.php
   ```

### TTS Not Working

The system uses FreeSWITCH's `flite` TTS engine by default. For better quality:
1. Install a TTS engine (e.g., `pico2wave`, `espeak`)
2. Configure mod_tts_commandline in FreeSWITCH
3. Update the dialplan XML generation in `fusionpbx.service.ts`

## API Reference

### Deploy Workflow with Phone Number

```http
POST /api/workflows/:id/deploy
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "deploymentType": "fusionpbx",
  "phoneNumberId": "uuid-of-phone-number"
}
```

### Deploy Workflow without Phone Number (Internal Extension)

```http
POST /api/workflows/:id/deploy
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "deploymentType": "fusionpbx"
  // No phoneNumberId - creates dialplan in 'default' context for extension
}
```

## Next Steps

- Add more complex workflows with menus and branching
- Set up call recording
- Configure DTMF input handling
- Set up call forwarding
- Monitor call analytics

