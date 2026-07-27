# U11 Application Design Plan

## Planning Checklist

- [x] Load U11 requirements, user stories, execution plan, and reverse-engineering context.
- [x] Identify U11 component boundaries and implementation scope.
- [x] Identify design decisions that need user confirmation.
- [x] Collect all answers from this plan.
- [x] Analyze answers for ambiguity, contradictions, and missing design details.
- [x] Generate `components.md` with U11 component definitions and high-level responsibilities.
- [x] Generate `component-methods.md` with U11 method signatures and input/output types.
- [x] Generate `services.md` with U11 service definitions and orchestration patterns.
- [x] Generate `component-dependency.md` with dependency relationships and communication patterns.
- [x] Generate consolidated `application-design.md`.
- [x] Validate design completeness, Markdown syntax, and extension compliance.

## Design Scope

U11 is one cohesive package-level change:

- README is updated for non-developer internal users and Desktop-first adoption.
- Internal acceptance support is added through documentation, checklist, evidence template, and one preflight command.
- Post-MVP features are specified as planning artifacts only.
- Product implementation for series management, template library, and multiple Workspace management is explicitly out of U11 scope.

## Proposed Component Boundaries

- **Desktop-first README Component**: User-facing setup, First Run, dependency, smoke, troubleshooting, CLI/developer separation.
- **Internal Acceptance Documentation Component**: Clean-profile smoke checklist and evidence template.
- **Acceptance Preflight Component**: Non-destructive local command that validates artifacts, manifest, release state, and build/test gate status.
- **Release Evidence Adapter**: Reuses existing release manifest, SBOM, checksum, and release-state contracts.
- **Post-MVP Planning Component**: Backlog, roadmap, and top-three feature specifications.

## Confirmation Questions

すべての`[Answer]:`へ選択肢の文字を記入してください。該当しない場合は最後の「Other」を選び、同じ行へ説明を追記してください。

### Question 1
preflight commandの実装境界はどれにしますか？

A) 既存release artifact verifierのmanifest／release-state logicを再利用し、U11では薄いacceptance preflight wrapperだけを追加する（推奨）

B) U11専用の独立したpreflight validatorを作る

C) 新規codeは追加せず、READMEとchecklistに既存commandの実行順だけを記載する

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 2
身内向け受入checklistと証跡templateの配置はどれにしますか？

A) `docs/internal-acceptance/`へ配置し、READMEから明確にリンクする（推奨）

B) `docs/desktop-release/`へ既存release文書の一部として追加する

C) README内にすべて埋め込み、別ファイルを増やさない

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 3
Post-MVP backlogとNext上位3件の仕様書の配置はどれにしますか？

A) `docs/post-mvp/`へbacklog、roadmap、series、template、workspaces仕様を分けて配置する（推奨）

B) `aidlc-docs/inception/application-design/`だけへ配置し、通常docsには追加しない

C) READMEの将来構想sectionへ要約だけを追加する

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 4
preflightがbuild／test gateをどう扱うべきですか？

A) artifact検証に加え、production audit、typecheck、default tests、Studio buildを実行または確認し、失敗時は非0で終了する（推奨）

B) artifact、manifest、checksum、release stateだけを検証し、build／testは別commandに任せる

C) CIがないためbuild／test gateはREADME上の手順だけにする

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 5
将来機能仕様の詳細度はどこまでApplication Designへ含めますか？

A) U11要件のNext上位3件についてcomponent、method、service、dependency観点まで設計し、実装は後続Uで改めて扱う（推奨）

B) Next上位3件はproduct specだけに留め、component／method設計は実装時まで延期する

C) Next上位3件のうち最優先のシリーズ管理だけをApplication Designへ含める

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

## Validation Notes

- No Mermaid or ASCII diagrams are included in this plan.
- Markdown tables and code spans have been kept simple for parser compatibility.
- Security, Resiliency, and Partial PBT extension checks will be included in generated design artifacts.
