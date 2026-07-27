# Unit Test Execution Instructions

## Default Suite

```bash
npm test
```

期待値は37 files、135 tests、0 failuresである。CLI core、Workspace、First Run、dependency diagnosis、release policy、Command Runner、Preview、Render、Codex、React UIを検証する。VOICEVOX live testはdefault suiteから除外される。

## Property-Based Tests

通常は各propertyを100 run、release gateでは1,000 run実行する。

```bash
npm run test:pbt
npm run test:pbt:release
```

fast-checkは失敗時にseed、path、shrunk counterexampleを表示する。報告されたseedを使って再現する。

```bash
PBT_SEED='<reported seed>' PBT_RUNS=1000 npm run test:pbt
```

PBTはWorkspace round-trip／idempotence、release state invariant、manifest normalization、artifact allowlistを対象とする。具体的なbusiness regressionはexample testで併用する。

## Failure Handling

最初のfailureとshrunk counterexampleを修正し、focused test、`npx tsc --noEmit`、default suite、release PBTの順に再実行する。失敗をretryだけで抑制しない。
