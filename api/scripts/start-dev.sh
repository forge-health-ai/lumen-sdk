#!/bin/bash
# LUMEN SDK API Development Startup Script
# Copyright 2026 Forge Partners Inc.

set -e

echo "🔧 Starting LUMEN SDK API in development mode..."

# Load environment variables from .env if it exists
if [[ -f .env ]]; then
    echo "📄 Loading environment from .env file"
    export $(grep -v '^#' .env | xargs)
fi

# Set development defaults
export LOG_LEVEL=${LOG_LEVEL:-"debug"}
export API_VERSION=${API_VERSION:-"1.0.0-dev"}
export CORS_ORIGINS=${CORS_ORIGINS:-"http://localhost:3000,http://localhost:5173,http://localhost:8000"}

echo "📊 Development Configuration:"
echo "  - Log Level: $LOG_LEVEL"
echo "  - API Version: $API_VERSION"
echo "  - CORS Origins: $CORS_ORIGINS"

# Check if Supabase is configured
if [[ -z "$SUPABASE_URL" ]]; then
    echo "⚠️  Warning: SUPABASE_URL not set - some features may not work"
fi

echo "🎯 Starting Uvicorn development server..."
echo "📖 API docs available at: http://localhost:8000/docs"

# Start with Uvicorn for development
exec uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --log-level $LOG_LEVEL \
    --access-log