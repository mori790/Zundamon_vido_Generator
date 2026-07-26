# Tech Stack Decisions: U4 Codex提案と承認フロー

## 提案モデル

- **採用**: TypeScriptのdiscriminated unionで`JsonDraftProposal`と`CommandProposal`を表す。
- **理由**: 既存コードの型構成に一致し、kindごとのpayloadとdispatch先をコンパイル時に限定できる。

## JSON検証

- **採用**: 標準`JSON.parse`と既存`videoScriptSchema`を再利用する。
- **理由**: U3と同じvalidation結果を維持でき、新規依存関係が不要。

## Markdown JSON抽出

- **採用**: 小さなTypeScript関数で`json`コードブロックを順番に抽出する。
- **理由**: 対象は1種類のfenced code blockだけで、Markdown parser全体は不要。
- **制約**: 1 MBを超える返答は抽出しない。

## 状態管理

- **採用**: 既存React stateへProposal collectionを追加し、純粋な状態遷移関数をshared層に置く。
- **理由**: 現在のCodexPanel構成を維持し、単独の状態管理ライブラリを追加しない。

## 永続化形式

- **採用**: `chat-history.json`を次のenvelope形式へ拡張する。

```json
{
  "messages": [],
  "proposals": []
}
```

- **後方互換**: ルートが配列の場合は旧ChatMessage配列として読み込み、proposalsを空配列にする。
- **理由**: メッセージと提案を同じvideo ID単位で一度に保存し、別ファイル間の同期を不要にする。

## 永続化境界

- **採用**: 既存`chat-history-store.ts`の注入可能なFileSystemAccessを拡張する。
- **理由**: 実ファイルとメモリテストの両方で同じ保存処理を検証できる。
- **操作順序**: 状態遷移候補を作成し、保存成功後に画面状態を確定してdispatchする。

## テスト

- **採用**: 既存VitestとReact Testing Library。
- **対象**:
  - 提案抽出。
  - 状態遷移。
  - 1 MB上限。
  - CodexPanel承認操作。
  - U3下書き連携。
  - chat-history.jsonの新旧形式と保存復元。

## 追加しないもの

- Markdown parser dependency。
- 新しい状態管理ライブラリ。
- 新しいvalidation schema library。
- 提案専用データベース。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。
