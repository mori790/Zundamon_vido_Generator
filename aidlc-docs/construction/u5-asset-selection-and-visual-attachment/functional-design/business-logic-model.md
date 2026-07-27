# Business Logic Model: U5 Asset Selection and Visual Attachment

## Scope

U5は、U3の編集可能な`ScriptDraft`内のSceneへローカル画像を添付し、画像参照の欠損状態を表示する。画像選択とコピーはElectron境界で行い、台本更新はU3の既存draft更新処理を再利用する。

Asset library、画像加工、cloud upload、preview、renderは対象外とする。

## Image Attachment Flow

1. 編集可能なdraftと選択中Sceneが存在する場合だけSelect Imageを有効にする。
2. Electron file dialogをPNG、JPEGに限定して開く。
3. Cancel時はファイルとdraftを変更しない。
4. 選択ファイルの拡張子と通常ファイルであることを検証する。
5. コピー先を`public/visuals/{videoId}/{fileName}`とする。
6. 同名ファイルが存在する場合は置換確認を表示する。
7. 置換を拒否した場合はファイルとdraftを変更しない。
8. 新規または置換承認済み画像をコピーする。
9. public pathを`/visuals/{videoId}/{fileName}`として生成する。
10. 選択中Sceneの`visual`をimage visualへ更新する。
11. 新規添付時は`position: "center"`、`fit: "contain"`を設定する。
12. U3のdraft JSONとstructured viewを同期する。

## Visual Editing Flow

- image visualの`position`は`left`、`center`、`right`から変更できる。
- image visualの`fit`は`contain`、`cover`から変更できる。
- Replaceは同じattachment flowを再実行する。
- RemoveはSceneのJSON参照を先に外す。
- 対象ファイルが他Sceneまたはvideo/backgroundから参照されていない場合だけ、ファイル削除確認を表示する。
- 削除を拒否してもJSON参照の解除は維持し、ファイルだけ残す。

## Missing Asset Flow

1. workspaceまたはdraftの有効なscriptが変化したとき、image visualのpublic pathを検査する。
2. 存在しない画像をScene IDとpathへ関連付ける。
3. Scene一覧の該当行へmissing状態を表示する。
4. Scene詳細へmissing pathとReplace操作を表示する。
5. Replace後に再検査し、存在すればmissing状態を解除する。
6. U6の全体Validationが追加された後も、U5のScene単位表示は同じ結果モデルを利用する。

## Draft and File Boundaries

- 画像ファイルは選択確定時にコピーする。
- draftをDiscardしてもコピー済み画像は自動削除しない。
- canonical `input/{videoId}.json`はU3 Applyまで変更しない。
- Sceneのimage referenceはdraft内だけで更新する。
- ファイル削除は明示確認後だけ行う。

## Story Traceability

- **US-10**: local image選択、public配下へのコピー、public path生成、Scene添付を定義する。
- **US-11**: missing Scene表示、path表示、Replace後の再検査を定義する。
- **US-9 Support**: image visualのposition、fit、Removeをstructured editorへ追加する。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。
