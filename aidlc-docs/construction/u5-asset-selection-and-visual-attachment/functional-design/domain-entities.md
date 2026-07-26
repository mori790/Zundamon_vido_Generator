# Domain Entities: U5 Asset Selection and Visual Attachment

## SelectedImage

- `sourcePath: string`
- `fileName: string`
- `extension: ".png" | ".jpg" | ".jpeg"`

Electron file dialogで選択され、copy validationを通過したlocal imageを表す。

## PublicAssetRef

- `videoId: string`
- `fileName: string`
- `publicPath: string`
- `destinationPath: string`

`publicPath`はscript JSON用、`destinationPath`はElectron file operation用とし、rendererへ不要なsource pathを永続化しない。

## ImageAttachment

- `sceneId: string`
- `asset: PublicAssetRef`
- `position: "left" | "center" | "right"`
- `fit: "contain" | "cover"`

U3 Sceneの既存image visualへ変換される一時的なattachment結果。

## AssetStatus

- `status: "available" | "missing"`
- `sceneId: string`
- `publicPath: string`

Structured Scene EditorのScene行と詳細表示で使用する。

## AssetCopyResult

- 成功: `{status: "copied"; asset: PublicAssetRef}`
- Cancel: `{status: "cancelled"}`
- 置換確認待ち: `{status: "replacement-required"; selected: SelectedImage; existing: PublicAssetRef}`
- 失敗: `{status: "failed"; message: string}`

## AssetRemovalDecision

- referenceのみ解除: `{removeFile: false}`
- 未参照ファイルも削除: `{removeFile: true; publicPath: string}`

file削除は未参照確認とユーザー確認の両方を満たす場合だけ選択できる。

## Relationships

- 1つの`ImageAttachment`は1つのScene image visualへ対応する。
- 1つの`PublicAssetRef`は複数Sceneから参照される可能性がある。
- 1つのmissing `AssetStatus`はScene IDとpublic pathへ対応する。
- `ScriptDraft`がimage referenceを所有し、Asset Managerはdraft lifecycleを所有しない。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。
