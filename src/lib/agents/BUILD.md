# SDK & Widget Build Guide

This guide explains how to rebuild only the SDK and widget components without rebuilding the entire app.

## Prerequisites

- Node.js installed
- npm available (for SDK builds only)
- Be in the project root: `/Users/albertsalgueda/Desktop/altancode/altan-ui`

## Quick Commands

### Rebuild SDK Only
```bash
cd src/lib/agents && npm run build
```

### Rebuild Widget Only
```bash
cd src/lib/agents && npx webpack --config webpack.widget.config.cjs
```

### Deploy Widget to Public Directory
```bash
cd src/lib/agents && cp dist/altan-widget.js ../../../public/sdk/altan-widget.js
```

### Full SDK + Widget Rebuild & Deploy
```bash
cd src/lib/agents && npm run build && npx webpack --config webpack.widget.config.cjs && cp dist/altan-widget.js ../../../public/sdk/altan-widget.js
```

## Step-by-Step Instructions

### 1. SDK Rebuild (TypeScript compilation)

From project root:
```bash
cd src/lib/agents
npm run build
```

This will:
- Compile TypeScript files to JavaScript
- Generate type definitions (.d.ts files)
- Output to `dist/` directory
- Create both CommonJS and ESM builds

### 2. Widget Rebuild (Webpack bundling)

From the same directory:
```bash
npx webpack --config webpack.widget.config.cjs
```

This will:
- Bundle the widget JavaScript file
- Minimize the output
- Generate `dist/altan-widget.js` (standalone widget file)

### 3. Deploy Widget (Copy to public)

```bash
cp dist/altan-widget.js ../../../public/sdk/altan-widget.js
```

This copies the widget to the public directory where it's served.

### 4. Publish SDK to npm (Optional)

If you want to publish a new version:
```bash
# Update version in package.json first
npm publish
```

## File Structure

```
src/lib/agents/
├── components.tsx        # Main SDK components (Room, etc.)
├── index.ts             # SDK entry point
├── widget.js            # Widget entry point
├── package.json         # SDK package config
├── tsconfig.json        # TypeScript config
├── webpack.widget.config.cjs  # Widget build config
└── dist/                # Build outputs
    ├── altan-sdk.js     # SDK CommonJS build
    ├── altan-widget.js  # Widget standalone bundle
    └── *.d.ts           # Type definitions
```

## Important Notes

⚠️ **Use npm only for SDK builds** - The main app uses bun, but the SDK requires npm for its build process and publishing.

🔄 **Auto-rebuild**: The SDK build automatically runs on `npm publish` via the `prepublishOnly` script.

📱 **Mobile Features**: The latest version includes responsive fullscreen mode for mobile devices (screens ≤ 768px width or ≤ 600px height).

🔒 **Security**: Authentication tokens are now passed via secure `postMessage` only, not in URL parameters.

## Troubleshooting

- **Module not found**: Make sure you're in the `src/lib/agents` directory
- **Permission errors**: Ensure you have write access to the directories
- **TypeScript errors**: Check `components.tsx` for any type issues
- **Webpack failures**: Verify `widget.js` exists and imports are correct