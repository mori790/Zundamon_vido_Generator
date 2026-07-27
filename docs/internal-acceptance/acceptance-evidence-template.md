# 身内向け受入証跡テンプレート

## 実行情報

| 項目 | 値 |
|---|---|
| 実行日時 |  |
| 実行者 |  |
| Mac model |  |
| CPU architecture |  |
| macOS version |  |
| app version |  |
| Git revision |  |
| ZIP名 |  |
| SHA-256 |  |
| FileVault確認 | Not Run |

## 必須smoke結果

| Step | 確認内容 | 結果 | 証跡 |
|---|---|---|---|
| 1 | ZIPとSHA-256を照合した。 | Not Run |  |
| 2 | アプリを起動した。 | Not Run |  |
| 3 | 空folderをWorkspaceとして選択した。 | Not Run |  |
| 4 | `sample-video`を開いた。 | Not Run |  |
| 5 | Renderを実行した。 | Not Run |  |
| 6 | non-zero MP4を確認した。 | Not Run |  |

結果は `Pass`、`Fail`、`Blocked`、`Not Run` のいずれかで記録する。

## 追加確認結果

| 項目 | 結果 | 証跡 |
|---|---|---|
| Codex診断 | Not Run |  |
| VOICEVOX診断 | Not Run |  |
| 台本編集 | Not Run |  |
| 素材選択 | Not Run |  |
| Preview | Not Run |  |
| Stop | Not Run |  |
| Finder reveal | Not Run |  |
| 更新 | Not Run |  |
| Rollback | Not Run |  |

## failure記録

| 項目 | 内容 |
|---|---|
| failure概要 |  |
| 影響 |  |
| 回避策 |  |
| 再試験日時 |  |
| 再試験結果 | Not Run |

## Rollback evidence

| 項目 | 内容 |
|---|---|
| 置き換え前artifact |  |
| 置き換え後artifact |  |
| Workspace維持確認 | Not Run |
| 再起動確認 | Not Run |
| 備考 |  |

## 証跡記録ルール

- 相対pathまたは短い説明を優先する。
- 絶対pathが必要な場合は利用者名や個人情報を伏せ字にする。
- token、credential、個人情報、不要な絶対pathを記録しない。
- screenshot、log、MP4を共有する場合は、内容に秘匿情報が含まれないことを確認する。
