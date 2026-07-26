# Frontend Components: U5 Asset Selection and Visual Attachment

## Component Hierarchy

- `StudioApp`
  - `ScriptReviewPanel`
    - `StructuredSceneEditor`
      - `SceneList`
      - `SceneDetail`
        - `ImageVisualEditor`
        - `MissingAssetNotice`
        - `AssetReplacementConfirmation`
        - `AssetRemovalConfirmation`

## ScriptReviewPanel

- U3のdraft state ownershipを維持する。
- Asset Managerから返されたimage visualを既存`patchScene` flowへ渡す。
- valid draftの変更後にasset statusを再評価する。
- canonical script保存は既存Applyだけに限定する。

## ImageVisualEditor

### Inputs

- `videoId`
- `scene`
- `editable`
- `assetStatus`
- `onAttach`
- `onReplace`
- `onRemove`
- `onChangePosition`
- `onChangeFit`

### Controls

- Select Image
- Replace
- Remove
- Position select
- Fit select

### Rules

- draftがない場合はSelect、Replace、Remove、position、fit編集を無効にする。
- image visualがない場合はSelect Imageを表示する。
- image visualがある場合はpath、position、fit、Replace、Removeを表示する。
- interactive elementへ安定した`data-testid`を付ける。

## MissingAssetNotice

- missing pathをテキストで表示する。
- Scene rowにも`Missing image`を表示する。
- Replace操作を近接して表示する。
- `role="alert"`を使い、色だけに依存しない。

## AssetReplacementConfirmation

- 同名destinationが存在する場合だけ表示する。
- Cancelはcopyとdraft更新を行わない。
- Replaceは既存destinationへcopy後、Scene referenceを更新する。
- confirmation中は二重操作を無効にする。

## AssetRemovalConfirmation

- reference解除後、対象fileが未参照の場合だけ表示する。
- Keep Fileを既定の安全操作とする。
- Delete Fileは明示選択時だけ実行する。
- 他の参照がある場合はconfirmationを表示せずfileを保持する。

## Electron Boundary

- rendererはSelect、Copy、Exists、Deleteの意図をAsset Manager境界へ渡す。
- Electron側がsource path、destination path、通常ファイル、拡張子、destination containmentを検証する。
- rendererは任意destination pathを指定しない。

## Error Display

- dialog Cancelはerror表示しない。
- validation、copy、delete失敗はScene詳細へ操作可能なmessageとして表示する。
- copy失敗では既存Scene visualを維持する。
- delete失敗ではreference解除を維持し、残ったfile pathを通知する。

## Testable Interactions

- PNG/JPEG選択からScene image visualを作成できる。
- dialog Cancelでdraftが変わらない。
- 同名destinationは確認なしに上書きされない。
- missing Sceneが一覧と詳細に表示される。
- Replace成功でmissing表示が消える。
- positionとfitの変更がraw JSONへ同期される。
- Remove時に参照中fileを削除しない。
- 未参照fileは確認後だけ削除される。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。
