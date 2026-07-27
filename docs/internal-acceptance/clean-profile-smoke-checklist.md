# 身内向けClean-profile Smoke Checklist

## 状態

- **現在の実行状態**: Not Run
- **理由**: U11作業時点では、新規Apple Silicon Macまたは新規macOS user profileでの実行環境が未確認。
- **対象artifact**: `local-acceptance` ZIP。一般配布は禁止。

## 前提

- Apple Silicon Mac。
- macOS 13以降。
- 開発者からZIPとSHA-256を直接受け取っている。
- 空のWorkspace folderを用意できる。
- VOICEVOX Engineを用意できる場合は通常Renderを確認する。

## 必須smoke

| Step | 確認内容 | 結果 |
|---|---|---|
| 1 | ZIPとSHA-256を受け取り、READMEの手順で照合する。 | Not Run |
| 2 | アプリを起動する。 | Not Run |
| 3 | 空folderをWorkspaceとして選択する。 | Not Run |
| 4 | `sample-video`を開く。 | Not Run |
| 5 | VOICEVOXありの場合は通常Renderを実行する。 | Not Run |
| 6 | 生成されたMP4が存在し、0 byteではないことを確認する。 | Not Run |

## VOICEVOXを用意できない場合

VOICEVOXなしの経路は、利用者単独の通常手順ではなく開発者支援手順として扱う。

- 既存音声が含まれるWorkspaceを開発者が用意する。
- または開発者が`--skip-voice`相当のrender確認手順を案内する。
- この経路で確認した場合、証跡には「VOICEVOXなし・開発者支援」と明記する。

## 追加確認

以下は追加確認であり、必須smokeの合否を妨げない。

- Codex診断。
- VOICEVOX診断。
- 台本編集。
- 素材選択。
- Preview。
- Stop。
- Finder reveal。
- 更新。
- Rollback。

## Rollback確認

問題が出た場合は、Workspaceを消さずに直前の既知正常ZIPまたは`.app`へ置き換える。証跡には、置き換えたartifact名、確認日時、再試験結果を記録する。

## 証跡

結果は `docs/internal-acceptance/acceptance-evidence-template.md` をコピーして記録する。

記録時は次を避ける。

- token。
- credential。
- 個人情報。
- 不要な絶対path。

証跡pathは相対pathまたは短い説明を優先する。絶対pathが必要な場合は利用者名などを伏せ字にする。
