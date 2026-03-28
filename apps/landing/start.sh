#!/bin/sh
echo "Contents of /app:"
ls /app
SERVER=$(find /app -name "server.js" -not -path "*/node_modules/*" | head -1)
echo "Starting: $SERVER"
exec node "$SERVER"
