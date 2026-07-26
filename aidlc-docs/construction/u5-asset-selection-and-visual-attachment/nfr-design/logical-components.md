# Logical Components: U5 Asset Selection and Visual Attachment

## Asset Rules

- **配置候補**: `src/studio/shared/asset.ts`
- **責務**:
  - 20 MB上限と許可拡張子を定義する。
  - public pathとdestination候補を生成する。
  - image visual referenceの使用状況を判定する。
  - Asset operation result型を定義する。
- **特性**: React、dialog、filesystemへ依存しない。

## Asset File Access Adapter

- **配置候補**: `src/studio/renderer/asset-file-access.ts`
- **責務**:
  - PNG/JPEG file dialogを開く。
  - sourceのrealpath、stat、readを行う。
  - destination directoryを作成する。
  - collision、copy、existsを処理する。
  - 未参照fileをTrashへ移動する。
- **制約**:
  - 任意destinationを外部から受け取らない。
  - file system errorをUI向けresultへ正規化する。
  - 注入可能なinterfaceを公開する。

## Image Decoder

- **配置候補**: `src/studio/renderer/asset-file-access.ts`
- **責務**:
  - source bytesを`Blob`へ変換する。
  - `createImageBitmap`で完全decodeする。
  - dimensionを検証し、bitmapを解放する。
- **制約**: decodeのみを担い、copyやdraft更新を行わない。

## Asset Operation Coordinator

- **配置候補**: `ScriptReviewPanel`近傍のhookまたは最小helper。
- **責務**:
  - workspace global lockを所有する。
  - validate-copy-commit sequenceを調整する。
  - collision confirmationとmanual Retry stateを所有する。
  - copy成功後に既存`patchScene`を呼ぶ。
- **制約**:
  - draft stateそのものを二重所有しない。
  - path validationをcomponent内へ実装しない。

## Missing Asset Checker

- **配置候補**: `src/studio/shared/asset.ts`とAsset File Access Adapterの組み合わせ。
- **責務**:
  - scriptからimage referenceをScene ID付きで収集する。
  - `Promise.all`でexists検査する。
  - available、missing、failed結果を返す。
  - generation IDでstale result commitを防ぐ。

## Image Visual Editor

- **配置候補**: `src/studio/renderer/ScriptReviewPanel.tsx`
- **責務**:
  - Select、Replace、Remove、position、fitを表示する。
  - missing pathとoperation errorを表示する。
  - global lock中の操作を無効にする。
  - stable `data-testid`とaccessible nameを提供する。
- **制約**: filesystemへ直接アクセスしない。

## Asset Confirmations

- **配置候補**: `src/studio/renderer/ScriptReviewPanel.tsx`
- **種類**:
  - Filename Collision Confirmation。
  - Unreferenced File Removal Confirmation。
- **責務**:
  - CancelまたはKeep Fileを安全な既定操作にする。
  - confirmation対象のScene IDとpathを保持する。
  - operation中の二重submitを防ぐ。

## Composition Root

- **配置候補**: `src/studio/renderer/StudioApp.tsx`
- **責務**:
  - production Asset File Access Adapterを生成する。
  - WorkspaceShellからScriptReviewPanelへ渡す。
  - E2E時にtest adapterを同じprop境界へ注入する。
- **制約**: asset business logicを実装しない。

## Electron E2E Harness

- **配置候補**: `tests/studio/`配下のU5 E2E entry。
- **責務**:
  - Electron appを実際に起動する。
  - test adapterへ固定PNG/JPEGを供給する。
  - workspace open、draft作成、Select、Scene reference反映を確認する。
  - child processとtemporary filesを終了時にcleanupする。
- **制約**:
  - production componentへtest mode分岐を追加しない。
  - OS dialog自体のautomationは対象外とする。

## Dependency Direction

- `StudioApp`はadapterを生成して`ScriptReviewPanel`へ渡す。
- `ScriptReviewPanel`はAsset Operation CoordinatorとImage Visual Editorを接続する。
- CoordinatorはAsset Rules、Asset File Access Adapter、U3 `patchScene`を使用する。
- Missing Asset CheckerはAsset Rulesとadapterのexistsだけを使用する。
- Asset File Access AdapterはU3 draftやReact stateを知らない。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。
