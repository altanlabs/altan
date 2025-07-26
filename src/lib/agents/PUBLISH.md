# Publishing @altanlabs/sdk to npm

This guide walks you through publishing the Altan AI SDK to npm as `@altanlabs/sdk`.

## Prerequisites

1. **npm Account**: Ensure you have an npm account with publishing permissions
2. **Organization**: Verify you have access to the `@altanlabs` organization on npm
3. **Authentication**: Be logged in to npm CLI

## Setup Instructions

### 1. Install Dependencies

First, navigate to the SDK directory and install the build dependencies:

```bash
cd src/lib/agents
npm install
```

### 2. Build the Package

Build the distributable version:

```bash
npm run build
```

This will create a `dist/` directory with:
- `index.js` - CommonJS build
- `index.esm.js` - ES Module build  
- `index.d.ts` - TypeScript definitions
- Source maps

### 3. Test the Build

Verify the build works correctly:

```bash
npm run type-check
npm run lint
```

### 4. Version Management

Update the version in `package.json` following semantic versioning:

```bash
# For patch releases (bug fixes)
npm version patch

# For minor releases (new features, backward compatible)
npm version minor

# For major releases (breaking changes)
npm version major
```

### 5. Publish to npm

#### Option A: Direct Publish

```bash
npm publish
```

#### Option B: Dry Run First

Test what will be published:

```bash
npm publish --dry-run
```

Then publish if everything looks correct:

```bash
npm publish
```

#### Option C: Publish with Tag

For beta or alpha releases:

```bash
npm publish --tag beta
npm publish --tag alpha
```

## npm Organization Setup

If this is the first time publishing to `@altanlabs`:

### 1. Create Organization (if needed)

```bash
npm org create altanlabs
```

### 2. Add Team Members

```bash
npm org set altanlabs developers [username]
```

### 3. Set Package Access

```bash
npm access public @altanlabs/sdk
```

## Automated Publishing with CI/CD

### GitHub Actions Example

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install dependencies
        run: |
          cd src/lib/agents
          npm install
          
      - name: Build package
        run: |
          cd src/lib/agents
          npm run build
          
      - name: Publish to npm
        run: |
          cd src/lib/agents
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Package Verification

After publishing, verify the package:

### 1. Check npm Registry

```bash
npm view @altanlabs/sdk
```

### 2. Test Installation

In a test project:

```bash
npm install @altanlabs/sdk
```

### 3. Verify Types

Check TypeScript definitions:

```typescript
import { AltanSDK } from '@altanlabs/sdk';
// Should have full type support
```

## Common Issues & Solutions

### 1. 403 Forbidden Error

**Problem**: No permission to publish to `@altanlabs`

**Solution**: 
- Verify you're a member of the organization
- Contact npm support to add you to the organization

### 2. Version Already Exists

**Problem**: Trying to publish the same version twice

**Solution**:
```bash
npm version patch  # Increment version
npm publish
```

### 3. Build Errors

**Problem**: TypeScript compilation fails

**Solution**:
- Fix TypeScript errors
- Update dependencies if needed
- Check `tsconfig.json` configuration

### 4. Missing Files in Package

**Problem**: Important files not included in published package

**Solution**:
- Check `files` array in `package.json`
- Review `.npmignore` file
- Use `npm pack` to test what will be included

## Best Practices

### 1. Version Strategy

- **Patch** (1.0.x): Bug fixes, no breaking changes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

### 2. Testing Before Publish

```bash
# Build and test
npm run build
npm run type-check
npm run lint

# Test package contents
npm pack
tar -tzf altanlabs-sdk-*.tgz
```

### 3. Documentation Updates

- Update README.md with new features
- Update CHANGELOG.md
- Ensure examples are current

### 4. Security

- Never publish with debug/development tokens
- Review dependencies for vulnerabilities
- Use `npm audit` regularly

## Rollback Instructions

If you need to unpublish or rollback:

### Unpublish Specific Version (within 24 hours)

```bash
npm unpublish @altanlabs/sdk@1.0.0
```

### Deprecate Version

```bash
npm deprecate @altanlabs/sdk@1.0.0 "Please upgrade to 1.0.1"
```

## Support

For publishing issues:

- **npm Support**: https://npmjs.com/support
- **Internal Issues**: Contact the development team
- **Documentation**: https://docs.npmjs.com/

## Monitoring

After publishing, monitor:

- Download statistics: https://npmjs.com/package/@altanlabs/sdk
- Issues and feedback from users
- Compatibility with different Node.js versions 