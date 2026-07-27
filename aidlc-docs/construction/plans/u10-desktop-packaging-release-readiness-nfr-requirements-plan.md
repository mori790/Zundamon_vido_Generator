# U10 NFR Requirements計画

## 実行チェックリスト

- [x] Functional DesignとU10 Extension設定を確認する。
- [x] Performance、Security、Reliability、Maintainability、Usabilityの未確定値を特定する。
- [x] NFR確認質問を作成する。
- [x] すべての回答を収集する。
- [x] 回答の曖昧さ・矛盾・不足を分析する。
- [x] `nfr-requirements.md`を生成する。
- [x] `tech-stack-decisions.md`を生成する。
- [x] Security、Resiliency、PBT rule IDとの準拠を検証する。

## 確認質問

すべての`[Answer]:`へ選択肢の文字を記入してください。

### 質問1: Packaged appの起動性能

新規macOS利用者プロファイルで、起動からFirst Run UI表示までの目標をどうしますか？

A) p95で5秒以内（推奨）

B) p95で10秒以内

C) p95で3秒以内

D) 数値目標を設けず計測だけ行う

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問2: Workspace復元性能

既存Workspace参照の検証開始からReady表示までの目標をどうしますか？

A) 1,000 file以下の通常Workspaceでp95 2秒以内（推奨）

B) p95 5秒以内

C) file数に関係なく1秒以内

D) 数値目標を設けず計測だけ行う

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問3: 依存診断timeout

CodexとVOICEVOXの1回の診断timeoutをどうしますか？

A) Codex 5秒、VOICEVOX 3秒で独立timeout（推奨）

B) 両方10秒

C) 両方30秒

D) timeoutを設けない

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問4: Package容量

arm64 ZIPの容量gateをどうしますか？

A) 初回値を計測し、200 MiBをwarning、300 MiBをblockingにする（推奨）

B) 500 MiBだけをblockingにする

C) 150 MiBをblockingにする

D) 容量gateを設けない

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問5: Security audit gate

Dependency脆弱性をどこまでblockingにしますか？

A) Production dependencyのhigh／criticalをblockingにする（推奨）

B) Criticalだけをblockingにする

C) Development dependencyを含むhigh／criticalをすべてblockingにする

D) 記録だけ行いblockingにしない

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問6: PBT実行量

通常testとrelease gateでfast-checkを何run実行しますか？

A) 通常100 run、release 1,000 run、失敗seedを保存する（推奨）

B) 常に1,000 run

C) 常に100 run

D) 通常testでは実行せずreleaseだけ10,000 run

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問7: 対応macOS

U10の最小対応macOSをどうしますか？

A) macOS 13 Ventura以降（推奨）

B) macOS 14 Sonoma以降

C) macOS 15 Sequoia以降

D) Electronが起動できる全versionを対象にする

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

## 固定済みNFR

- Apple Silicon arm64のみ。
- Local personal tool、criticality Low。
- Context isolation、Node integration無効、typed IPC。
- FileVaultなどOS管理の保存時暗号化とTLS 1.2以上。
- Developer ID、Hardened Runtime、secure timestamp、notarytool。
- Credential非保存、path allowlist、fail closed。
- Manual update／rollback。Cloud HA／DR、auto-update、CI releaseは適用外。
- Exact dependencyと既存Vitest／fast-checkを再利用する。

## 必須成果物

- [x] 定量的Performance／capacity／timeout基準
- [x] Security／supply-chain／privacy基準
- [x] Reliability／recovery／maintainability基準
- [x] Accessibility／日本語error基準
- [x] Tech stack選択と不採用案
- [x] Extension準拠表
