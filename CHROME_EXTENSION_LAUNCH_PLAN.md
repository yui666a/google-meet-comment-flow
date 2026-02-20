# Chrome Extension Store 新規公開計画

## 概要

現在の「Google Meet Comment Flow」(ID: `nfhfbmbjgdkblicdmdplioanaochdhih`) と同じ機能を持つ拡張機能を、別アプリとして Chrome Web Store に新規公開する。

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
- [ ] 以下の GitHub Secrets を新しいリポジトリ（またはフォーク先）に設定:
  - `CHROME_WEBSTORE_API_CLIENT_ID`
  - `CHROME_WEBSTORE_API_CLIENT_SECRET`
  - `CHROME_WEBSTORE_API_REFRESH_TOKEN`

---

## Phase 2: 拡張機能のブランディング変更

### 2.1 新しい名前の決定
現在の名前「Google Meet Comment Flow」から変更が必要。候補例:

| 候補名 | メリット | 注意点 |
|--------|---------|--------|
| Meet Comment Stream | シンプル、分かりやすい | "Google" の商標を避けられる |
| NicoFlow for Meet | ニコニコ風を連想 | ニッチだが印象的 |
| Comment Flow for Meet | 汎用的 | 元の名前に近い |
| MeetFlow | 短く覚えやすい | 抽象的 |

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

## Phase 3: コード変更

### 3.1 `vite.config.ts` - マニフェスト更新

```typescript
const manifest = defineManifest({
  manifest_version: 3,
  name: "新しい拡張機能名",        // ← 変更
  version: "1.0.0",               // ← リセット
  description: "短い説明文をここに", // ← 追加
  permissions: ["storage", "scripting"],
  host_permissions: ["https://meet.google.com/*"],  // ← 最小権限に絞る（推奨）
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
- `name`: 新しい名前に変更
- `version`: `1.0.0` にリセット
- `description`: 追加（ストア表示に使用）
- `host_permissions`: `http://*/*`, `https://*/*` → `https://meet.google.com/*` に限定（審査通過のため推奨）
- `icons`: 複数サイズ対応
- `action.default_icon`: 複数サイズ対応

### 3.2 `src/popup/App.tsx` - ヘッダー変更

```tsx
<header>新しい拡張機能名</header>
```

### 3.3 `package.json` - 名前更新

```json
{
  "name": "新しいパッケージ名",
  ...
}
```

### 3.4 `index.html` - タイトル変更

```html
<title>新しい拡張機能名</title>
```

---

## Phase 4: Store リスティング素材の準備

### 4.1 必須素材
- [ ] **スクリーンショット** (1〜5枚)
  - サイズ: 1280x800 または 640x400
  - Google Meet でコメントが流れている様子のキャプチャ
  - 設定ポップアップのキャプチャ
- [ ] **プロモーション用画像**（任意だが推奨）
  - 小タイル: 440x280
- [ ] **アイコン**: 128x128（Phase 2.2 で作成済み）

### 4.2 プライバシーポリシー（必須）
Chrome Web Store では Manifest V3 の拡張機能にプライバシーポリシーが必要。

- [ ] プライバシーポリシーページを作成（GitHub Pages、Notion、Google Sites 等）
- [ ] 以下を記載:
  - 収集するデータ（この拡張機能の場合: なし、またはローカルストレージに設定のみ保存）
  - データの送信先（この拡張機能の場合: 外部送信なし）
  - 第三者とのデータ共有（この拡張機能の場合: なし）

### 4.3 カテゴリ選択
- **推奨カテゴリ**: Productivity（生産性）
- **代替**: Communication（コミュニケーション）

---

## Phase 5: CI/CD パイプラインの設定

### 5.1 デプロイワークフローの更新

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
        uses: actions/setup-node@v4        # ← 追加（Node.js バージョン固定推奨）
        with:
          node-version: '18'

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

## Phase 6: 審査提出とリリース

### 6.1 初回アップロード（手動）
1. `npm run build` でビルド
2. `dist/` フォルダを ZIP に圧縮
3. [Developer Dashboard](https://chrome.google.com/webstore/devconsole/) から「新しいアイテム」をアップロード
4. Store リスティング情報をすべて入力
5. プライバシーへの取り組み（Privacy practices）を入力
6. 「審査に提出」をクリック

### 6.2 審査プロセス
- 通常 **1〜3営業日** で審査完了
- リジェクトされた場合は理由を確認して修正・再提出
- よくあるリジェクト理由:
  - `host_permissions` が広すぎる（`http://*/*` 等）
  - 説明文が不十分
  - プライバシーポリシーが不備
  - 「Google」の商標が名前に含まれている

### 6.3 公開後の確認
- [ ] Store ページが正しく表示されるか確認
- [ ] 拡張機能をインストールして動作確認
- [ ] 拡張機能 ID を `deploy-to-store.yml` に設定
- [ ] CI/CD が正しく動作するか確認（テストタグをプッシュ）

---

## Phase 7: 公開後の運用

### 7.1 バージョン管理
- セマンティックバージョニング（SemVer）に従う
- `vite.config.ts` 内の `version` を更新 + git tag でデプロイ

### 7.2 ユーザーサポート
- [ ] Store のサポート用メールアドレスを設定
- [ ] Issue 管理（GitHub Issues 等）

### 7.3 今後の改善検討事項（任意）
- 権限の最小化（現在 `http://*/*` が含まれている → `https://meet.google.com/*` のみに）
- 多言語対応（`_locales` ディレクトリ追加による Chrome i18n API 対応）
- ストアレビューへの返信対応

---

## タイムライン目安

| フェーズ | 作業内容 | 所要時間 |
|---------|---------|---------|
| Phase 1 | 開発者アカウント準備 | 1日 |
| Phase 2 | ブランディング（名前・ロゴ・説明文） | 1〜2日 |
| Phase 3 | コード変更 | 数時間 |
| Phase 4 | Store リスティング素材準備 | 1日 |
| Phase 5 | CI/CD 設定 | 数時間 |
| Phase 6 | 審査提出〜公開 | 1〜3営業日（審査待ち） |

**合計: 約1週間**（審査期間含む）

---

## チェックリスト（公開前の最終確認）

- [ ] 新しい開発者アカウントが有効
- [ ] 拡張機能名が決定し、商標に抵触しない
- [ ] ロゴ・アイコンが全サイズ揃っている
- [ ] コード内の名前がすべて更新済み
- [ ] `host_permissions` が最小限に設定済み
- [ ] プライバシーポリシーが公開済み
- [ ] スクリーンショットが用意済み
- [ ] 説明文（日英）が準備済み
- [ ] ローカルでビルド＆テスト済み
- [ ] GitHub Secrets が設定済み
- [ ] 初回手動アップロード完了
- [ ] 拡張機能 ID がデプロイワークフローに設定済み
