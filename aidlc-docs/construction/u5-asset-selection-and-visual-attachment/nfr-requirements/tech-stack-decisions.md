# Tech Stack Decisions: U5 Asset Selection and Visual Attachment

## File Selection and Access

- **採用**: 既存Electronとrenderer `nodeIntegration`方式。
- **理由**:
  - U1/U3の既存境界と一致する。
  - U5だけでIPC migrationを開始しない。
  - 新規dependencyが不要。
- **制約**:
  - file operationは専用adapterへ集約する。
  - destinationはrendererから任意指定せず、video IDとfile nameから生成する。

## Image Decode Validation

- **採用**: Electronの既存image decode能力を利用してPNG/JPEGを完全decodeする。
- **理由**:
  - 拡張子偽装や壊れた画像をcopy前に拒否できる。
  - image processing libraryを追加しない。
- **判定**:
  - decode結果がemptyまたはdimension不正なら拒否する。
  - 20 MB size checkをdecode前に行う。

## Copy and Collision Handling

- **採用**: Node標準`fs/promises`の`stat`、`mkdir`、`copyFile`をadapter内で使用する。
- **理由**:
  - 既存runtimeで完結する。
  - async file operationとしてUIをblockしない。
- **順序**:
  - validate source。
  - validate destination containment。
  - detect collision。
  - confirm replacement。
  - copy。
  - update draft。

## Recoverable Deletion

- **採用**: Electron `shell.trashItem`。
- **理由**:
  - macOS Trashへ移動でき、完全削除より復旧しやすい。
  - Electron標準機能で追加dependencyが不要。
- **制約**:
  - 未参照判定と明示確認後だけ呼び出す。
  - Trash failureを隠さない。

## Missing Asset Checks

- **採用**: U5 adapterのScene単位exists結果と既存`checkAssets`契約を整合させる。
- **理由**:
  - Structured Scene EditorはScene ID単位の即時表示が必要。
  - U6の全体validationでも同じpublic path conventionを再利用できる。

## State Management

- **採用**: U3 `ScriptDraft`と`updateDraftScene`を再利用する。
- **理由**:
  - image visual専用storeを増やさない。
  - structured viewとRaw JSONの同期を既存処理へ一本化できる。

## Testing Stack

- **採用**:
  - Vitest for pure logic、adapter、temporary-directory tests。
  - React Testing Library for component interactions。
  - 既存Electron binaryをchild processで起動するdeterministic E2E smoke。
- **E2E方針**:
  - OS dialogはtest adapterで固定画像を返す。
  - app readinessとScene image反映を確認する。
  - 新規browser automation dependencyは追加しない。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。
