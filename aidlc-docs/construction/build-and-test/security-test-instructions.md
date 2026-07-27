# Security Test Instructions

## Automated Checks

```bash
npm audit --audit-level=high
npx tsc --noEmit
npm test
```

Expected:

- Dependency vulnerabilities: 0。
- Rendererに `window.require`、Node builtin、raw Electron accessがない。
- BrowserWindowは `contextIsolation: true`、`nodeIntegration: false`。
- Unknown、timeout、disconnect、shutdown時のApp Server approvalはdeny。
- Workspace外path、oversized prompt/JSONL/image、request capacity超過は拒否。

## Manual Boundary Review

1. Preloadがpurpose-specific APIsのみ公開することを確認する。
2. Rendererへcredential、child process handle、generic JSON-RPC、raw filesystem pathを公開していないことを確認する。
3. Diagnostic outputでtoken様文字列がredactされることを確認する。
4. `npm audit fix --force` を使用していないことを確認する。
