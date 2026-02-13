#!/bin/bash
# LUMEN SDK API Production Startup Script
# Copyright 2026 Forge Partners Inc.

set -e

echo "🚀 Starting LUMEN SDK API in production mode..."

# Check required environment variables
required_vars=("SUPABASE_URL" "SUPABASE_SERVICE_KEY")
for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ Error: $var environment variable is required"
    exit 1
  fi
done

echo "✅ Environment variables validated"

# Set production defaults
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
export LOG_LEVEL=${LOG_LEVEL:-"info"}
export API_VERSION=${API_VERSION:-"1.0.0"}

# Check if running in container
if [[ -f /.dockerenv ]]; then
    echo "🐳 Running in Docker container"
    WORKERS=${WORKERS:-4}
    HOST=${HOST:-"0.0.0.0"}
    PORT=${PORT:-8000}
else
    echo "🖥️  Running on host system"
    WORKERS=${WORKERS:-$(nproc)}
    HOST=${HOST:-"0.0.0.0"}
    PORT=${PORT:-8000}
fi

echo "📊 Configuration:"
echo "  - Workers: $WORKERS"
echo "  - Host: $HOST"
echo "  - Port: $PORT"
echo "  - Log Level: $LOG_LEVEL"
echo "  - API Version: $API_VERSION"

# Start with Gunicorn for production
echo "🎯 Starting Gunicorn server..."
exec gunicorn main:app \
    --workers $WORKERS \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind $HOST:$PORT \
    --log-level $LOG_LEVEL \
    --access-logfile - \
    --error-logfile - \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --preload