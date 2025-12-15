# Backend Logs Location

## Where to Find Logs

### 1. **Console Output** (Primary in Development)
The backend server logs are printed to the **console/terminal** where you started the server.

To see logs in real-time:
- Look at the terminal where you ran `pnpm dev` or `npm run dev`
- All log messages appear there with timestamps

### 2. **Log Files** (Now Enabled)
Log files are written to:
- `apps/backend/logs/combined.log` - All logs
- `apps/backend/logs/error.log` - Only errors

### 3. **View Recent Logs**
Run the helper script:
```bash
cd apps/backend
bash check-logs.sh
```

Or manually:
```bash
# View all recent logs
tail -100 apps/backend/logs/combined.log

# View only IVR menu related logs
grep -i "ivr\|menu\|fusionpbx" apps/backend/logs/combined.log | tail -50

# Follow logs in real-time
tail -f apps/backend/logs/combined.log
```

## What to Look For

When saving a workflow with an IVR Menu node, look for these log messages:

1. **Node Detection:**
   - `"Checking for IVR menu nodes in workflow"`
   - `"IVR menu check result"` - Should show `hasIvrMenu: true`

2. **Database Connection:**
   - `"Connecting to FusionPBX database"`
   - `"Successfully connected to FusionPBX database"`

3. **Menu Creation:**
   - `"Creating IVR menu"` or `"Updating IVR menu"`
   - `"IVR menu saved to database"`

4. **Errors:**
   - Any messages with `level: "error"`
   - Check `logs/error.log` for error details

## Troubleshooting

If you don't see logs:
1. Make sure the backend server is running
2. Check the console where you started the server
3. Verify log files exist: `ls -la apps/backend/logs/`
4. Restart the server to enable file logging


