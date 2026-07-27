# U11 NFR Requirements Plan

## Unit

- **Unit ID**: U11
- **Unit Name**: Internal Adoption and Post-MVP Planning
- **Scope**: Desktop-first README, internal acceptance docs, strict acceptance preflight, Post-MVP planning docs, and focused tests.

## Planning Checklist

- [x] Load Functional Design artifacts and approved U11 context.
- [x] Identify applicable NFR categories for U11.
- [x] Identify NFR decisions requiring confirmation.
- [x] Collect all answers from this plan.
- [x] Analyze answers for ambiguity, contradictions, and missing NFR details.
- [x] Generate `nfr-requirements.md`.
- [x] Generate `tech-stack-decisions.md`.
- [x] Validate NFR completeness, Markdown syntax, and extension compliance.

## NFR Areas

- **Security**: Artifact integrity, local-acceptance wording, secret-safe evidence, dependency audit, no unsafe install guidance.
- **Resiliency**: Fail-closed preflight, rerunnable checks, local rollback, Not Run/Blocked/Fail semantics, direct/in-place internal deployment.
- **Performance**: Preflight should be bounded and understandable even when running full local checks.
- **Usability**: Japanese Desktop-first docs, copyable commands, clear required vs optional acceptance checks.
- **Maintainability**: Reuse release evidence logic, avoid duplicate release-state rules, keep future specs separate from U11 implementation.
- **Testability / PBT**: Use Vitest and fast-check for new pure logic where applicable; preserve seed replay and shrinking.

## Confirmation Questions

すべての`[Answer]:`へ選択肢の文字を記入してください。該当しない場合は最後の「Other」を選び、同じ行へ説明を追記してください。

### Question 1
preflightの実行時間目標をどう扱いますか？

A) Full gateは数分以内を目安にし、時間がかかるcheck名と進行状況を表示する。厳密な秒数SLAは設定しない（推奨）

B) 60秒以内を必須目標にし、超過したら失敗扱いにする

C) 実行時間は制限せず、すべて終わるまで無表示で待つ

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 2
production dependency auditの扱いはどれにしますか？

A) preflight必須gateとし、production dependency auditが失敗したら非0で終了する（推奨）

B) audit結果は警告として表示し、他gateが通れば成功にする

C) U11ではauditをpreflight対象外にする

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 3
preflight reportの証跡pathと秘匿情報対策はどれにしますか？

A) 相対pathと短い説明を優先し、token、credential、個人情報、不要な絶対pathを表示しない（推奨）

B) 調査効率を優先し、実行環境の絶対pathと詳細logをすべて表示する

C) 証跡pathを表示せず、成功/失敗だけ表示する

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 4
resiliency上のrollback evidenceはどこまでU11成果物へ含めますか？

A) README/checklist/evidence template/Post-MVP docsに、直前の既知正常ZIPまたは`.app`への置換とWorkspace維持を記録する（推奨）

B) rollbackは既存U10文書へ任せ、U11では触れない

C) rollbackはFuture扱いにしてU11 docsには含めない

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 5
PBTのNFR要求はどの扱いにしますか？

A) fast-checkを継続採用し、新しいpure parser/serializer/normalizerだけPartial PBT必須、seed replayとshrinking維持を要求する（推奨）

B) U11は文書中心なのでPBTは全て任意にする

C) U11の全テストをPBT中心にし、example testを最小化する

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

## Validation Notes

- No Mermaid or ASCII diagrams are included in this plan.
- Enabled extensions are Security Baseline, Resiliency Baseline, and Property-Based Testing in Partial mode.
- Completion will use the required two-option Construction-stage message.
