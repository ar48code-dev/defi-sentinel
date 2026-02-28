#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${BLUE}      DeFi Sentinel - One Command All-In-One      ${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"

# 1. Dependency Check
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Missing dependencies. Running setup first...${NC}"
    ./setup.sh
fi

# 2. .env Check
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: No .env file found. Creating from example...${NC}"
    cp .env.example .env
fi

# 3. Port Finder/Check (optional)
# Port 3000 and 3001 should be free

# 4. Open Browser (with a 5 second delay to let Next.js boot)
( sleep 5 && (xdg-open http://localhost:3000 || open http://localhost:3000 || echo -e "${YELLOW}Could not open browser automatically. Please go to http://localhost:3000${NC}") ) &

# 5. Start Application
echo -e "${GREEN}Starting Backend and Frontend...${NC}"
npm run dev
