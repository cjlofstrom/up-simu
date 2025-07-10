#!/bin/bash
npm run dev &
SERVER_PID=$!
sleep 5
if ps -p $SERVER_PID > /dev/null; then
    echo "Server started successfully with PID: $SERVER_PID"
    echo "Access the app at: http://localhost:5173/"
else
    echo "Server failed to start"
fi