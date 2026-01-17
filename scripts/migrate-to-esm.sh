#!/bin/bash
# Script to migrate the project to ES modules
# Run this script carefully and test after each step

set -e

echo "🔄 Starting ES Module Migration"
echo "================================"

# Step 1: Update package.json
echo "📦 Step 1: Updating package.json..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.type = 'module';
pkg.exports = {
  './server/*': './server/*',
  './shared/*': './shared/*'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ package.json updated');
"

# Step 2: Update tsconfig.json
echo "📝 Step 2: Updating TypeScript configuration..."
node -e "
const fs = require('fs');
const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
tsconfig.compilerOptions.module = 'ES2022';
tsconfig.compilerOptions.target = 'ES2022';
tsconfig.compilerOptions.moduleResolution = 'bundler';
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
console.log('✅ tsconfig.json updated');
"

# Step 3: Convert serverless functions
echo "🔧 Step 3: Converting serverless functions..."
# Remove the path resolution code (no longer needed with ES modules)
echo "⚠️  Manual step required: Update api/trpc/[...trpc].ts to use import instead of await import()"

# Step 4: Update server files
echo "🔧 Step 4: Converting server files..."
echo "⚠️  Manual step required: Convert all require() to import statements"
echo "⚠️  Manual step required: Convert all module.exports to export statements"

# Step 5: Test
echo "🧪 Step 5: Testing..."
echo "Run: npm run build && npm run dev"
echo "Verify all imports work correctly"

echo ""
echo "================================"
echo "✅ Migration preparation complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes in package.json and tsconfig.json"
echo "2. Convert require() to import in all server files"
echo "3. Convert module.exports to export"
echo "4. Update dynamic imports to use static imports where possible"
echo "5. Test locally with 'npm run dev'"
echo "6. Deploy to Vercel and test"
echo ""
echo "See docs/VERCEL_DEPLOYMENT_IMPROVEMENTS.md for detailed instructions"
