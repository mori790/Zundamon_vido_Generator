# Unit Test Execution

## Default Suite

```bash
npm test
```

## Expected Result

- 33 test files、125 tests、0 failures。
- CLI core、draft review、assets、Codex proposal、Command Runner、Preview、Render output、React panelsを検証する。
- Live VOICEVOX testはdefault suiteから除外される。

## Focused Checks

```bash
npx vitest run tests/studio/script-draft.test.ts
npx vitest run tests/studio/command-runner.test.ts
npx vitest run tests/studio/PreviewPanel.test.tsx
npx vitest run tests/studio/ProductionCommandPanel.test.tsx
npx vitest run tests/studio/codex-app-server.test.ts tests/studio/codex-app-server.property.test.ts
npx vitest run tests/studio/codex-app-server-service.test.ts tests/studio/real-codex-connection.test.ts
npx vitest run tests/studio/CodexPanel.real.test.tsx
```

失敗時は最初のfailureを修正し、`npx tsc --noEmit` と `npm test` を再実行する。Property testはVitestが表示するfast-checkの `seed` と `path` で再現する。
