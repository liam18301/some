#!/bin/bash

# Jambostar Start with Tunnel
# This script starts ngrok and the server together

echo "🚀 Starting Jambostar with ngrok tunnel..."
echo ""

# Start ngrok in background
echo "→ Starting ngrok..."
ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start (2 seconds should be enough)
sleep 2

# Check if ngrok is running
if ! kill -0 $NGROK_PID 2>/dev/null; then
    echo "✗ Failed to start ngrok"
    exit 1
fi

echo "✓ ngrok started (PID: $NGROK_PID)"
echo ""

# Extract ngrok URL from API
echo "→ Getting ngrok public URL..."
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "✗ Could not get ngrok URL"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✓ ngrok URL: $NGROK_URL"
echo ""

# Update .env file
echo "→ Updating .env file..."
if grep -q "^CALLBACK_URL=" .env; then
    sed -i.bak "s|^CALLBACK_URL=.*|CALLBACK_URL=${NGROK_URL}/callback|" .env
else
    echo "CALLBACK_URL=${NGROK_URL}/callback" >> .env
fi

echo "✓ Updated CALLBACK_URL in .env"
echo ""

# Print status
echo "════════════════════════════════════════════════════"
echo "✓ Jambostar Ready!"
echo "════════════════════════════════════════════════════"
echo ""
echo "📱 Public URL (for M-Pesa callbacks):"
echo "   $NGROK_URL/callback"
echo ""
echo "🌐 Access your app at:"
echo "   http://localhost:3000"
echo ""
echo "Note: Press Ctrl+C to stop both ngrok and server"
echo ""
echo "════════════════════════════════════════════════════"
echo ""

# Start the Express server in foreground (it will block)
echo "→ Starting Express server..."
npm start

# Kill ngrok when server stops
kill $NGROK_PID 2>/dev/null
