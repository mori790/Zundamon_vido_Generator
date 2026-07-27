# U10 Application Design計画

## 実行チェックリスト

- [x] U10要件、ストーリー、実行計画、既存architectureを確認する。
- [x] 追加・変更するcomponent責務の候補を整理する。
- [x] 設計判断の確認質問を作成する。
- [x] すべての回答を収集する。
- [x] 回答の曖昧さ・矛盾・不足を分析する。
- [x] `components.md`をU10向けに更新する。
- [x] `component-methods.md`をU10向けに更新する。
- [x] `services.md`をU10向けに更新する。
- [x] `component-dependency.md`をU10向けに更新する。
- [x] `application-design.md`へ統合する。
- [x] 設計の完全性と整合性を検証する。

## 最小設計方針

- 既存のElectron Main／Preload／Renderer境界を維持する。
- Workspace、dependency diagnosis、release verificationはMainが所有する。
- Rendererには目的別の狭いIPCだけを公開する。
- Forge設定とrelease scriptはruntime serviceへ抽象化しない。
- 詳細な状態遷移と検証規則はFunctional Designで定義する。

## 確認質問

すべての`[Answer]:`へ選択肢の文字を記入してください。

### 質問1: Workspace責務

Workspace選択、検証、保存済み参照の復元をどこへ配置しますか？

A) Electron Mainの1つのWorkspace serviceへ集約する（推奨）

B) 選択はMain、検証と状態管理はRendererへ分ける

C) 既存local-file serviceへすべて追加する

D) 新しい独立processへ分離する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問2: 外部依存診断

Codex CLIとVOICEVOXの診断componentをどう構成しますか？

A) Main内の1つのDependency Diagnosis serviceで種類別adapterを呼ぶ（推奨）

B) CodexとVOICEVOXを完全に別serviceとして実装する

C) 既存Codex serviceとCommand Runnerへ個別に追加する

D) Rendererから直接診断する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問3: Release logicの境界

署名・公証、manifest、checksum、配布可否判定をどこへ置きますか？

A) Build scriptと純粋なrelease moduleへ限定し、通常のアプリruntimeへ含めない（推奨）

B) Electron MainのRelease serviceとしてruntimeへ含める

C) Forge configurationだけへ記述する

D) 外部の手動shell手順だけで扱う

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問4: Rendererへの公開方法

Workspaceと依存診断の結果をRendererへどう公開しますか？

A) 既存preload patternに合わせた目的別typed APIを追加する（推奨）

B) 1つの汎用invoke APIを追加する

C) local-file APIを拡張して兼用する

D) RendererへNode APIを公開する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

## 必須成果物

- [x] Component名、目的、責務、interface
- [x] Method signature、input／output、高水準の目的
- [x] Service責務とorchestration
- [x] Dependency matrix、communication、data flow
- [x] Security、Resiliency、PBT設計制約との整合
