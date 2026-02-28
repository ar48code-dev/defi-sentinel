#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${BLUE}      DeFi Sentinel - One Command Setup           ${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"

# Safety Check: Ensure we are in the root directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the root of the project!${NC}"
    echo -e "Usage: cd defi-sentinel && ./setup.sh"
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}Created .env successfully. PLEASE UPDATE THIS FILE WITH YOUR KEYS.${NC}"
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

# Root install
echo -e "${BLUE}Installing root dependencies (concurrently)...${NC}"
npm install

# Backend install
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend && npm install && cd ..

# Frontend install
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend && npm install && cd ..

echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${BLUE}Run ./start.sh to start the application.${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
