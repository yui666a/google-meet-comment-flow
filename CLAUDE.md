# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Extension (Manifest V3) that displays Google Meet chat messages as flowing overlay text (Niconico-style). Chat messages are scraped from the DOM using `MutationObserver` and animated across the screen using the Web Animations API.

- **Repository:** https://github.com/yui666a/google-meet-comment-flow
- **Project Board:** https://github.com/users/yui666a/projects/1/views/1

## Commands

- `npm run dev` — Start Vite dev server with hot reload (popup UI only; full extension testing requires Chrome)
- `npm run build` — TypeScript type-check (`tsc`) + Vite production build to `dist/`
- `npm run preview` — Preview production build locally
- No linter, formatter, or test runner is configured

**Manual extension testing:** `npm run build`, then load `dist/` in Chrome via `chrome://extensions` (Developer Mode) and test on https://meet.google.com/.

## Architecture

```
src/
├── popup/             # React UI for extension popup (settings: color, font size, toggle)
├── contentScripts/    # Injected into meet.google.com pages
│   ├── saveComment.ts    # MutationObserver watches DOM for new chat messages
│   ├── streamComment.ts  # Listens to chrome.storage changes, triggers comment injection
│   └── utils/
├── background/        # Service worker (message hub)
│   ├── index.ts          # Routes chrome.runtime messages (get/set settings, inject comments)
│   └── injectComment.ts  # Creates animated DOM element flowing across the page
```

**Message flow:** Content script detects new chat → sends message to background worker → stored in `chrome.storage.local` → storage change triggers animation injection into the active tab.

**Key extension configuration** is defined inline in `vite.config.ts` (manifest, content script targets, permissions) using `@crxjs/vite-plugin`.

## Important Patterns

- **DOM scraping is brittle by design** (see `docs/adr/0001-use-dom-scraping-for-meet-chat-messages.md`). CSS selectors for Google Meet's chat UI are hardcoded and will break when Meet updates its DOM structure.
- **Chrome APIs used:** `chrome.storage.local` for settings/comments, `chrome.runtime.sendMessage` for popup↔background↔content script communication, `chrome.scripting.executeScript` for injecting into tabs.
- **Settings storage keys:** `comment`, `color`, `fontSize`, `isEnabledStreaming`.
- **Animation:** Comments use `element.animate()` with `z-index: 2147483647`, flowing left-to-right over 6 seconds, auto-removed on completion.

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy-to-store.yml`) builds and publishes to Chrome Web Store on `v*.*.*` tags.
