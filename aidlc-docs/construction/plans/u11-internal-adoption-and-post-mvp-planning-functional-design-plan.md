# U11 Functional Design Plan

## Unit

- **Unit ID**: U11
- **Unit Name**: Internal Adoption and Post-MVP Planning
- **Scope**: Desktop-first README, internal acceptance preflight, clean-profile checklist, evidence template, Post-MVP backlog, roadmap, and top-three future feature specs.
- **Implementation Boundary**: U11 implements internal adoption support and planning docs only. Series management, template library, and multiple Workspace management remain specification-only.

## Planning Checklist

- [x] Load approved U11 requirements, stories, execution plan, and application design.
- [x] Define unit boundaries and functional design scope.
- [x] Identify functional design decisions requiring confirmation.
- [x] Collect all answers from this plan.
- [x] Analyze answers for ambiguity, contradictions, and missing functional details.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Generate `frontend-components.md` because README/docs and future UI specs affect user-facing surfaces.
- [x] Validate design completeness, Markdown syntax, and extension compliance.

## Proposed Functional Model

U11 has four functional areas:

- **Internal adoption content flow**: README routes non-developer users through distribution, First Run, Workspace, dependency readiness, and minimum smoke.
- **Acceptance evidence flow**: checklist and template capture Not Run, Pass, Fail, Blocked, evidence path, recovery, and retest state safely.
- **Acceptance preflight flow**: one command verifies release artifact evidence and local build/test gates without changing Workspace data.
- **Post-MVP planning flow**: backlog and top-three specs document future behavior and constraints without implementing runtime changes.

## Confirmation Questions

すべての`[Answer]:`へ選択肢の文字を記入してください。該当しない場合は最後の「Other」を選び、同じ行へ説明を追記してください。

### Question 1
preflightの成功条件はどこまで厳密にしますか？

A) すべて必須。artifact、checksum、architecture、release state、production audit、typecheck、default tests、Studio buildのどれかが失敗したら非0にする（推奨）

B) artifact系は必須、build/test gateは警告扱いにする

C) build/test gateだけ必須、artifact系は手動確認にする

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 2
preflightでrelease artifactが存在しない場合の扱いはどれにしますか？

A) 非0で終了し、先にlocal-acceptance artifactを生成するactionと想定証跡pathを日本語で示す（推奨）

B) artifact生成commandを自動実行してから検証する

C) artifact検証をskipしてbuild/test gateだけ実行する

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 3
clean-profile smoke checklistのVOICEVOXなし経路はどう記載しますか？

A) 最小smokeはVOICEVOXありを標準にし、VOICEVOXなしの場合は開発者支援の既存音声またはskip-voice相当手順として明確に分離する（推奨）

B) VOICEVOXなしでも利用者単独で完結できるよう通常手順に含める

C) VOICEVOXなしの場合はsmokeをBlockedにしてRender確認しない

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 4
acceptance evidence templateで許容する証跡pathの粒度はどれにしますか？

A) 相対pathまたは短い説明を優先し、必要な場合だけ利用者が伏せ字化した絶対pathを記録する（推奨）

B) 調査効率を優先し、絶対pathをそのまま記録する

C) pathは記録せず、Pass/Failだけにする

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### Question 5
Post-MVP top-three仕様のPBT記載はどの粒度にしますか？

A) 実装時に検証すべきproperty名、対象entity、generator制約、seed replay方針まで記載する（推奨）

B) PBT対象であることだけを記載する

C) U11ではPBT記載を省き、実装時に再検討する

X) Other（`[Answer]: X - ...`の形式で記入）

[Answer]: a

## Validation Notes

- No Mermaid or ASCII diagrams are included in this plan.
- Functional artifacts will include Security, Resiliency, and Partial PBT compliance summaries.
- Construction completion will use the required two-option message: Request Changes or Continue to Next Stage.
