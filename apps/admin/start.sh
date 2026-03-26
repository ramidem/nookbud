#!/bin/sh
# Find server.js anywhere in the standalone output and run it
SERVER=$(find /app -name "server.js" -path "*apps/admin*" -not -path "*/node_modules/*" | head -1)
echo "Starting: $SERVER"
exec node "$SERVER"
