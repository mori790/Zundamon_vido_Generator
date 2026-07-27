# U11 NFR設計パターン

## 設計方針

U11はlocal macOS appの内部受入支援であり、cloud高可用性や認証基盤は扱わない。NFR Designは、未署名artifactの誤配布防止、preflightの失敗封じ込め、証跡の秘匿情報保護、再実行性、将来仕様のPBT接続を中心にする。

## P1: Fail-Closed Preflight Pattern

- **目的**: 不完全なartifactや検証失敗を成功扱いしない。
- **適用箇所**: Acceptance preflight command。
- **設計**:
  - required artifact、checksum、architecture、release stateを最初に検証する。
  - 軽量artifact gateが失敗した場合、build/test gateへ進まず早期終了する。
  - production audit、typecheck、default tests、Studio buildも全て必須gateにする。
  - いずれかのgateが失敗したらexit codeは非0。
- **失敗時action**:
  - missing artifact: local-acceptance artifact生成を案内する。
  - checksum mismatch: ZIPを配布せず再生成を案内する。
  - wrong architecture: arm64 artifact生成を案内する。
  - wrong release state: `local-acceptance` manifest確認を案内する。

## P2: Release Boundary Reuse Pattern

- **目的**: U11独自のrelease-state判定を増やして既存logicとずれることを防ぐ。
- **適用箇所**: Artifact Evidence Reader、Acceptance preflight、README文言。
- **設計**:
  - 既存release manifest、SBOM、SHA-256、release-state contractsを優先して使う。
  - READMEやpreflight reportへrelease判定logicを再実装しない。
  - `local-acceptance`を`publishable`へ昇格させる表現を禁止する。

## P3: Non-Destructive Rerun Pattern

- **目的**: preflight失敗後に安全に再実行できるようにする。
- **適用箇所**: Acceptance preflight command。
- **設計**:
  - Workspace、`input/`、`assets/`、`audio/`、`output/`を変更しない。
  - artifact missing時も自動生成しない。
  - 失敗結果には修正actionを含める。
  - 修正後は同じcommandを再実行できる。

## P4: Gate Progress Reporting Pattern

- **目的**: 数分かかる可能性があるfull gateでも利用者が状況を理解できるようにする。
- **適用箇所**: preflight CLI report。
- **設計**:
  - gate単位で開始、成功、失敗を表示する。
  - 失敗時は次actionと証跡pathを表示する。
  - 詳細logを無制限にstreamしない。
  - 最終summaryでpassed/failedを明示する。

## P5: Secret-Safe Evidence Pattern

- **目的**: reportやtemplateから秘匿情報が漏れることを防ぐ。
- **適用箇所**: Report Formatter、acceptance evidence template、README/checklist。
- **設計**:
  - 相対pathまたは短い説明を優先する。
  - 絶対pathが必要な場合は利用者名などを伏せ字化する。
  - token、credential、個人情報、不要な絶対pathを出さない。
  - docsとpreflight helperの両方で同じ方針を示す。

## P6: Not Run Preservation Pattern

- **目的**: 未実行のclean-profile smokeを合格扱いしない。
- **適用箇所**: checklist、evidence template、README。
- **設計**:
  - statusはPass、Fail、Blocked、Not Runを区別する。
  - U11内で実機環境がない場合はNot Runと明記する。
  - Blockedは未達成ではなく、条件不足として記録する。
  - retest時は元のfailureとretest resultを残す。

## P7: Documentation Boundary Pattern

- **目的**: U11の実装scopeをREADME/docs/preflightに限定し、future featureを実装しない。
- **適用箇所**: Post-MVP docs、Code Generation plan。
- **設計**:
  - `docs/post-mvp/`にbacklog、roadmap、top-three specsを置く。
  - Series、Template、Multiple Workspaceはspecification-onlyと明記する。
  - Future項目はHuman Approval、local-only、Security、Resiliency再評価を必要条件として残す。

## P8: Partial PBT Design Pattern

- **目的**: 文書中心U11で過剰testを避けつつ、新規pure logicの重要propertyを守る。
- **適用箇所**: 新規pure helper、future top-three spec。
- **設計**:
  - fast-checkを継続採用する。
  - shrinkingとseed replayを維持する。
  - example testは主要failure pathを固定する。
  - PBTはpure parser、serializer、normalizer、sanitizer、state summaryだけを対象にする。

| Property | 対象pure helper | Generator制約 | Example testとの分担 |
|---|---|---|---|
| `releaseStateNeverEscalates` | release state summary helper | signing/notarizationの有無、state enum | wrong release stateはexample testで固定 |
| `evidencePathIsSanitized` | evidence path sanitizer | relative path、absolute path、ユーザー名風path、token風文字列 | known secret-like pathはexample testで固定 |
| `manifestChecksumMatchesZip` | checksum comparison helper | SHA-256 hex、manifest hash、actual hash | checksum mismatchはexample testで固定 |
| `seriesRoundTripPreservesOrder` | future series serializer | 0から100件のunique video IDs | future implementationで代表case固定 |
| `templateDraftIsSchemaValid` | future template draft generator | typed placeholders、bounded strings | missing placeholderはexample testで固定 |
| `workspaceReferencesAreCanonicalUnique` | future workspace reference normalizer | duplicate canonical paths、display names | duplicate pathはexample testで固定 |

## Extension準拠

| Extension | 状態 | 根拠 |
|---|---|---|
| Security Baseline | Compliant | artifact integrity、release boundary reuse、secret-safe evidence、unsafe install guidance禁止を設計patternへ反映した。Cloud/network/authはN/A。 |
| Resiliency Baseline | Compliant | fail-closed、non-destructive rerun、rollback evidence、Not Run preservationを設計patternへ反映した。Cloud HAはN/A。 |
| Property-Based Testing (Partial) | Compliant | PBT-02、03、07、08、09を対象helper、generator制約、seed replay、example test分担へ反映した。 |
