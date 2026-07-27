# U12 Execution Plan: テキスト起点シーン編集パイプライン

## 詳細分析サマリー

### 変換スコープ

- **変換種別**: 既存Electron GUIへの新しい入力パイプライン追加（テキスト → シーン分割 → 素材割り当て → JSON自動生成）。
- **主な変更箇所**: テキスト入力パネル、AIシーン分割エンジン（Codex経由）、シーン調整UI、素材推薦パネル、JSON自動生成ロジック。
- **関連コンポーネント**: 既存のCodexパネル（U2）、台本ドラフト編集UI（U3）、コマンド実行パネル（U6）、Remotionプレビュー（U7）、レンダリングパイプライン。
- **今回スコープ外**: 素材ライブラリ管理UI、複数プロジェクト同時編集、クラウド保存、シリーズ管理、テンプレートライブラリ。

### 変更影響評価

- **ユーザー向け変更**: あり。草案テキストからJSONを手作成せずに動画を組み立てる新しいフローが追加される。
- **構造的変更**: 中程度。新しいUIパネルと状態管理が追加されるが、既存レンダリングパイプラインは変更しない。
- **データモデル変更**: 新たにシーン分割ドラフト状態の永続化が必要。出力形式（`VideoScript` JSON）は既存と同じ。
- **APIの変更**: Codexパネルを素材推薦・シーン分割のAIエンジンとして活用。既存IPC契約は維持。
- **NFR影響**: あり。30+シーン対応、ドラフト永続化、AIレスポンス待機、素材パス検証が必要。

### コンポーネント関係

- **主コンポーネント**: `zundamon-video-generator` Electron Studioアプリ内に新パネルを追加。
- **Codex依存境界**: シーン分割・素材推薦はCodexパネル（U2実装）経由。Codexが利用できない場合は処理を中断しエラー表示。
- **assets依存境界**: 現行の `assets/` フォルダをそのまま参照。新たなライブラリ管理UIは追加しない。
- **JSON出力境界**: 生成結果は既存の `input/{id}.json` 形式（`VideoScript`）に準拠。

| コンポーネント | 変更種別 | 変更理由 | 優先度 |
|---|---|---|---|
| テキスト入力パネル | 新規UI | 草案テキストの受け取り口 | Critical |
| AIシーン分割エンジン | 新規ロジック | Codex経由のセマンティック分割 | Critical |
| シーン調整UI | 新規UI（U3拡張） | 分割結果の確認・編集 | Critical |
| 素材推薦パネル | 新規UI + ロジック | AI推薦 + 人間確認フロー | Critical |
| JSON自動生成 | 新規ロジック | 既存パイプラインへのブリッジ | Critical |
| 既存レンダリング | 変更なし | 既存パイプラインを再利用 | N/A |

### リスク評価

- **リスクレベル**: 高。
- **ロールバック複雑度**: 中程度。新規パネルは既存ルートと独立しているため切り離しやすいが、状態管理の競合に注意。
- **テスト複雑度**: 高。AIシーン分割はCodexのモック/スタブが必要。素材推薦はassetsフォルダのテスト用フィクスチャが必要。
- **主リスク**:
  - Codex接続なしでシーン分割が失敗した場合の状態の扱い。
  - 30+シーンの大規模データでのUI描画性能。
  - 生成JSONとシーン一覧UIの同期ロジックの複雑化。
  - assetsフォルダ内の素材ファイルが存在しない場合の推薦ロジック挙動。

---

## モジュール更新戦略

- **更新アプローチ**: 5つの実装ユニットを依存順に逐次実装。
- **クリティカルパス**: テキスト入力 → AI分割 → シーン調整 → 素材推薦 → JSON生成 → パイプライン接続。
- **調整ポイント**: Codexパネル（U2）との型契約、`VideoScript` JSON形式、assetsフォルダのパス解決。
- **テストチェックポイント**: 各ユニット完了後にtypecheck、unit tests、Studioビルドを実行。

---

## ワークフロー可視化

### テキスト図

```text
INCEPTION
- Workspace Detection: COMPLETED（U11まで完了）
- Reverse Engineering:  COMPLETED
- Requirements Analysis: COMPLETED
- User Stories:         COMPLETED
- Workflow Planning:    IN REVIEW ← 現在
- Application Design:   EXECUTE
- Units Generation:     EXECUTE

CONSTRUCTION（ユニットごとに繰り返す）
- Functional Design:    EXECUTE
- NFR Requirements:     EXECUTE
- NFR Design:           EXECUTE
- Infrastructure Design: SKIP
- Code Generation:      PLAN ONLY（実装計画書まで作成、コード生成は次フェーズ）
- Build and Test:       DEFER（コード生成時に実施）

OPERATIONS
- Operations:           PLACEHOLDER
```

---

## 実行フェーズ詳細

### INCEPTION フェーズ

- [x] Workspace Detection — COMPLETED
- [x] Reverse Engineering — COMPLETED
- [x] Requirements Analysis — COMPLETED
- [x] User Stories — COMPLETED
- [x] Workflow Planning — IN REVIEW（このドキュメント）
- [ ] Application Design — EXECUTE
  - **理由**: テキスト入力パネル、AIシーン分割エンジン、シーン調整UI、素材推薦パネル、JSON自動生成の5コンポーネントの責務・境界・依存を定義する必要がある。
- [ ] Units Generation — EXECUTE
  - **理由**: 5つの新規コンポーネントは実装ユニットとして順序付けする必要がある。依存関係（分割エンジンはCodex契約に依存、素材推薦はassetsフォルダに依存）を整理する。

### CONSTRUCTION フェーズ

- [ ] Functional Design — EXECUTE
  - **理由**: シーン分割のプロンプト設計、素材推薦の選択ロジック、JSON生成ルール、シーン調整のUX挙動の詳細設計が必要。
- [ ] NFR Requirements — EXECUTE
  - **理由**: 30+シーン対応のパフォーマンス、ドラフト永続化の信頼性、Codex失敗時のfail-fast挙動が必要。
- [ ] NFR Design — EXECUTE
  - **理由**: AIレスポンス待機パターン、素材パス検証、JSON同期の設計パターンが必要。
- [ ] Infrastructure Design — SKIP
  - **理由**: クラウドインフラ・デプロイメントの変更なし。
- [ ] Code Generation — PLAN ONLY
  - **理由**: ユーザーが選択した範囲は「実装計画まで」（6-1: B）。コード生成計画書を作成するが、実際のコード実装は次フェーズとして別途承認を得てから開始する。
- [ ] Build and Test — DEFER
  - **理由**: コード生成フェーズ実施時に合わせて実施する。

### OPERATIONS フェーズ

- [ ] Operations — PLACEHOLDER
  - **理由**: U12はローカルアプリ。クラウド・デプロイメント・モニタリングはスコープ外。

---

## 実装ユニット構成（Units Generation先行案）

| ユニットID | ユニット名 | 主要ストーリー | 先行依存 |
|---|---|---|---|
| U12-A | テキスト入力パネル | US-1, US-2 | なし |
| U12-B | AIシーン分割エンジン | US-3 | U12-A、Codexパネル（U2） |
| U12-C | シーン調整UI | US-4, US-5 | U12-B |
| U12-D | 素材推薦パネル | US-6, US-7 | U12-C、assetsフォルダ |
| U12-E | JSON自動生成・パイプライン接続 | US-8, US-9, US-10, US-11 | U12-D、既存JSONパイプライン |

---

## Extension 準拠サマリー

| Extension | 状態 | 適用ルール |
|---|---|---|
| Security Baseline | 適用 | assetsパス検証、Codexへの入力サニタイズ、PII/token非記録、fail-closed Codexエラー処理 |
| Resiliency Baseline | 適用 | ドラフト永続化（アプリ再起動後の継続）、Codex失敗時のtextエリア保持、素材欠損時の個別エラー |
| Property-Based Testing (Partial) | 適用 | JSON生成のround-trip invariant、シーン境界のunique invariant、素材パスのschema-valid invariantをPBT対象とする |
