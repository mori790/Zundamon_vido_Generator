# U10 Functional Design計画

## Unit

`u10-desktop-packaging-release-readiness`

Units Generationは承認済み計画で省略したため、U10全体を1つのcohesive unitとして扱う。

## 実行チェックリスト

- [x] U10要件、ストーリー、Application Designを確認する。
- [x] Business logic、domain entity、UI stateの設計対象を特定する。
- [x] Functional Designの確認質問を作成する。
- [x] すべての回答を収集する。
- [x] 回答の曖昧さ・矛盾・不足を分析する。
- [x] `business-logic-model.md`を生成する。
- [x] `business-rules.md`を生成する。
- [x] `domain-entities.md`を生成する。
- [x] `frontend-components.md`を生成する。
- [x] Security、Resiliency、PBT要件との整合を検証する。

## 確認質問

すべての`[Answer]:`へ選択肢の文字を記入してください。

### 質問1: Workspaceの必要構造

初回選択時にどこまでWorkspace構造を要求しますか？

A) `input`、`public`、`generated`、`output`を不足時に安全に作成する（推奨）

B) 4 directoryがすべて既存の場合だけ受理する

C) 空folderだけを受理し、template一式をcopyする

D) Repository rootだけを受理する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問2: Workspace参照が無効な場合

保存済みWorkspaceが消失または権限不足の場合、起動時にどうしますか？

A) 制作機能をlockし、再選択または終了だけを許可する（推奨）

B) 現在のworking directoryへ自動fallbackする

C) 新しいdefault Workspaceを自動作成する

D) 読取専用modeで継続する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問3: 外部依存診断の実行時期

CodexとVOICEVOXをいつ診断しますか？

A) 起動後に軽量診断し、利用直前にも対象だけ再診断する（推奨）

B) 起動時だけ診断する

C) 利用直前だけ診断する

D) 利用者が診断buttonを押した場合だけ診断する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問4: Release状態

Release状態の進行をどの規則にしますか？

A) `local-acceptance → signed → notarized → verified → publishable`の順序固定（推奨）

B) 各検証結果を独立flagとして扱う

C) `local`と`public`の2状態だけにする

D) 状態を保存せず、毎回手動判断する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問5: First Run UI

初回設定をどのUIにしますか？

A) 既存画面内のblocking setup viewでWorkspace選択と依存診断を順に表示する（推奨）

B) 別windowのwizardにする

C) OS dialogだけで完結させる

D) 設定画面を開くまで制作画面を表示する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

## 必須成果物

- [x] Workspace、dependency、releaseのbusiness flow
- [x] Validation、fail-closed、cleanup、rollbackのbusiness rule
- [x] Domain entityと関係
- [x] First Run UIのcomponent、state、interaction
- [x] PBT対象propertyと状態不変条件
