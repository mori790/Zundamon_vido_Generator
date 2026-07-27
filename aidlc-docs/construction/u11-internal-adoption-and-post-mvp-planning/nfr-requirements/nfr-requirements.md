# U11 非機能要件

## 対象範囲

対象unitは `u11-internal-adoption-and-post-mvp-planning`。U11ではREADME、内部受入文書、preflight command、Post-MVP企画文書、focused testsを扱う。シリーズ管理、テンプレートライブラリ、複数Workspace管理は仕様のみで、製品コードへ実装しない。

## Security要件

| ID | 要件 | 適用理由 | 検証方針 |
|---|---|---|---|
| U11-NFR-SEC-1 | `local-acceptance` artifactを一般配布可能と表現しない。 | 未署名・未公証artifactの誤配布を防ぐ。 | README、checklist、preflight reportの文言確認。 |
| U11-NFR-SEC-2 | ZIPのSHA-256とmanifest evidenceを照合する。 | artifact integrityを保証する。 | checksum一致・不一致のexample test。 |
| U11-NFR-SEC-3 | SBOMとproduction dependency auditを必須gateにする。 | supply chain riskを検出する。 | `npm audit --omit=dev`相当のgate失敗時に非0。 |
| U11-NFR-SEC-4 | token、credential、個人情報、不要な絶対pathをreportやtemplateへ出さない。 | 秘匿情報漏えいを防ぐ。 | redaction／relative path方針の文書確認と純粋helper test。 |
| U11-NFR-SEC-5 | Gatekeeper無効化やquarantine削除を通常手順にしない。 | unsafeな利用者手順を避ける。 | README/checklist文言確認。 |
| U11-NFR-SEC-6 | 将来仕様はruntime schema validationとMain-mediated filesystem accessを要求する。 | 将来featureの設計段階で境界を固定する。 | Post-MVP top-three spec review。 |

## Resiliency要件

| ID | 要件 | 適用理由 | 検証方針 |
|---|---|---|---|
| U11-NFR-RES-1 | workload criticalityはLow、RTOは数時間、RPOは直近manual backup時点とする。 | 身内向けlocal appの復旧期待値に合わせる。 | README/checklist/evidence templateで明記。 |
| U11-NFR-RES-2 | preflightは再実行可能で、Workspace、input、asset、audio、outputを変更しない。 | 失敗後の再試行と利用者data保護を両立する。 | non-destructive testとコードレビュー。 |
| U11-NFR-RES-3 | preflightは必須gateのどれかが失敗したら非0で終了する。 | 不完全なartifact配布をfail closedにする。 | missing artifact、checksum mismatch、wrong architecture、wrong release state、gate failure test。 |
| U11-NFR-RES-4 | release artifactがない場合、自動生成せず生成actionと想定証跡pathを示す。 | 想定外の重い処理やartifact上書きを避ける。 | missing artifact test。 |
| U11-NFR-RES-5 | rollback evidenceとして、直前の既知正常ZIPまたは`.app`への置換とWorkspace維持を記録する。 | local direct/in-place deploymentの復旧手段を明確化する。 | README、checklist、evidence template、Post-MVP docs確認。 |
| U11-NFR-RES-6 | acceptance statusはPass、Fail、Blocked、Not Runを区別する。 | 未実行を合格扱いしない。 | evidence template review。 |

## Performance要件

| ID | 要件 | 適用理由 | 検証方針 |
|---|---|---|---|
| U11-NFR-PERF-1 | preflight full gateは数分以内を目安にする。厳密な秒数SLAは設定しない。 | `test`と`studio:build`を含むため環境差が大きい。 | 実行時にcheck名と進行状況を表示する。 |
| U11-NFR-PERF-2 | 時間がかかるcheckは開始・終了・失敗を表示する。 | 利用者が停止・再試行判断をしやすくする。 | report snapshot testまたはCLI output確認。 |
| U11-NFR-PERF-3 | preflightは不要なartifact full scanを避ける。 | 受入確認の待ち時間を抑える。 | 実装時に既知artifact pathとmanifest参照を優先する。 |

## Usability要件

| ID | 要件 | 適用理由 | 検証方針 |
|---|---|---|---|
| U11-NFR-USE-1 | README、checklist、preflight reportは日本語中心にする。 | 身内の非開発者が理解しやすくする。 | 文書レビュー。 |
| U11-NFR-USE-2 | commandはcopy可能なcode blockで示す。 | 実行ミスを減らす。 | Markdown review。 |
| U11-NFR-USE-3 | 必須smokeと追加確認を明確に分ける。 | 最小合格基準を曖昧にしない。 | checklist review。 |
| U11-NFR-USE-4 | 失敗時は原因分類、次のaction、証跡pathを日本語で示す。 | 開発者へ相談しやすくする。 | CLI report test。 |

## Maintainability要件

| ID | 要件 | 適用理由 | 検証方針 |
|---|---|---|---|
| U11-NFR-MAINT-1 | release-state logicは既存release verifier／shared contractsを再利用する。 | 二重実装による判定ずれを防ぐ。 | code review。 |
| U11-NFR-MAINT-2 | READMEにrelease判定logicを再実装しない。 | 文書と実装の不一致を防ぐ。 | README review。 |
| U11-NFR-MAINT-3 | Post-MVP docsは `docs/post-mvp/` へ分離する。 | 将来実装unitが参照しやすくする。 | file placement review。 |
| U11-NFR-MAINT-4 | U11で将来featureの製品コードを追加しない。 | scope creepを防ぐ。 | git diff review。 |

## Testability / PBT要件

| ID | 要件 | 適用理由 | 検証方針 |
|---|---|---|---|
| U11-NFR-PBT-1 | PBT frameworkは既存のfast-checkを継続採用する。 | TypeScript/Vitest環境と整合する。 | `package.json`とtest setup確認。 |
| U11-NFR-PBT-2 | 新規pure parser/serializer/normalizerだけPartial PBT必須にする。 | 文書中心U11で過剰testを避ける。 | code generation planとtest review。 |
| U11-NFR-PBT-3 | PBTはshrinkingとseed replayを維持する。 | 失敗時の再現性を確保する。 | test scriptまたはtest output確認。 |
| U11-NFR-PBT-4 | 重要failure pathはexample testで固定する。 | PBTだけに依存しない。 | missing artifact、checksum mismatch、wrong architecture、wrong release state、audit failure test。 |

## Extension準拠

| Extension | 状態 | 根拠 |
|---|---|---|
| Security Baseline | Compliant | SECURITY-10、SECURITY-13をartifact integrity、SBOM、audit、checksumへ反映。SECRET/PII非表示とbounded validationも明記。Cloud、public API、auth、network intermediaryはU11ではN/A。 |
| Resiliency Baseline | Compliant | RESILIENCY-01、02、03、04、15相当をLow criticality、RTO/RPO、local rollback、direct/in-place、incident/evidence記録へ反映。Cloud HAやmulti-regionはN/A。 |
| Property-Based Testing (Partial) | Compliant | PBT-02、03、07、08、09を新規pure logicとfuture specへ限定して適用。その他PBT規則はPartial modeのためadvisory。 |
