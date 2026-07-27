# U10 NFR Design Patterns

## Resilience

### Failure Containment

- CodexとVOICEVOXの診断、timeout、error stateをdependencyごとに分離する。
- 自動retryは行わず、対象機能の利用直前または手動再診断で再試行する。
- Dependency failureは対象機能だけを停止し、Workspaceと他の制作機能を維持する。

### Atomic Persistence

- Workspace参照とrelease manifestはtemporary fileへ書き、flush後にrenameする。
- Parseまたはschema validation失敗時は保存値を使用せず、再選択または再生成へ進む。
- Workspace directory作成が途中失敗した場合、新規作成分だけを逆順でcleanupする。

### Fail-Closed Release

- Release状態は必要証跡を入力とする純粋関数でのみ昇格する。
- 外部command failure、timeout、未知output、証跡欠落は失敗として扱う。
- Local acceptanceとpublishableのoutput directoryとartifact labelを分離する。
- Rollbackは既知正常versionのapp置換だけで行い、Workspaceを変更しない。

## Scalability

### Lazy Workspace Validation

- 起動時はrootと必須4 directoryだけを検証する。
- 個別fileは操作直前にcanonical pathと許可rootを検証する。
- 全tree scan、index database、background crawlerを追加しない。
- 1,000 fileはperformance測定条件であり、利用上限にはしない。

### Bounded Artifacts

- ZIP 200 MiB超をwarning、300 MiB超をblockingにする。
- Test、cache、Workspace、不要source mapをallowlistから除外する。
- In-memory診断状態はCodexとVOICEVOXの最新snapshotだけを保持する。

## Performance

### Non-Blocking Startup

- First Run UIを先に表示する。
- WorkspaceがReadyになった後、CodexとVOICEVOX診断を並列開始する。
- 診断完了を制作画面の初期render条件にしない。
- Codex 5秒、VOICEVOX 3秒の独立timeoutを適用する。

### Build Reuse

- Existing Viteとesbuildをpackage前に一度実行し、生成済みJavaScriptだけをForgeへ渡す。
- RuntimeでTypeScript変換、dev server起動、source bundlingを行わない。

## Security

### Trust Boundary Guards

- Renderer requestをZodで検証し、Mainでdomain typeへ変換する。
- `realpath`後のpathがWorkspaceまたはresource allowlist内か確認する。
- 任意absolute path、任意channel、任意executableをRendererから受け取らない。
- Symlinkによるroot逸脱も同じguardで拒否する。

### Credential Provider

- 第一選択はmacOS Keychainのnotarytool profile。
- 代替として環境変数を読み取るが、値はconfig object生成後もlogしない。
- Credentialの存在確認結果だけをrelease orchestrationへ返す。
- Credentialがなければlocal acceptanceで停止する。

### Two-Layer Release Verification

- 純粋moduleがmanifest、inclusion policy、release stateを判定する。
- Command adapterが`codesign`、`xcrun notarytool`、`xcrun stapler`、`spctl`を固定argvで実行する。
- Adapter outputはbounded parserで証跡へ変換し、未知形式ではfail closedにする。

## Test Patterns

- Path generatorは通常segment、Unicode、dot segment、symlink case、境界外absolute pathを生成する。
- Release model testは許可された順序だけをreference modelとして実装と比較する。
- Inclusion policyは単純allowlist oracleと比較する。
- 通常100 run、release 1,000 runとし、seedと縮小後の反例を保存する。

## Traceability

| NFR | Design Pattern |
|---|---|
| NFR-P1 | Non-Blocking Startup、Build Reuse |
| NFR-P2 | Lazy Workspace Validation |
| NFR-P3 | Failure Containment、Non-Blocking Startup |
| NFR-P4 | Bounded Artifacts |
| NFR-P5 | Release performance measurement |
| Security | Trust Boundary Guards、Credential Provider、Two-Layer Verification |
| Reliability | Failure Containment、Atomic Persistence、Fail-Closed Release |
| Testability | Model／oracle PBT、seed replay |
