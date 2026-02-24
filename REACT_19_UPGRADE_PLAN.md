# React 19 Upgrade Plan

A React component library for network visualization.

## Current State

| Package | Current | React 19 Compatible |
|---------|---------|---------------------|
| react | 16.2.0 (dev) | No |
| react-dom | 16.2.0 (dev) | No |
| react-scripts | 1.1.0 (dev) | No (very old CRA) |
| react-select | 5.7.4 | Yes |
| babel packages | 6.x | Deprecated |
| storybook | 5.2.6 | Old |
| peerDependencies | - | No (only up to React 18) |

---

## Critical - Blocks Other Projects

This package is a dependency of hso-admin-frontend and hso-customer-portal. Upgrading this to support React 19 will unblock the upgrade in those projects.

---

## Build Tool Migration

- [ ] Migrate from babel-cli/presets to modern build system (Rollup recommended)
- [ ] Install Rollup: npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-babel @rollup/plugin-replace @babel/core @babel/preset-react @babel/preset-env
- [ ] Create rollup.config.js for library builds
- [ ] Update build scripts in package.json
- [ ] Remove old babel packages and react-scripts

---

## Package Upgrades

- [ ] Update devDependencies React: npm install --save-dev react@19 react-dom@19
- [ ] Verify react-select (5.7.4 is already compatible)
- [ ] Upgrade d3 packages if needed

---

## peerDependencies Update

- [ ] Update peerDependencies to support React 19:
  ```json
  {
    "peerDependencies": {
      "react": "^15.3.1 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
      "react-dom": "^15.3.1 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
    }
  }
  ```

---

## Code Changes

- [ ] Remove PropTypes usage (deprecated in React 19, use TypeScript or remove)
- [ ] Update any React 19-incompatible patterns (ReactDOM.render, findDOMNode, etc.)
- [ ] Review for forwardRef usage

---

## Website/Storybook (This is optional)

Storybook is only for development/documentation and does not affect the published library. It can be upgraded later or replaced with a modern docs site.

- [ ] Upgrade Storybook (optional): npx storybook@latest upgrade
- [ ] Alternative: Create new docs site with Docusaurus/Vite (optional)
- [ ] Update website build if needed (optional)

---

## Testing

- [ ] Build the library: npm run build
- [ ] Verify exports work correctly
- [ ] Test with React 19 consumer app

---

## Validation

- [ ] Run: npm run build
- [ ] Verify peer dependency resolution
- [ ] Publish/release updated version
