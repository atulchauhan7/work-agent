#!/bin/bash

# Jarvis — Personal AI Assistant Startup Script

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🤖 Jarvis Personal AI Assistant"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

# Activate virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Determine provider
PROVIDER="${1:-ollama}"  # Default to ollama

echo ""
echo "  📱 Access URLs:"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🖥  Desktop (localhost):"
echo "      http://localhost:5173"
echo ""
echo "  📲 Mobile (same WiFi):"
echo "      http://$LOCAL_IP:5173"
echo ""
echo "  Provider: $PROVIDER"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start server
if [ "$PROVIDER" = "groq" ]; then
    if [ -z "$GROQ_API_KEY" ]; then
        echo "❌ GROQ_API_KEY not set!"
        echo "   Set it: export GROQ_API_KEY=your_key"
        exit 1
    fi
    python3 server.py --workspace . --provider groq
else
    python3 server.py --workspace . --provider ollama
fi
