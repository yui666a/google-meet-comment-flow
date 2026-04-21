# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, etc.) when working with code in this repository.

## Project Overview

Chrome Extension (Manifest V3) that displays Google Meet chat messages as flowing overlay text (Niconico-style). Chat messages are scraped from the DOM using `MutationObserver` and animated across the screen using the Web Animations API.

- **Repository (canonical):** https://github.com/yui666a/google-meet-comment-flow
- **Project Board:** https://github.com/users/yui666a/projects/1/views/1

## Commands

パッケージマネージャは **pnpm** を使用します。

- `pnpm dev` — Start Vite dev server with hot reload (popup UI only; full extension testing requires Chrome)
- `pnpm build` — TypeScript type-check (`tsc`) + Vite production build to `dist/`
- `pnpm preview` — Preview production build locally
- `pnpm lint` — Biome による lint チェック
- `pnpm format` — Biome によるフォーマットチェック
- `pnpm check` — lint + format の一括チェック
- `pnpm check:fix` — lint + format の一括自動修正
- `pnpm knip` — 未使用の export / dependency / file 検出

**Manual extension testing:** `pnpm build`, then load `dist/` in Chrome via `chrome://extensions` (Developer Mode) and test on https://meet.google.com/.

## Architecture

```
src/
├── popup/                 # React UI for extension popup (settings: color, font size, toggle)
├── contentScripts/        # Injected into meet.google.com pages
│   ├── saveComment.ts        # MutationObserver watches DOM for new chat messages
│   ├── streamComment.ts      # Listens to chrome.storage changes, triggers comment injection
│   ├── extractors/           # Chat UI ごとのメッセージ抽出器 (Google Chat 統合型 / 旧チャット)
│   └── utils/
├── background/            # Service worker (message hub)
│   ├── index.ts              # Routes chrome.runtime messages (dispatch only)
│   ├── handlers/             # メソッドごとのハンドラ (comment / settings)
│   └── injectComment.ts      # Creates animated DOM element flowing across the page
└── shared/                # 型定義・ストレージキーなど popup/background/content 共有物
```

**Message flow:** Content script detects new chat → sends message to background worker → stored in `chrome.storage.local` → storage change triggers animation injection into the active tab.

**Key extension configuration** is defined inline in `vite.config.ts` (manifest, content script targets, permissions) using `@crxjs/vite-plugin`.

## Important Patterns

- **DOM scraping is brittle by design** (see `docs/adr/0001-use-dom-scraping-for-meet-chat-messages.md`). CSS selectors for Google Meet's chat UI are hardcoded and will break when Meet updates its DOM structure.
- **Chrome APIs used:** `chrome.storage.local` for settings/comments, `chrome.runtime.sendMessage` for popup↔background↔content script communication, `chrome.scripting.executeScript` for injecting into tabs.
- **Settings storage keys:** `comment`, `commentAuthor`, `commentId`, `color`, `fontSize`, `isEnabledStreaming`.
- **Animation:** Comments use `element.animate()` with `z-index: 2147483647`, flowing left-to-right at a constant speed (px/sec), auto-removed on completion.
- **`injectComment.ts` の制約:** `chrome.scripting.executeScript` でページコンテキストに注入されるため、トップレベル import を利用できない。定数・helper は関数内にインラインで持つ必要がある。

## CI/CD

- **CI** (`.github/workflows/ci.yml`): `main` への push / 全 PR で Biome check + Knip + build を実行
- **Deploy** (`.github/workflows/deploy-to-store.yml`): `v*.*.*` タグで Chrome Web Store へ publish

## Pull Request 運用

**canonical repository は `yui666a/google-meet-comment-flow` です。** ローカルの git remote 設定にかかわらず、PR は必ずこのリポジトリに対して作成してください。

- `gh pr create` を使う際は `--repo yui666a/google-meet-comment-flow` を明示する
  ```sh
  gh pr create --repo yui666a/google-meet-comment-flow \
    --head yui666a:<branch> --base main \
    --title "..." --body "..."
  ```
- `upstream` リモートが別アカウント（例: `kazizi55`）を指していることがあるため、`--repo` を付けないと誤って fork 側に PR が作られる
- PR 先を間違えた場合は該当 PR を close し、`yui666a` 側に作り直す
