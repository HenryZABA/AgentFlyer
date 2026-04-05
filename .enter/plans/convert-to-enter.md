# Plan: Convert AgentFlyer Console UI for Enter Platform

## Context
The project is AgentFlyer - a Node.js AI agent framework with a React console-ui sub-project at `src/gateway/console-ui/`. The current build pipeline (`tsc` -> IIFE library build -> copy) does not work on Enter, which expects a standard React + Vite + Tailwind SPA structure. The goal is to restructure the project so Enter can build and serve the console-ui as a standalone SPA.

## Approach
Promote the console-ui to be the primary application Enter builds, while keeping backend source code untouched in the repo. Enter only needs `index.html` + `vite build` to produce a standard SPA.

## Changes

### 1. Create `index.html` at root
- Standard Vite SPA entry point
- `<script type="module" src="/src/gateway/console-ui/src/main.tsx">`
- Includes splash screen HTML (currently in `src/gateway/console/index.ts`)

### 2. Create `vite.config.ts` at root
- Standard SPA build (NOT IIFE library mode)
- Plugins: `@vitejs/plugin-react` + `@tailwindcss/vite`
- `outDir: 'dist'`
- Remove the console-ui's IIFE library vite config (or ignore it)

### 3. Update `package.json`
- **Scripts**:
  - `"dev": "vite"` 
  - `"build": "vite build"`
  - Keep other scripts (test, check, etc.) for backend dev
- **Dependencies**: Merge from console-ui's `package.json`:
  - `react`, `react-dom`, `marked` -> dependencies
  - `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `vite` -> devDependencies
  - `@types/react`, `@types/react-dom` -> devDependencies

### 4. Update root `tsconfig.json`
- Add `"jsx": "react-jsx"` to support TSX
- Add `"src/gateway/console-ui/src/**/*.ts"` and `*.tsx` to `include`
- Keep existing backend TS config (won't affect Vite build)

### 5. Update `useRpc.ts` - Configurable Backend URL
- Currently reads `window.__AF_TOKEN__` and `window.__AF_PORT__` (injected by server)
- Change to configurable: read from `localStorage` or show a connection settings UI
- Add a fallback/default for demo mode or prompt user to input backend URL + token

### 6. Update `main.tsx`
- Remove splash screen dismissal logic (splash is server-side only)
- Keep simple `createRoot` + `<App />`

## Files Modified
- `index.html` (new)
- `vite.config.ts` (new)
- `package.json` (modify scripts + deps)
- `tsconfig.json` (add JSX support)
- `src/gateway/console-ui/src/hooks/useRpc.ts` (configurable URL)
- `src/gateway/console-ui/src/main.tsx` (simplify)

## Files NOT Modified
- All backend source code (`src/agent/`, `src/channels/`, `src/cli/`, etc.)
- All console-ui components/tabs (they use RPC abstraction, no changes needed)
- `src/gateway/console-ui/vite.config.ts` (kept for standalone backend builds)

## Verification
1. `pnpm install` succeeds
2. `pnpm build` produces a working SPA in `dist/`
3. `pnpm dev` starts Vite dev server with the console UI
4. The app loads and shows the setup wizard or dashboard
