# FusionPBX Integration Setup

This document explains how to configure the workflow builder to work with your local FusionPBX installation.

## Prerequisites

- FusionPBX running on localhost
- Admin access to FusionPBX
- Node.js and npm/pnpm installed

## Environment Configuration

Create a `.env` file in the `apps/backend` directory with the following configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/workflowbuilder"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
PORT=3001
NODE_ENV=development
WEBHOOK_BASE_URL="http://localhost:3001"

# FusionPBX Configuration
FUSIONPBX_URL="http://localhost"
FUSIONPBX_USERNAME="admin"
FUSIONPBX_PASSWORD="your_fusionpbx_admin_password"
FUSIONPBX_DOMAIN="localhost"

# Optional: Twilio Configuration (if you want to support both)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

## Database Migration

Run the database migration to add FusionPBX support:

```bash
cd apps/backend
npm run db:migrate
```

## FusionPBX Configuration

### 1. Enable API Access

In FusionPBX, ensure API access is enabled:
- Go to Advanced → Access Controls
- Add your application server IP to allowed IPs
- Enable HTTP API access

### 2. Create API User (Optional)

For better security, create a dedicated API user:
- Go to Accounts → Users
- Create a new user with API permissions
- Use these credentials in your `.env` file

### 3. Configure Webhooks

Configure FusionPBX to send webhooks to your application:

1. **Call Status Webhooks:**
   - URL: `http://localhost:3001/api/fusionpbx-webhooks/call-status`
   - Events: Call state changes

2. **Recording Webhooks:**
   - URL: `http://localhost:3001/api/fusionpbx-webhooks/recording-status`
   - Events: Recording completion

3. **DTMF Input Webhooks:**
   - URL: `http://localhost:3001/api/fusionpbx-webhooks/dtmf-input`
   - Events: DTMF digit collection

## Installation Steps

1. **Install Dependencies:**
   ```bash
   cd apps/backend
   npm install
   ```

2. **Run Database Migrations:**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

3. **Start the Backend:**
   ```bash
   npm run dev
   ```

4. **Test FusionPBX Connection:**
   The application will automatically test the FusionPBX connection on startup.

## Usage

### Creating IVR Workflows

1. **Create a Workflow:**
   - Use the visual workflow builder
   - Add IVR nodes (Answer Call, Play Audio, Gather Input, etc.)
   - Connect nodes with edges

2. **Deploy to FusionPBX:**
   ```bash
   POST /api/workflows/:id/deploy
   {
     "deploymentType": "fusionpbx"
   }
   ```

3. **Test Your IVR:**
   - The workflow will be deployed as a FusionPBX dialplan
   - Call the configured extension to test

### Available Node Types

- **Answer Call**: Answer incoming calls
- **Play Audio/TTS**: Play audio files or text-to-speech
- **Gather Input**: Collect DTMF digits or speech input
- **Forward to Phone**: Transfer calls to extensions/numbers
- **Record Call**: Start/stop call recording
- **Voicemail**: Record voicemail messages
- **Send SMS**: Send SMS messages (if configured)
- **Hang Up**: End the call
- **Conditions**: Conditional branching based on variables

### Webhook Endpoints

Your application exposes these webhook endpoints for FusionPBX:

- `POST /api/fusionpbx-webhooks/call-status` - Call status updates
- `POST /api/fusionpbx-webhooks/recording-status` - Recording completion
- `POST /api/fusionpbx-webhooks/dtmf-input` - DTMF input collection
- `POST /api/fusionpbx-webhooks/speech-input` - Speech recognition results
- `POST /api/fusionpbx-webhooks/execute-flow/:dialplan_uuid` - Workflow execution

## Troubleshooting

### Connection Issues

1. **Check FusionPBX Status:**
   ```bash
   curl http://localhost/login.php
   ```

2. **Verify Credentials:**
   - Ensure username/password are correct
   - Check if API access is enabled

3. **Check Logs:**
   ```bash
   # Backend logs
   tail -f apps/backend/logs/app.log
   
   # FusionPBX logs
   tail -f /var/log/freeswitch/freeswitch.log
   ```

### Dialplan Issues

1. **Check Dialplan Generation:**
   - Review generated XML in FusionPBX admin
   - Verify extension numbers don't conflict

2. **Test Dialplan:**
   ```bash
   # From FusionPBX CLI
   fs_cli -x "reloadxml"
   fs_cli -x "show dialplan"
   ```

### Call Flow Issues

1. **Check Call Events:**
   - Monitor call events in the application
   - Review webhook logs

2. **Debug FreeSWITCH:**
   ```bash
   fs_cli -x "console loglevel debug"
   ```

## Advanced Configuration

### Custom Extensions

Modify the dialplan generation in `fusionpbx.service.ts` to use custom extensions:

```typescript
const dialplan = {
  extension: '2000', // Your custom extension
  // ... rest of configuration
};
```

### Multi-tenant Setup

Configure different domains for different organizations:

```typescript
// In your workflow deployment
const domainUuid = await this.getDomainUuidForOrganization(organizationId);
```

### Load Balancing

For high availability, configure multiple FusionPBX instances:

```env
FUSIONPBX_URLS="http://fusionpbx1.local,http://fusionpbx2.local"
```

## Security Considerations

1. **Use HTTPS in production**
2. **Configure proper firewall rules**
3. **Use dedicated API credentials**
4. **Enable webhook signature validation**
5. **Regularly update FusionPBX and dependencies**

## Support

For issues specific to FusionPBX integration, check:
- FusionPBX documentation
- FreeSWITCH documentation  
- Application logs and error messages




