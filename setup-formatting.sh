#!/bin/bash
# Script to set up formatting tools

# Install dependencies
npm install

# Setup husky
npx husky install
chmod +x .husky/pre-commit

# Run initial formatting
npm run format
npm run format:rust

echo "✅ Formatting tools setup complete!"
echo "🔍 Code will now be automatically formatted when you commit changes"
