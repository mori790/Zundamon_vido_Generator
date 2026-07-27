# Frontend Components: U4 Codex提案と承認フロー

## Component Hierarchy

- `StudioApp`
  - `ScriptReviewPanel`
    - `ApplyConfirmation`
  - `CodexPanel`
    - `CodexMessageItem`
      - `ProposalCard`
        - `ProposalActions`
    - `DraftReplacementConfirmation`

## CodexPanel

- Codex返答を通常本文と提案へ分けて表示する。
- 提案状態をチャット履歴とともに読み込み、保存する。
- JSON提案の成功時に、U3下書きを更新するコールバックを呼ぶ。
- コマンド提案の成功時に、U6 Command Runnerへoperationを渡す。

## ProposalCard

### Props

- `proposal`
- `onApprove(proposalId)`
- `onReject(proposalId)`
- `commandRunnerAvailable`

### 表示

- 提案種類。
- JSON提案の概要、またはコマンドoperation。
- `pending`、`approved`、`rejected`、`completed`、`failed`の状態。
- 失敗理由。

### 操作

- `pending`だけApproveとRejectを表示する。
- 操作中の二重送信を防ぐ。
- 状態はテキストでも表示し、色だけに依存しない。

## DraftReplacementConfirmation

- 未適用のU3下書きがある場合だけ表示する。
- 現在の下書きを維持するCancelと、新しい提案へ置き換えるConfirmを提供する。
- Cancelでは提案を`pending`に維持する。
- Confirm後、U3下書きを置換してApply確認領域へ移動する。

## ApplyConfirmation

- JSON提案のApprove後にU3側で表示する。
- 下書きが正式保存前であることを明示する。
- Applyと編集継続を提供する。
- ApplyはU3の既存validation、backup、save処理を再利用する。

## Command Runner Integration

- U6未接続でもコマンド提案のApproveを受け付ける。
- 未接続時は提案を`failed`にし、「Command Runner未接続」を表示する。
- U6接続後はoperation名だけを渡し、Codex由来の任意コマンド文字列を実行しない。

## Automation and Accessibility

- Approve、Reject、Confirm、Cancel、Applyはbutton要素を使う。
- 安定した`data-testid`を`proposal-{kind}-{action}`形式で付ける。
- 確認表示へフォーカスを移し、キーボードだけで選択できるようにする。
- 提案状態とエラーをテキストで通知する。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。
