# NFR Design Patterns: U5 Asset Selection and Visual Attachment

## Validate-Copy-Commit Pattern

画像添付は次の順序で処理する。

1. workspace global asset lockを取得する。
2. file dialog結果を取得する。
3. Cancelならlockを解放して終了する。
4. sourceを`realpath`化し、通常file、拡張子、20 MB上限を検証する。
5. source bytesをBrowser標準`createImageBitmap`で非同期decodeする。
6. destinationをbase directoryとfile nameから生成し、containmentを検証する。
7. collisionを検査し、必要なら置換確認を待つ。
8. copyを完了する。
9. copy成功後だけU3 draftのScene referenceを更新する。
10. missing asset statusを再検査する。
11. lockを解放する。

途中で失敗した場合はdraft referenceを変更せず、lockを解放して操作エラーを表示する。

## Manual Retry Pattern

- decode、copy、exists、Trash failureを自動retryしない。
- user input、file system permission、disk stateが変わらない自動retryは行わない。
- 失敗した操作内容と既存Scene visualを維持する。
- Retryは同じ操作を最初のvalidationから再実行する。
- 二重操作を防ぐため、global lock中は新しいasset operationを拒否する。

## Workspace Global Asset Lock

- single video workspaceにつき同時asset operationは1件だけとする。
- Select、Replace、Remove、Trash、Retryがlock対象になる。
- missing read-only検査はlock対象外とする。
- global lockにより同名destinationのcheck-copy間raceを防ぐ。
- lock状態は`aria-busy`と処理中テキストで表示する。

## Asynchronous Decode Pattern

- source bytesを`Blob`へ変換し、`createImageBitmap`でdecodeする。
- decode結果のwidthとheightが正数であることを確認する。
- validation後に`ImageBitmap.close()`でresourceを解放する。
- decode errorはinvalid imageとして扱い、copyを開始しない。
- 20 MB size checkをdecode前に行う。
- Web Workerは2秒目標を実測で満たせない場合だけ検討する。

## Parallel Missing Asset Check

- 有効script内のimage referenceを収集する。
- 最大100 Sceneを`Promise.all`で並列exists検査する。
- Scene IDとpublic pathを結果へ維持する。
- 個別検査失敗はそのSceneのfailed statusへ変換し、他結果を破棄しない。
- script変更ごとにcheck generation IDを更新する。
- 古いgenerationの結果はReact stateへcommitしない。

## Path Containment Pattern

- destination baseを`path.resolve(workspaceRoot, "public", "visuals", videoId)`で生成する。
- source file nameには`path.basename`だけを使用する。
- candidateを`path.resolve(base, fileName)`で生成する。
- candidateが`base + path.sep`から始まることを確認する。
- sourceは`realpath`、`stat().isFile()`、extensionを検証する。
- rendererから任意destination pathを受け取らない。

## Recoverable Removal Pattern

1. Scene referenceをdraftから解除する。
2. current script内のbackground、BGM、全Scene referenceを再計算する。
3. fileがまだ参照中なら保持して終了する。
4. 未参照ならKeep FileとMove to Trashを表示する。
5. Move to Trash選択時だけElectron Trash operationを実行する。
6. Trash failure時はreference解除を維持し、fileが残ったことを表示する。

## Composition-Root Test Injection

- production Asset File Access adapterを`StudioApp` composition rootで生成する。
- `StudioApp`または`WorkspaceShell`から`ScriptReviewPanel`へadapterを渡す。
- E2Eは同じcomposition rootへ決定的なtest adapterを注入する。
- componentやAsset Manager内に環境変数分岐を置かない。
- OS dialog以外のproduction flowはE2Eでも同じものを通る。

## Accessibility Pattern

- confirmation表示時に見出しまたは最初の安全操作へfocusを移す。
- collision confirmationの既定安全操作はCancelにする。
- removal confirmationの既定安全操作はKeep Fileにする。
- missing、copying、failed、availableをtextとARIA stateで示す。

## NFR Traceability

- **Performance**: async decode、100 Scene parallel check、stale result guard。
- **Reliability**: validate-copy-commit、manual retry、global lock。
- **Safety**: realpath/containment、collision confirmation、Trash。
- **Testability**: composition-root adapter injection。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。
