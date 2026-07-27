# U11 NFR論理component

## 概要

U11のNFR論理componentは、preflight、文書生成、Post-MVP仕様作成を分離する。実装時の名前はCode Generationで確定するが、責務境界はこの文書を基準にする。

## LC1: Artifact Evidence Reader

- **責務**:
  - release artifact directoryを解決する。
  - arm64 ZIP、manifest、SBOMの存在を確認する。
  - manifestをbounded parseする。
  - ZIP SHA-256、architecture、release stateを既存release evidence semanticsで確認する。
- **NFR貢献**:
  - Security: artifact integrityとrelease-state separationを守る。
  - Resiliency: 軽量artifact gateで早期失敗できる。
  - Maintainability: 既存release contractsを再利用する。
- **禁止事項**:
  - artifactを自動生成しない。
  - `local-acceptance`を`publishable`と表示しない。
  - Workspaceや制作dataを変更しない。

## LC2: Gate Runner

- **責務**:
  - production dependency audit、typecheck、default tests、Studio buildを順に実行または確認する。
  - gate単位で開始、成功、失敗をReport Formatterへ渡す。
  - 失敗時は後続gateをどう扱ったかを明確にする。
- **NFR貢献**:
  - Security: production dependency auditを必須gateにする。
  - Performance: 長時間checkの進行を表示できる。
  - Resiliency: 失敗時に非0へ集約する。
- **禁止事項**:
  - artifact gate失敗後に重いbuild/test gateへ進まない。
  - 詳細logを無制限にpreflight reportへ流さない。

## LC3: Report Formatter

- **責務**:
  - 日本語のpreflight summaryを生成する。
  - gateごとの開始、成功、失敗、証跡path、次actionを表示する。
  - pathを相対path化または伏せ字化する。
  - token、credential、個人情報、不要な絶対pathを出力から除く。
- **NFR貢献**:
  - Usability: 利用者が次actionを理解しやすい。
  - Security: secret-safe outputを担保する。
  - Resiliency: 再実行可能な修正actionを示す。
- **禁止事項**:
  - 未署名artifactをpublic release readyと表現しない。
  - 利用者のhome pathやcredential-like文字列をそのまま出さない。

## LC4: Documentation Generator

- **責務**:
  - READMEのDesktop-first構成を実装する。
  - `docs/internal-acceptance/`にchecklistとevidence templateを置く。
  - commandをcopy可能なcode blockで示す。
  - 必須smokeと追加確認を分離する。
  - rollback evidenceとWorkspace維持方針を文書化する。
- **NFR貢献**:
  - Usability: 日本語中心で非開発者に分かりやすい。
  - Security: unsafe installation guidanceを避ける。
  - Resiliency: rollbackとNot Run/Blocked/Fail semanticsを文書化する。
- **禁止事項**:
  - Gatekeeper無効化やquarantine削除を通常手順にしない。
  - release判定logicをREADMEへ再実装しない。

## LC5: Post-MVP Spec Writer

- **責務**:
  - `docs/post-mvp/`にbacklog、roadmap、top-three specsを置く。
  - Series、Template、Multiple Workspaceをspecification-onlyとして記録する。
  - property名、entity、generator制約、seed replay方針をfuture specsへ含める。
  - Future項目のHuman Approval、cloud/security/resiliency再評価条件を明記する。
- **NFR貢献**:
  - Maintainability: future implementation unitの入力を整理する。
  - Security: future filesystem accessとschema validation境界を先に明記する。
  - PBT: future data modelのround-tripとinvariantを明確にする。
- **禁止事項**:
  - U11でfuture feature runtime codeを追加しない。
  - roadmapに日付や工数commitmentを含めない。

## Component間連携

| From | To | 連携内容 |
|---|---|---|
| Artifact Evidence Reader | Report Formatter | artifact gate結果、証跡path、失敗action |
| Artifact Evidence Reader | Gate Runner | artifact gateが成功した場合のみbuild/test gate開始を許可 |
| Gate Runner | Report Formatter | audit、typecheck、tests、Studio buildの進行と結果 |
| Documentation Generator | Report Formatter | 用語、release-state表現、秘匿情報方針の統一 |
| Post-MVP Spec Writer | Documentation Generator | READMEからPost-MVP docsへの導線 |

## 実行順序

1. Artifact Evidence Readerが軽量artifact gateを実行する。
2. artifact gateが失敗した場合、Report Formatterが失敗summaryを出し、Gate Runnerは実行しない。
3. artifact gateが成功した場合、Gate Runnerがproduction audit、typecheck、default tests、Studio buildを実行する。
4. Report Formatterがgate単位の進行と最終summaryを日本語で出す。
5. Documentation GeneratorとPost-MVP Spec WriterはCode Generation時に文書成果物を作る。

## Extension準拠

| Extension | 状態 | 根拠 |
|---|---|---|
| Security Baseline | Compliant | LC1とLC3がartifact integrity、release-state separation、secret-safe outputを担う。Cloud/network/authはN/A。 |
| Resiliency Baseline | Compliant | LC1とLC2が早期失敗、再実行性、non-destructive behavior、fail-closed exitを担う。Cloud HAはN/A。 |
| Property-Based Testing (Partial) | Compliant | LC3とLC5が新規pure helperとfuture specsのPBT対象を明確にする。 |
