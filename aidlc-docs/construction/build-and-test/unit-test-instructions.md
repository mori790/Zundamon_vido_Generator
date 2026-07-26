# Unit Test Execution

## Default Suite

```bash
npm test
```

## Expected Result

- 28 test files、112 tests、0 failures。
- CLI core、draft review、assets、Codex proposal、Command Runner、Preview、Render output、React panelsを検証する。
- Live VOICEVOX testはdefault suiteから除外される。

## Focused Checks

```bash
npx vitest run tests/studio/script-draft.test.ts
npx vitest run tests/studio/command-runner.test.ts
npx vitest run tests/studio/PreviewPanel.test.tsx
npx vitest run tests/studio/ProductionCommandPanel.test.tsx
```

失敗時は最初のfailureを修正し、`npx tsc --noEmit` と `npm test` を再実行する。
