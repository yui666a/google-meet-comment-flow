# ADR-0001: Google Meet チャットメッセージ取得に DOM スクレイピングを採用する

## ステータス

承認済み (Accepted)

## コンテキスト

Google Meet Comment Flow は、Google Meet のチャットメッセージを取得し、画面上にニコニコ動画風に流す Chrome 拡張機能である。
チャットメッセージをリアルタイムに取得する方法を選定する必要がある。

## 検討した選択肢

### 1. Google Meet REST API

Google が公式に提供する REST API。会議の作成・管理、録画・文字起こしといった**会議後の成果物**の取得が可能。

- **不採用理由**: リアルタイムのチャットメッセージ取得機能を提供していない。会議中のチャットデータへのアクセスは API のスコープ外。

### 2. Google Meet Media API (Developer Preview)

リアルタイムの音声・映像ストリームにアクセスできる API。2025年時点で Developer Preview として提供中。

- **不採用理由**:
  - チャットメッセージは対象外（音声・映像ストリームのみ）
  - 全参加者が Developer Preview Program に登録されている必要があり、一般ユーザー向けの拡張機能には不適
  - Developer Preview であり、本番利用は非推奨

### 3. Google Meet Add-ons SDK

Meet 内にアプリを埋め込む SDK。Co-Doing / Co-Watching といったリアルタイム共同作業を実現可能。

- **不採用理由**: チャットメッセージの読み取り機能を提供していない。Meet 内にカスタム UI を埋め込むための SDK であり、ユースケースが異なる。

### 4. サードパーティ Meeting Bot API（Recall.ai 等）

ボットを会議に参加させ、チャットメッセージを含む会議データを取得するサービス。

- **不採用理由**:
  - 有料サービスであり、無料の Chrome 拡張機能のバックエンドとしてはコストが見合わない
  - サーバーサイドのインフラが必要になり、アーキテクチャが大幅に複雑化する
  - ボットが会議に参加するため、参加者から見て不自然

### 5. DOM スクレイピング（MutationObserver）  **← 採用**

Chrome 拡張機能の Content Script から Google Meet のチャット UI の DOM を `MutationObserver` で監視し、メッセージを取得する。

## 決定

**DOM スクレイピング（MutationObserver による DOM 監視）を採用する。**

## 根拠

- **リアルタイム取得が可能**: `MutationObserver` により、チャットメッセージが DOM に追加された瞬間に検知できる
- **サーバー不要**: Chrome 拡張機能単体で完結し、外部サービスへの依存がない
- **無料で提供可能**: 追加コストなしでユーザーに提供できる
- **唯一の実現可能な方法**: 2025年2月時点で、Google Meet のリアルタイムチャットメッセージを取得できる公開 API は存在しない

## リスクと対策

### リスク: Google Meet の UI 変更によるセレクター破損

Google Meet の DOM 構造やクラス名は予告なく変更される可能性があり、CSS セレクターがハードコードされている現行実装は UI 変更の影響を受けやすい。

### 対策（将来の改善候補）

- `aria-label` や `data-*` 属性など、より安定した属性をセレクターに活用する
- 複数のセレクター候補を用意し、フォールバック機構を導入する
- セレクター破損を検知する仕組みを追加し、迅速な対応を可能にする

## 参考リンク

- [Google Meet SDK and API overview](https://developers.google.com/workspace/meet/overview)
- [Google Meet REST API overview](https://developers.google.com/workspace/meet/api/guides/overview)
- [Meet Media API overview](https://developers.google.com/workspace/meet/media-api/guides/overview)
- [Google Meet Add-ons SDK](https://developers.google.com/workspace/meet/add-ons/guides/overview)
- [Recall.ai - Google Meet Bot API](https://www.recall.ai/product/meeting-bot-api/google-meet)
