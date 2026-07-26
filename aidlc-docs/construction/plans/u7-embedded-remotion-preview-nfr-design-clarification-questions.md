# U7 NFR Design Clarification Questions

## Detected Contradiction

NFR Design Question 4で「Workspace全体のError Boundaryで画面を再読み込みする」が選択されています。一方、承認済みFunctional DesignとNFR Requirementsでは次を必須としています。

- Preview failureをWorkspace全体から隔離する。
- Preview Panel内に失敗理由を表示する。
- Retryと「Remotion Studioで開く」fallbackを提供する。

Workspace全体の再読み込みだけでは、Preview以外のdraft、chat、command UIも失われる可能性があり、承認済みfallback flowを満たしません。

## Clarification Question 1
Player rendering errorの最終的な回復方式はどれにしますか？

A) Preview専用Error Boundaryで隔離し、Preview Panel内にRetryとRemotion Studio fallbackを表示する

B) Workspace全体のError Boundaryを使うが、再読み込み前にdraft/chat stateを保持し、同じ画面内にRemotion Studio fallbackも表示する

C) Workspace全体を再読み込みし、Preview Panel内fallback要件を取り下げる

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Content Validation

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown質問形式、空行、`[Answer]:` tagを検証済み。

