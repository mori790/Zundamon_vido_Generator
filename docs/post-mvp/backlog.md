# Post-MVP Backlog

## 方針

このbacklogはMVP後の候補を整理するための文書であり、U11では製品コードへ実装しない。Roadmapは日付や工数を確約せず、Next、Later、Futureで管理する。

## 候補一覧

| 候補 | Roadmap | 利用者価値 | 依存 | Risk | 概算規模 |
|---|---|---|---|---|---|
| シリーズ管理 | Next | 複数videoを順序と状態で管理できる。 | Workspace JSON、Start screen設計 | 参照整合性、atomic保存 | Medium |
| テンプレートライブラリ | Next | 新規台本作成を短縮できる。 | VideoScript schema、draft workflow | placeholder validation、schema drift | Medium |
| 複数Workspace管理 | Next | 制作folder切替の手間を減らせる。 | WorkspaceRootService、userData | path権限、未保存作業の保護 | Medium |
| サムネイル自動生成 | Later | 公開準備を効率化できる。 | Render output、画像生成/抽出 | 品質確認、出力管理 | Medium |
| YouTubeアップロード | Later | 公開作業を短縮できる。 | OAuth/API設定、credential管理 | credential漏えい、API failure | Large |
| Render queue | Later | 複数動画の処理をまとめられる。 | Command Runner、progress管理 | 長時間実行、停止/再開 | Large |
| ログ永続化 | Later | 問題調査を容易にする。 | local log store、redaction | secret/PII混入 | Medium |
| Preview filesystem watcher | Later | 台本や素材変更を自動反映できる。 | Preview coordinator、file watcher | 過剰watch、CPU負荷 | Medium |
| Auto Update | Future | 配布更新を簡単にする。 | 署名、公証、update feed | rollback、supply chain | Large |
| DMG/PKG | Future | macOS配布体験を改善する。 | signing/notarization | installer権限、support負荷 | Medium |
| Universal Binary/Intel Mac | Future | Intel Mac利用者を支援する。 | x64 build/test環境 | dependency差分、検証増加 | Large |
| Cloud共有/複数ユーザー | Future | 複数人制作を可能にする。 | 認証、同期、競合解決 | local-only方針との差分 | Large |
| API-key型の代替AI provider | Future | Codex以外のAI選択肢を増やす。 | credential store、provider abstraction | secret管理、出力品質 | Large |
| Codex完全自動実行 | Future | 人手確認を減らせる可能性がある。 | approval policy、rollback、audit | Human Approval境界を弱める | Large |

## 移動条件

Roadmap区分を移動する場合は、価値、依存、risk、概算規模、exit criteriaを再評価し、AI-DLCの承認を得る。
