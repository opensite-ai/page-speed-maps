#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Publishing @page-speed/venn-diagram...${NC}"

# Check git is clean
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}Error: Uncommitted changes in working directory${NC}"
  exit 1
fi

# Run all checks
echo -e "${YELLOW}Running checks...${NC}"
pnpm run lint
pnpm run type-check
pnpm run test

# Build
echo -e "${YELLOW}Building...${NC}"
pnpm run build

# Verify bundle sizes
echo -e "${YELLOW}Bundle sizes:${NC}"
ls -lh dist/esm/index.js || true
ls -lh dist/cjs/index.js || true

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

# Publish (expects NPM_TOKEN to be set in the environment)
echo -e "${YELLOW}Publishing version ${VERSION} to npm...${NC}"
npm publish

# Create git tag
git tag -a v${VERSION} -m "Release: @page-speed/venn-diagram v${VERSION}"
git push origin v${VERSION}

echo -e "${GREEN}Successfully published v${VERSION}!${NC}"

