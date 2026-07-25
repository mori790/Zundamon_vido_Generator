# Unit Test Execution

## Run Unit Tests

### 1. Execute All Default Unit Tests

```bash
npm test
```

Default tests exclude the live VOICEVOX integration test.

### 2. Review Test Results

- **Expected**: 7 test files pass, 13 tests pass, 0 failures.
- **Coverage Areas**:
  - JSON validation
  - Subtitle splitting
  - Seconds-to-frames conversion
  - Timeline calculation
  - Cache hash generation
  - Path and asset checks
  - Character asset selection
- **Test Report Location**: Console output.

### 3. Fix Failing Tests

1. Review the failing test output.
2. Identify the source module under `src/`.
3. Fix the implementation or test expectation.
4. Run `npx tsc --noEmit`.
5. Rerun `npm test`.

## Last Observed Result

`npm test` passed with 7 files and 13 tests.

