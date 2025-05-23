#!/bin/bash

# Format-on-comment script
# Run this script from the project root

# Get the list of modified files
CHANGED_FILES=$(git diff --name-only HEAD)

# Format TypeScript/React files
TS_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$')
if [ -n "$TS_FILES" ]; then
  echo "Formatting TypeScript/React files..."
  npx prettier --write $TS_FILES
  npx eslint $TS_FILES --fix
fi

# Format Rust files
RUST_FILES=$(echo "$CHANGED_FILES" | grep -E '\.rs$')
if [ -n "$RUST_FILES" ]; then
  echo "Formatting Rust files..."
  cd src-tauri && cargo fmt
fi

echo "✅ Formatting complete!"
