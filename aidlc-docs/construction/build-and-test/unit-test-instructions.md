# Unit Test Execution Instructions

## Default Unit Test Suite

```bash
npm test
```

Expected result for the current U11 state:

- 38 test files pass.
- 143 tests pass.
- 0 failures.

The default suite excludes the live VOICEVOX integration test.

## Focused U11 Tests

```bash
npx vitest run tests/studio/acceptance-preflight.test.ts
```

Expected result:

- 1 test file passes.
- 8 tests pass.
- artifact missing, checksum mismatch, wrong architecture, wrong release state, downstream gate failure, all-gates-pass, and helper properties are covered.

## Property-Based Tests

```bash
npm run test:pbt
```

For higher release confidence:

```bash
npm run test:pbt:release
```

Seed replay uses the seed reported by fast-check:

```bash
PBT_SEED='<reported seed>' PBT_RUNS=1000 npm run test:pbt
```

## Failure Handling

1. Fix the first failing assertion or smallest shrunk counterexample.
2. Run the focused test for the changed area.
3. Run `npm run typecheck`.
4. Run `npm test`.
5. For release-sensitive helper changes, run `npm run test:pbt:release`.

Do not mark flaky or property failures as accepted without a concrete reason and recorded risk.

