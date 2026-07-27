# NFR Design Patterns: U4 Codex提案と承認フロー

## 保存先行パターン

ApproveまたはRejectは次の順序で処理する。

1. 現在の`pending`提案から次状態を計算する。
2. 対象提案を操作中としてUI上でロックする。
3. 次状態を含むchat-history.jsonを保存する。
4. 保存成功後にReact stateを確定する。
5. Approveの場合だけ、U3またはU6へdispatchする。
6. dispatch結果を`completed`または`failed`として再保存する。

保存に失敗した場合は元の状態へ戻し、自動再試行せず、提案カードにRetryを表示する。U3下書き作成やU6コマンド実行は開始しない。

## 単一実行ガード

- 操作中のproposal IDを集合で保持する。
- `pending`以外、または操作中のproposal IDに対するApproveとRejectを無視する。
- 保存済みの`approved`、`completed`、`rejected`、`failed`は再起動後も操作不可とする。
- U6へ渡すのは定義済みoperationだけとする。

## 履歴サイズ管理

- chat-history.jsonが10 MB以下なら全履歴を保存する。
- 10 MBを超える場合、古い`completed`、`rejected`、`failed`提案と、その提案だけに関連する古いメッセージから削除する。
- `pending`または`approved`提案と関連メッセージは削除しない。
- 削除後も10 MBを超える場合は、それ以上の自動削除を行わず保存エラーとして扱う。
- 削除は保存直前に決定的な順序で行い、同じ入力から同じ結果を作る。

## 同期提案抽出

- 1 MB以下のCodex返答は受信完了時に同期処理する。
- 構造化proposal eventがあればMarkdown走査を行わない。
- fallback時だけ`json` fenced code blockを順に検査する。
- 1 MB超過時は抽出せず、通常メッセージと上限表示だけを行う。
- 代表的な1 MB入力で300 ms以内の目標を自動テストする。
- Web Workerや追加parserは、実測で目標未達になった場合だけ検討する。

## 二段階検証

### 読み込み時

- envelope、messages、proposalsの型を検証する。
- proposalのID、message ID、video ID、kind、status、timestamp、payloadを検証する。
- JSON提案は`videoScriptSchema`、コマンド提案はoperation allowlistで検証する。
- 不正提案は除外し、実行可能状態へ復元しない。
- 有効な通常メッセージは可能な限り保持する。

### Approve時

- JSON提案を最新`videoScriptSchema`で再検証する。
- コマンドoperationをallowlistで再検証する。
- 失敗時はdispatchせず`failed`として保存する。

## 状態所有とロジック分離

- StudioAppが現在のvideo IDに対応するProposal collectionを所有する。
- CodexPanelはproposalsと操作callbackをpropsで受け取る。
- 提案抽出、状態遷移、検証、履歴縮小はshared層の純粋関数にする。
- renderer側storeはファイル読み書きだけを担う。
- U3とU6へのdispatchはStudioAppで接続する。

## アクセシビリティ

- 確認UI表示時、見出しまたは最初の操作buttonへフォーカスを移す。
- 保存中は`aria-busy`とテキストで状態を示す。
- Retry、Approve、Reject、Confirm、Cancelはbutton要素を使う。
- 状態とエラーを色だけで表現しない。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。
