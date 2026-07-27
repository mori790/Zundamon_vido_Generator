# E2E Test Instructions

## Creator Workflow

1. Electron Studioを起動してWorkspaceを選択する。
2. Codex proposalを承認し、JSON draftを編集、検証、保存する。
3. Scene assetsを選択し、VoiceとTimelineを生成する。
4. Embedded Previewで映像、音声、字幕、素材を確認する。
5. Renderし、progress、ETA、完了pathを確認する。
6. Finder revealからMP4を開き、音声、字幕、scene transition、末尾cutoffを確認する。

## Failure Workflow

1. Existing outputのoverwriteをcancelし、Renderが開始されないことを確認する。
2. RenderをStopし、partial output warningが表示されることを確認する。
3. Render buttonからmanual retryできることを確認する。

Environment依存のため、GUI E2Eは手動確認を正とする。

## U9 Real Codex Workflow

1. `npm run studio:build` 後にStudioを起動し、Codex接続がRealであることを確認する。
2. Workspaceでメッセージを送信し、stream表示、完了履歴、JSON proposal抽出を確認する。
3. 実行中にStopし、partial textが `未完了` と表示され履歴へ保存されないことを確認する。
4. Workspaceを戻って再度開き、thread resumeを確認する。
5. ReconnectとNew threadを実行し、手動回復を確認する。
6. 安全な操作承認を発生させ、ApproveとDenyを確認する。

Automated Electron boundary:

```bash
npm run test:studio:e2e
```
