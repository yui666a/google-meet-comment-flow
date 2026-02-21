# パッケージアップデート計画

本ドキュメントは、google-meet-comment-flow のパッケージを最新バージョンにアップデートするための計画です。
フェーズごとに段階的にアップデートを進めます。

## バージョン一覧

| パッケージ | 現在 | 目標 | 変更規模 |
|---|---|---|---|
| `typescript` | `^4.5.4` | `^5.9.3` | メジャー |
| `vite` | `^2.9.0` | `^7.3.1` | メジャー (5世代) |
| `@vitejs/plugin-react` | `^1.0.7` | `^5.1.4` | メジャー (4世代) |
| `@crxjs/vite-plugin` | `^1.0.14` | `^2.3.0` | メジャー |
| `react` | `^18.0.0` | `^19.2.4` | メジャー |
| `react-dom` | `^18.0.0` | `^19.2.4` | メジャー |
| `@types/chrome` | `^0.0.197` | `^0.1.36` | マイナー |
| `@types/react` | `^18.0.0` | `^19.2.14` | メジャー |
| `@types/react-dom` | `^18.0.0` | `^19.2.3` | メジャー |

---

## Phase 1: TypeScript を 5.9 にアップデート

### 概要

TypeScript を `^4.5.4` → `^5.9.3` にアップデートする。

### 作業内容

- [ ] `typescript` を `^5.9.3` に更新
- [ ] `tsconfig.json` の設定確認
  - `isolatedModules: false` → `true` への変更を検討（Vite 推奨）
- [ ] `tsc` でビルドが通ることを確認
- [ ] 型エラーがあれば修正

### 備考

- TypeScript 5.x は後方互換性が高いため、比較的安全なアップデート
- TypeScript 6.0 Beta が 2026/2/11 にリリースされているが、安定版の 5.9 を採用

---

## Phase 2: Vite 7 + プラグインをアップデート

### 概要

Vite と関連プラグインをメジャーアップデートする。

### 対象パッケージ

| パッケージ | 現在 | 目標 |
|---|---|---|
| `vite` | `^2.9.0` | `^7.3.1` |
| `@vitejs/plugin-react` | `^1.0.7` | `^5.1.4` |
| `@crxjs/vite-plugin` | `^1.0.14` | `^2.3.0` |

### 作業内容

- [ ] Node.js バージョンの確認（Vite 7 は Node.js 20.19+ または 22.12+ が必要）
- [ ] `vite` を `^7.3.1` に更新
- [ ] `@vitejs/plugin-react` を `^5.1.4` に更新
- [ ] `@crxjs/vite-plugin` を `^2.3.0` に更新
- [ ] `vite.config.ts` の設定を確認・調整
  - `@crxjs/vite-plugin` v2 の API 変更に対応
  - `defineManifest` の互換性を確認
- [ ] `tsconfig.node.json` の設定確認
- [ ] `vite build` でビルドが通ることを確認

### 注意点

- Vite 2 → 7 は5世代のメジャーバージョンジャンプ。破壊的変更が多い可能性あり
- `@crxjs/vite-plugin` v2 は Vite 3-8 対応。メンテナンス状況に注意
- 問題が発生した場合、フォーク (`@nicolartin/crxjs-vite-plugin` 等) も検討

### 依存関係

- Phase 1 (TypeScript アップデート) の完了後に着手

---

## Phase 3: React 19 にアップデート

### 概要

React と ReactDOM を 18 → 19 にメジャーアップデートする。

### 対象パッケージ

| パッケージ | 現在 | 目標 |
|---|---|---|
| `react` | `^18.0.0` | `^19.2.4` |
| `react-dom` | `^18.0.0` | `^19.2.4` |

### 作業内容

- [ ] `react` を `^19.2.4` に更新
- [ ] `react-dom` を `^19.2.4` に更新
- [ ] `src/popup/main.tsx` の確認
  - `ReactDOM.render` → `createRoot` への移行（React 19 で `render` は削除済み）
- [ ] `src/popup/App.tsx` の確認・修正
- [ ] `ref` の扱いの変更確認（`forwardRef` が不要に）
- [ ] ビルド確認

### React 19 の主な破壊的変更

- `ReactDOM.render` / `ReactDOM.hydrate` の削除
- `ref` がプロパティとして渡せるように（`forwardRef` 不要）
- `useRef` に引数が必須
- `act()` のインポート元変更
- 詳細: https://react.dev/blog/2024/04/25/react-19-upgrade-guide

### 備考

- 本プロジェクトは小規模（popup UI のみ）なので影響は限定的
- `createRoot` が既に使われている場合、移行は最小限で済む

### 依存関係

- Phase 2 (Vite アップデート) の完了後に着手

---

## Phase 4: 型定義パッケージをアップデート

### 概要

TypeScript 型定義パッケージを最新バージョンにアップデートする。

### 対象パッケージ

| パッケージ | 現在 | 目標 |
|---|---|---|
| `@types/chrome` | `^0.0.197` | `^0.1.36` |
| `@types/react` | `^18.0.0` | `^19.2.14` |
| `@types/react-dom` | `^18.0.0` | `^19.2.3` |

### 作業内容

- [ ] `@types/chrome` を `^0.1.36` に更新
- [ ] `@types/react` を `^19.2.14` に更新
- [ ] `@types/react-dom` を `^19.2.3` に更新
- [ ] 型エラーの修正
  - Chrome Extension API の型定義変更に対応
  - React 19 の型定義変更に対応
- [ ] `tsc` でビルド確認

### 備考

- `@types/react` と `@types/react-dom` は React 19 アップデート (Phase 3) と同時に行ってもよい
- `@types/chrome` は Chrome Extension Manifest V3 の新しい API 型を含む

### 依存関係

- Phase 3 (React アップデート) の完了後に着手

---

## Phase 5: 全体ビルド・動作確認

### 概要

全パッケージアップデート完了後の最終確認を行う。

### 作業内容

- [ ] `rm -rf node_modules package-lock.json` でクリーンインストール
- [ ] `npm install` で依存関係を再インストール
- [ ] `npm run build` (`tsc && vite build`) でビルドが通ることを確認
- [ ] Chrome にエクステンションをロードして動作確認
  - [ ] Google Meet でコメントフロー機能が動作すること
  - [ ] ポップアップ UI が正常に表示されること
  - [ ] 設定（色、フォントサイズ、有効/無効）が保存・反映されること
- [ ] `package-lock.json` をコミット

### 依存関係

- Phase 1 〜 Phase 4 すべて完了後に実施
