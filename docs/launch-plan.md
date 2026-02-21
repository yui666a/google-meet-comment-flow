# Comment Stream for Meet — 公開計画

## 概要

現在の「Google Meet Comment Flow」(ID: `nfhfbmbjgdkblicdmdplioanaochdhih`) と同じ機能を持つ拡張機能を、**Comment Stream for Meet** として Chrome Web Store に新規公開する。

### 新規公開の理由

既存の拡張機能は別の開発者アカウントで公開されているため、既存アイテムの更新ができない。そのため、新しい開発者アカウントで別アプリとして新規公開する。

---

## Phase 1: Chrome Web Store 開発者アカウントの準備

### 1.1 開発者アカウント登録
- [ ] [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/) にアクセス
- [ ] Google アカウントで登録（既存 or 新規）
- [ ] 開発者登録料 **$5（一回限り）** を支払い
- [ ] 開発者プロフィール情報を入力（表示名、メールアドレス等）

### 1.2 Chrome Web Store API の設定（CI/CD 用）
- [ ] [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
- [ ] Chrome Web Store API を有効化
- [ ] OAuth 2.0 クライアント ID とクライアントシークレットを作成
- [ ] リフレッシュトークンを取得（[手順参考](https://developer.chrome.com/docs/webstore/using-api)）
- [ ] 以下の GitHub Secrets を設定:
  - `CHROME_WEBSTORE_API_CLIENT_ID`
  - `CHROME_WEBSTORE_API_CLIENT_SECRET`
  - `CHROME_WEBSTORE_API_REFRESH_TOKEN`

---

## Phase 2: ブランディング

### 2.1 拡張機能名

**Comment Stream for Meet** に決定済み。

> **注意**: Google の商標ポリシーにより、拡張機能名に「Google」を含めると審査でリジェクトされる可能性がある。「Meet」のみの使用は一般的に許容される。

### 2.2 アイコン・ロゴの作成
- [ ] 新しいロゴを作成（現在の `logo.png` と差別化）
- [ ] 以下のサイズを用意:
  - `icon-16.png` (16x16) - ツールバー用
  - `icon-32.png` (32x32) - Windows 用
  - `icon-48.png` (48x48) - 拡張機能管理ページ用
  - `icon-128.png` (128x128) - Web Store リスティング用

### 2.3 説明文の準備
- [ ] 短い説明文（132 文字以内）: Store リスティングに表示
- [ ] 詳細説明文: Store ページの詳細セクション用
- [ ] 日本語・英語の両方を用意（多言語対応推奨）

---

## Phase 3: パッケージアップデート

公開に先立ち、依存パッケージを最新バージョンにアップデートする。段階的に進め、各ステップでビルド確認を行う。

### バージョン一覧

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

### 3.1 TypeScript を 5.9 にアップデート

- [ ] `typescript` を `^5.9.3` に更新
- [ ] `tsconfig.json` の設定確認
  - `isolatedModules: false` → `true` への変更を検討（Vite 推奨）
- [ ] `tsc` でビルドが通ることを確認
- [ ] 型エラーがあれば修正

> TypeScript 5.x は後方互換性が高いため、比較的安全なアップデート。
> TypeScript 6.0 Beta が 2026/2/11 にリリースされているが、安定版の 5.9 を採用。

### 3.2 Vite 7 + プラグインをアップデート

**Phase 3.1 完了後に着手。**

| パッケージ | 現在 | 目標 |
|---|---|---|
| `vite` | `^2.9.0` | `^7.3.1` |
| `@vitejs/plugin-react` | `^1.0.7` | `^5.1.4` |
| `@crxjs/vite-plugin` | `^1.0.14` | `^2.3.0` |

- [ ] Node.js バージョンの確認（Vite 7 は Node.js 20.19+ または 22.12+ が必要）
- [ ] `vite` を `^7.3.1` に更新
- [ ] `@vitejs/plugin-react` を `^5.1.4` に更新
- [ ] `@crxjs/vite-plugin` を `^2.3.0` に更新
- [ ] `vite.config.ts` の設定を確認・調整
  - `@crxjs/vite-plugin` v2 の API 変更に対応
  - `defineManifest` の互換性を確認
- [ ] `tsconfig.node.json` の設定確認
- [ ] `vite build` でビルドが通ることを確認

> Vite 2 → 7 は5世代のメジャーバージョンジャンプ。破壊的変更が多い可能性あり。
> `@crxjs/vite-plugin` v2 は Vite 3-8 対応。メンテナンス状況に注意。
> 問題が発生した場合、フォーク (`@nicolartin/crxjs-vite-plugin` 等) も検討。

### 3.3 React 19 にアップデート

**Phase 3.2 完了後に着手。**

| パッケージ | 現在 | 目標 |
|---|---|---|
| `react` | `^18.0.0` | `^19.2.4` |
| `react-dom` | `^18.0.0` | `^19.2.4` |

- [ ] `react` を `^19.2.4` に更新
- [ ] `react-dom` を `^19.2.4` に更新
- [ ] `src/popup/main.tsx` の確認
  - `ReactDOM.render` → `createRoot` への移行（React 19 で `render` は削除済み）
- [ ] `src/popup/App.tsx` の確認・修正
- [ ] `ref` の扱いの変更確認（`forwardRef` が不要に）
- [ ] ビルド確認

> React 19 の主な破壊的変更:
> - `ReactDOM.render` / `ReactDOM.hydrate` の削除
> - `ref` がプロパティとして渡せるように（`forwardRef` 不要）
> - `useRef` に引数が必須
> - `act()` のインポート元変更
> - 詳細: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
>
> 本プロジェクトは小規模（popup UI のみ）なので影響は限定的。

### 3.4 型定義パッケージをアップデート

**Phase 3.3 と同時、または完了後に着手。**

| パッケージ | 現在 | 目標 |
|---|---|---|
| `@types/chrome` | `^0.0.197` | `^0.1.36` |
| `@types/react` | `^18.0.0` | `^19.2.14` |
| `@types/react-dom` | `^18.0.0` | `^19.2.3` |

- [ ] `@types/chrome` を `^0.1.36` に更新
- [ ] `@types/react` を `^19.2.14` に更新
- [ ] `@types/react-dom` を `^19.2.3` に更新
- [ ] 型エラーの修正
- [ ] `tsc` でビルド確認

### 3.5 全体ビルド・動作確認

- [ ] `rm -rf node_modules package-lock.json` でクリーンインストール
- [ ] `npm install` で依存関係を再インストール
- [ ] `npm run build` (`tsc && vite build`) でビルドが通ることを確認
- [ ] Chrome にエクステンションをロードして動作確認
  - [ ] Google Meet でコメントフロー機能が動作すること
  - [ ] ポップアップ UI が正常に表示されること
  - [ ] 設定（色、フォントサイズ、有効/無効）が保存・反映されること
- [ ] `package-lock.json` をコミット

---

## Phase 4: コード変更（ブランディング適用）

### 4.1 `vite.config.ts` - マニフェスト更新

```typescript
const manifest = defineManifest({
  manifest_version: 3,
  name: "Comment Stream for Meet",  // ← 変更
  version: "1.0.0",               // ← リセット
  description: "短い説明文をここに", // ← 追加
  permissions: ["storage", "scripting"],
  host_permissions: ["https://meet.google.com/*"],  // ← 最小権限に絞る
  action: {
    default_popup: "index.html",
    default_icon: {
      16: "icons/icon-16.png",    // ← 複数サイズ対応
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
  },
  background: { service_worker: "src/background/index.ts" },
  content_scripts: [
    {
      matches: ["https://meet.google.com/*"],
      js: [
        "src/contentScripts/saveComment.ts",
        "src/contentScripts/streamComment.ts",
      ],
      run_at: "document_start",
    },
  ],
  icons: {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },
});
```

**主な変更点:**
- `name`: `"Comment Stream for Meet"` に変更
- `version`: `1.0.0` にリセット
- `description`: 追加（ストア表示に使用）
- `host_permissions`: `http://*/*`, `https://*/*` → `https://meet.google.com/*` に限定（審査通過のため推奨）
- `icons`: 複数サイズ対応
- `action.default_icon`: 複数サイズ対応

### 4.2 `src/popup/App.tsx` - ヘッダー変更

```tsx
<header>Comment Stream for Meet</header>
```

### 4.3 `package.json` - 名前更新

```json
{
  "name": "comment-stream-for-meet",
  ...
}
```

### 4.4 `index.html` - タイトル変更

```html
<title>Comment Stream for Meet</title>
```

---

## Phase 5: Store リスティング素材の準備

### 5.1 必須素材
- [ ] **スクリーンショット** (1〜5枚)
  - サイズ: 1280x800 または 640x400
  - Google Meet でコメントが流れている様子のキャプチャ
  - 設定ポップアップのキャプチャ
- [ ] **プロモーション用画像**（任意だが推奨）
  - 小タイル: 440x280
- [ ] **アイコン**: 128x128（Phase 2.2 で作成済み）

### 5.2 プライバシーポリシー（必須）

Chrome Web Store では Manifest V3 の拡張機能にプライバシーポリシーが必要。

- [ ] プライバシーポリシーページを作成（GitHub Pages、Notion、Google Sites 等）
- [ ] 以下を記載:
  - 収集するデータ（この拡張機能の場合: なし、またはローカルストレージに設定のみ保存）
  - データの送信先（この拡張機能の場合: 外部送信なし）
  - 第三者とのデータ共有（この拡張機能の場合: なし）

### 5.3 カテゴリ選択
- **推奨カテゴリ**: Productivity（生産性）
- **代替**: Communication（コミュニケーション）

---

## Phase 6: CI/CD パイプラインの設定

`.github/workflows/deploy-to-store.yml` を更新:

```yaml
name: Deploy to Chrome web store

on:
  push:
    tags:
      - "v*.*.*"
  workflow_dispatch:

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4          # ← v2 → v4 にアップデート

      - name: Setup Node.js
        uses: actions/setup-node@v4        # ← 追加（Node.js バージョン固定）
        with:
          node-version: '24'

      - name: Build
        run: |
          npm ci
          npm run build

      - name: Zip dist
        uses: montudor/action-zip@v1
        with:
          args: zip -qq -r release.zip dist

      - name: Upload to Chrome Web Store
        uses: mobilefirstllc/cws-publish@latest
        with:
          action: "publish"
          client_id: ${{ secrets.CHROME_WEBSTORE_API_CLIENT_ID }}
          client_secret: ${{ secrets.CHROME_WEBSTORE_API_CLIENT_SECRET }}
          refresh_token: ${{ secrets.CHROME_WEBSTORE_API_REFRESH_TOKEN }}
          extension_id: "新しい拡張機能のID"  # ← 初回アップロード後に取得
          zip_file: "release.zip"
```

**注意**: `extension_id` は Chrome Web Store に初回手動アップロード後に割り当てられるため、初回は手動でアップロードし、その後 ID を取得して設定する。

---

## Phase 7: 審査提出とリリース

### 7.1 初回アップロード（手動）
1. `npm run build` でビルド
2. `dist/` フォルダを ZIP に圧縮
3. [Developer Dashboard](https://chrome.google.com/webstore/devconsole/) から「新しいアイテム」をアップロード
4. Store リスティング情報をすべて入力
5. プライバシーへの取り組み（Privacy practices）を入力
6. 「審査に提出」をクリック

### 7.2 審査プロセス
- 通常 **1〜3営業日** で審査完了
- リジェクトされた場合は理由を確認して修正・再提出
- よくあるリジェクト理由:
  - `host_permissions` が広すぎる（`http://*/*` 等）
  - 説明文が不十分
  - プライバシーポリシーが不備
  - 「Google」の商標が名前に含まれている

### 7.3 公開後の確認
- [ ] Store ページが正しく表示されるか確認
- [ ] 拡張機能をインストールして動作確認
- [ ] 拡張機能 ID を `deploy-to-store.yml` に設定
- [ ] CI/CD が正しく動作するか確認（テストタグをプッシュ）

---

## Phase 8: 公開後の運用

### 8.1 バージョン管理
- セマンティックバージョニング（SemVer）に従う
- `vite.config.ts` 内の `version` を更新 + git tag でデプロイ

### 8.2 ユーザーサポート
- [ ] Store のサポート用メールアドレスを設定
- [ ] Issue 管理（GitHub Issues 等）

### 8.3 今後の改善検討事項（任意）
- 多言語対応（`_locales` ディレクトリ追加による Chrome i18n API 対応）
- ストアレビューへの返信対応

---

## タイムライン目安

| フェーズ | 作業内容 | 所要時間 |
|---------|---------|---------|
| Phase 1 | 開発者アカウント準備 | 1日 |
| Phase 2 | ブランディング（ロゴ・説明文） | 1〜2日 |
| Phase 3 | パッケージアップデート | 2〜3日 |
| Phase 4 | コード変更（ブランディング適用） | 数時間 |
| Phase 5 | Store リスティング素材準備 | 1日 |
| Phase 6 | CI/CD 設定 | 数時間 |
| Phase 7 | 審査提出〜公開 | 1〜3営業日（審査待ち） |

**合計: 約1.5〜2週間**（審査期間含む）

---

## チェックリスト（公開前の最終確認）

- [ ] 新しい開発者アカウントが有効
- [ ] 拡張機能名が「Comment Stream for Meet」に設定済み
- [ ] ロゴ・アイコンが全サイズ揃っている
- [ ] 全パッケージが最新バージョンにアップデート済み
- [ ] コード内の名前がすべて更新済み
- [ ] `host_permissions` が `https://meet.google.com/*` のみに設定済み
- [ ] プライバシーポリシーが公開済み
- [ ] スクリーンショットが用意済み
- [ ] 説明文（日英）が準備済み
- [ ] ローカルでビルド＆動作テスト済み
- [ ] GitHub Secrets が設定済み
- [ ] 初回手動アップロード完了
- [ ] 拡張機能 ID がデプロイワークフローに設定済み
