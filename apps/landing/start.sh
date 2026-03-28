#!/bin/sh
# Find server.js anywhere in the standalone output and run it
SERVER=$(find /app -name "server.js" -path "*apps/landing*" -not -path "*/node_modules/*" | head -1)
if [ -z "$SERVER" ]; then
  SERVER=$(find /app -name "server.js" -not -path "*/node_modules/*" | head -1)
fi
echo "Starting: $SERVER"
exec node "$SERVER"
