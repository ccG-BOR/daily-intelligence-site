# AI Literature Health News Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Vite + React website that presents daily AI, literature, and medical health intelligence with an update script that refreshes structured feed data.

**Architecture:** The app is a client-rendered React dashboard reading `src/data/daily-feed.json`. A Node script in `scripts/update-feed.mjs` fetches public RSS/API sources, normalizes entries, falls back to deterministic seed data when network sources fail, and writes the JSON feed. UI components stay focused: layout, filters, cards, stats, and source badges.

**Tech Stack:** Vite, React, JavaScript modules, CSS, Node.js built-in `fetch`, RSS XML parsing by lightweight regex/tag extraction with defensive fallbacks.

---

### File Structure

- Create: `package.json` for scripts and dependencies.
- Create: `index.html` as Vite entry HTML.
- Create: `vite.config.js` for React plugin.
- Create: `src/main.jsx` to mount React.
- Create: `src/App.jsx` for dashboard state, filtering, and page composition.
- Create: `src/styles.css` for responsive futuristic dashboard styling.
- Create: `src/data/daily-feed.json` for initial and generated content.
- Create: `scripts/update-feed.mjs` for feed refresh.
- Create: `.gitignore` to ignore dependencies/build/brainstorm artifacts.

### Task 1: Scaffold Project

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.js`
- Create: `.gitignore`

- [ ] **Step 1: Create project metadata**

Create `package.json` with scripts:

```json
{
  "name": "daily-intelligence-site",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1",
    "update-feed": "node scripts/update-feed.mjs"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Create Vite entry files**

Create `index.html`:

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

Create `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.superpowers/
```

- [ ] **Step 3: Install dependencies**

Run: `pnpm install`

Expected: dependencies install and `pnpm-lock.yaml` is created.

### Task 2: Data Feed and Update Script

**Files:**
- Create: `src/data/daily-feed.json`
- Create: `scripts/update-feed.mjs`

- [ ] **Step 1: Create initial feed JSON**

Create `src/data/daily-feed.json` with `generatedAt`, `status`, `notices`, `sources`, and `items`. Include at least 9 items across AI, literature, and health.

- [ ] **Step 2: Create update script**

Create `scripts/update-feed.mjs` with:

- Source config for AI, literature, and health.
- RSS fetching with timeout.
- Basic XML item parsing for title, link, date, description.
- PubMed API fetching for medical literature.
- Normalization to common item fields.
- Deduplication by title/link.
- Deterministic fallback items if live sources fail.
- Write output to `src/data/daily-feed.json`.

- [ ] **Step 3: Run feed update**

Run: `pnpm update-feed`

Expected: `src/data/daily-feed.json` is refreshed with current `generatedAt` and at least 9 items.

### Task 3: React Dashboard

**Files:**
- Create: `src/main.jsx`
- Create: `src/App.jsx`

- [ ] **Step 1: Create React mount**

Create `src/main.jsx`:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: Implement dashboard**

Create `src/App.jsx` with:

- Channel tabs for all, AI, literature, health.
- Search input.
- Daily picks section using highlighted items.
- Feed cards with source, date, tags, summaries, original links.
- Stats strip and source list.
- Health research disclaimer.

### Task 4: Styling and Responsive Design

**Files:**
- Create: `src/styles.css`

- [ ] **Step 1: Implement CSS**

Create a deep, futuristic dashboard style with:

- Dark background with subtle data-grid texture.
- Dense but readable layout.
- Responsive grid that collapses on mobile.
- 8px card radius.
- No text overlap at 375px mobile width.
- Reduced motion support.

### Task 5: Verification

**Files:**
- Read/Run project files only.

- [ ] **Step 1: Build**

Run: `pnpm build`

Expected: Vite production build succeeds.

- [ ] **Step 2: Start dev server**

Run: `pnpm dev`

Expected: local URL is printed and the site loads.

- [ ] **Step 3: Browser smoke check**

Open the local site and verify:

- Header, daily picks, cards, search, filters render.
- Switching channel filters changes content.
- Searching a keyword narrows cards.
- Mobile width has no obvious overlap.

