#!/bin/bash
# =============================================================================
# UxBridge — First-time dev setup
# =============================================================================
set -e

echo "🚀 Setting up UxBridge dev environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js >= 20 required"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm >= 9 required (npm i -g pnpm)"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker not found — skipping local services"; SKIP_DOCKER=1; }

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required (found: $NODE_VERSION)"
  exit 1
fi

# Copy env file
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✓ Created .env.local — fill in your credentials"
else
  echo "✓ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start local services
if [ -z "$SKIP_DOCKER" ]; then
  echo "🐳 Starting Redis and Supabase..."
  docker-compose up -d redis
  echo "✓ Redis started on port 6379"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your API keys"
echo "  2. Run: pnpm dev  (starts all services)"
echo "  3. Run: pnpm db:migrate  (apply DB schema)"
echo ""
echo "Individual services:"
echo "  pnpm dev:api    → API + WebSocket (port 3001)"
echo "  pnpm dev:web    → Next.js dashboard (port 3000)"
echo "  pnpm dev:plugin → Figma plugin webpack watch"
