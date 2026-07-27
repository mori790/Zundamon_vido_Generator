# U11 Code Generation Summary

## Scope

U11では、内部利用開始に必要なREADME、受入preflight、受入docs、Post-MVP計画docsを実装した。runtime UI、永続化、cloud service、auto update、YouTube連携、完全自動Codexは追加していない。

## 変更ファイル

- `README.md`: 身内のMac利用者向けDesktop-first guideへ再構成した。`local-acceptance`境界、ZIP/SHA-256確認、初回起動、clean-profile smoke、rollback、Post-MVPリンクを追加した。
- `package.json`: `typecheck` と `acceptance:preflight` scriptを追加した。
- `src/studio/shared/release.ts`: acceptance manifest正規化、local-acceptance summary生成、証跡pathサニタイズhelperを追加した。

## 作成ファイル

- `scripts/acceptance-preflight.ts`: fail-closedな内部受入preflight commandを追加した。
- `tests/studio/acceptance-preflight.test.ts`: artifact欠落、checksum mismatch、wrong architecture、wrong release state、下流gate失敗、全gate成功、pure helperのPBTを追加した。
- `docs/internal-acceptance/clean-profile-smoke-checklist.md`: 必須clean-profile smoke、開発者支援の任意確認、rollback evidence、Not Run維持を定義した。
- `docs/internal-acceptance/acceptance-evidence-template.md`: 内部受入証跡の記録形式を定義した。
- `docs/post-mvp/backlog.md`: Post-MVP候補、価値、依存、risk、規模、roadmap区分を記録した。
- `docs/post-mvp/roadmap.md`: Next、Later、Futureの順序と移動条件を定義した。
- `docs/post-mvp/series-management-spec.md`: シリーズ管理の仕様とPBT範囲を定義した。
- `docs/post-mvp/template-library-spec.md`: テンプレートライブラリの仕様とPBT範囲を定義した。
- `docs/post-mvp/multiple-workspaces-spec.md`: 複数Workspace管理の仕様とPBT範囲を定義した。

## Story対応

- US-1: READMEのDesktop-first再構成で対応した。
- US-2: preflightのZIP/SHA-256確認とREADME手順で対応した。
- US-3: clean-profile smoke checklistとREADMEリンクで対応した。
- US-4: evidence templateとサニタイズ済みreport helperで対応した。
- US-5: `npm run acceptance:preflight` とfocused testsで対応した。
- US-6からUS-11: Post-MVP backlog、roadmap、top-three仕様で対応した。

## 検証結果

- 成功: `npm run typecheck`
- 成功: `npx vitest run tests/studio/acceptance-preflight.test.ts`
- 成功: `npm test`
- fail-closed確認済み: `npm run acceptance:preflight` は `out/release-manifest.json` がないため非0で終了し、missing manifestを表示した。production audit、typecheck、default tests、Studio buildは `NOT RUN` として保持された。

## Deferred項目

- 実際のlocal-acceptance ZIP、SBOM、manifestは未作成のため、`npm run acceptance:preflight` の成功pathはfocused testsで検証した。
- Post-MVP featureのruntime実装は設計どおりdeferred。
- Operationsは現行workflow定義どおりplaceholder。

## Extension準拠

| Extension | 結果 | 根拠 |
|---|---|---|
| Security Baseline | Compliant | preflightでmanifest、ZIP SHA-256、SBOM存在、architecture、release state、production audit gate、secret-safe report formattingを確認する。READMEでは一般配布禁止を明記し、Gatekeeper無効化手順を通常手順にしていない。 |
| Resiliency Baseline | Compliant | preflightはfail-closed、skipしたgateはNot Run維持、Workspace非変更、rollback evidence、non-destructive rerunを文書化した。 |
| Property-Based Testing (Partial) | Compliant | 新規pure helperをfast-check PBTと主要failure pathのexample testsで検証した。seed replayはfast-check failure outputと既存PBT scriptsで維持される。 |
