# NFR Requirements: U5 Asset Selection and Visual Attachment

## Performance and Capacity

- 1画像あたりの入力上限を20 MBとする。
- 20 MB以下の画像は、通常のlocal storageで選択確定からScene反映まで2秒以内を目標とする。
- copyとdecodeは非同期で実行し、rendererの描画と他のdraft閲覧を停止させない。
- copy中は対象SceneのSelect、Replace、Removeを無効にし、処理中状態を表示する。
- MVPはsingle video workspaceとU3の100 Scene目標を前提にする。

## File Safety and Recoverability

- 同名destinationを確認なしに上書きしない。
- copy成功前にdraft referenceを変更しない。
- copyまたはdecode失敗時は既存Scene visualを保持する。
- 未参照画像の削除はmacOS Trashへ移動し、復元可能にする。
- Trash移動失敗時はreference解除を維持し、fileが残っていることを表示する。
- draft Discard時に選択済み画像を自動削除しない。

## Input Validation

- file dialog filterをPNG、JPEGに限定する。
- `.png`、`.jpg`、`.jpeg`以外を拒否する。
- sizeが20 MBを超えるファイルをcopy前に拒否する。
- image decoderで完全に読み込めないファイルをcopy前に拒否する。
- sourceが通常ファイルであることを検証する。
- destinationが`public/visuals/{videoId}/`内に収まることを検証する。

## Availability and Error Handling

- dialog Cancelは正常終了として扱い、errorを表示しない。
- select、decode、copy、replace、exists、Trashの失敗を操作単位で表示する。
- 失敗後もdraft編集と再試行を可能にする。
- Asset Manager failureはCodex、U6、preview以外のStudio機能を停止させない。
- missing asset checkの一部が失敗しても、検査可能なScene結果は表示する。

## Usability and Accessibility

- missing状態をScene一覧と詳細の両方にテキスト表示する。
- Select、Replace、Remove、Keep File、Move to Trashはキーボード操作できる。
- confirmationは初期focusと明確なCancel操作を持つ。
- 色だけでavailable、missing、copying、failedを区別しない。
- interactive elementは安定した`data-testid`とaccessible nameを持つ。

## Maintainability

- U1/U3のrenderer `nodeIntegration` file access方式をU5でも継続する。
- U5で新しいIPC migrationを開始しない。
- file operationsは注入可能なAsset File Access adapterへ集約する。
- path、validation、reference判定をReact componentから分離する。
- 既存`VideoScript`、`visualSchema`、U3 draft update、`checkAssets`の契約を再利用する。
- 新規runtime dependencyを追加しない。

## Testability

- path生成、20 MB境界、形式検証、参照判定を単体テストする。
- injected adapterでCancel、copy failure、collision、Replace、Trash failureを検証する。
- 一時directoryでcopy、collision、missing、destination containmentを検証する。
- React component testでScene row、missing notice、position、fit、confirmationを検証する。
- Electronを実際に起動するE2E smoke testを必須とする。
- E2Eではworkspace open、draft作成、test image添付、Scene反映を確認し、OS file dialog入力はtest adapterで決定的にする。

## Story Traceability

- **US-10**: size、decode、copy latency、collision、Scene反映、E2Eを定義する。
- **US-11**: missing表示、再検査、failure isolationを定義する。
- **US-9 Support**: accessibleなposition、fit、Remove操作を定義する。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。
