#!/bin/bash
# Script to check backend logs

cd "$(dirname "$0")"

echo "=== Backend Logs Checker ==="
echo ""

# Check if logs directory exists
if [ -d "logs" ]; then
    echo "📁 Logs directory found: $(pwd)/logs"
    echo ""
    
    if [ -f "logs/combined.log" ]; then
        echo "📄 Combined log file (last 50 lines):"
        echo "----------------------------------------"
        tail -50 logs/combined.log
        echo ""
    else
        echo "⚠️  No combined.log file found"
    fi
    
    if [ -f "logs/error.log" ]; then
        echo "📄 Error log file (last 50 lines):"
        echo "----------------------------------------"
        tail -50 logs/error.log
        echo ""
    else
        echo "⚠️  No error.log file found"
    fi
else
    echo "⚠️  Logs directory doesn't exist"
    echo "   Logs are only in console output in development mode"
    echo ""
    echo "To enable file logging, set ENABLE_FILE_LOGGING=true in .env"
fi

echo ""
echo "=== Recent IVR Menu Related Logs ==="
if [ -f "logs/combined.log" ]; then
    grep -i "ivr\|menu\|fusionpbx" logs/combined.log | tail -20
elif [ -f "logs/error.log" ]; then
    grep -i "ivr\|menu\|fusionpbx" logs/error.log | tail -20
else
    echo "No log files found. Check the console output where you started the backend server."
fi


