# 更新、Rollback、Recovery

## 手動更新

1. 制作処理を終了する。
2. 新versionの署名・公証済みZIPとchecksumを確認する。
3. ZIPを展開し、Applications folderのAppを置き換える。
4. 起動後に既存WorkspaceがReadyになることを確認する。

WorkspaceはApp bundle外にあるため、Appの置換では削除されない。

## Rollback

1. 問題のあるAppを終了する。
2. 直前の署名・公証済み既知正常versionへ置き換える。
3. Release noteでWorkspace互換性を確認する。
4. Workspaceを開き、ValidateとPreviewを実行する。

## Recovery

- **Workspace消失**: Backupから復元するか、別folderを再選択する。
- **権限拒否**: FinderのpermissionとmacOS Privacy設定を確認して再選択する。
- **Codex失敗**: Install、version、`codex login`を確認して再診断する。
- **VOICEVOX失敗**: Engineを起動して再診断する。
- **Render失敗**: Logを確認し、partial outputを確認してから再実行する。
- **公証失敗**: 一般配布を中止し、credential、Apple service、entitlementsを確認する。

Appは利用者のWorkspace backupを自動作成しない。通常のbackup対象へWorkspaceを含める。
