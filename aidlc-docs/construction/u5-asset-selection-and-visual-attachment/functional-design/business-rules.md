# Business Rules: U5 Asset Selection and Visual Attachment

## Selection and Copy

- **BR-1**: 選択可能形式はPNG、JPEGに限定する。
- **BR-2**: dialog Cancelはファイルとdraftを変更しない。
- **BR-3**: コピー先は`public/visuals/{videoId}/`配下に限定する。
- **BR-4**: public pathは`/visuals/{videoId}/{fileName}`形式にする。
- **BR-5**: 同名ファイルを暗黙に上書きしない。
- **BR-6**: 同名ファイルの置換は明示確認を必須とする。
- **BR-7**: コピー失敗時はScene referenceを変更しない。

## Draft Integration

- **BR-8**: 画像添付は編集可能で有効なdraftにだけ許可する。
- **BR-9**: 画像添付はcanonical scriptを直接保存しない。
- **BR-10**: 新規image visualの初期値は`center`と`contain`にする。
- **BR-11**: positionとfitの変更はU3のdraft/raw JSON同期を通す。
- **BR-12**: draft Discard時にコピー済み画像を自動削除しない。

## Missing Assets

- **BR-13**: missing imageはScene IDとpublic pathを表示する。
- **BR-14**: missing Sceneは一覧と詳細の両方でテキスト表示し、色だけに依存しない。
- **BR-15**: missing imageにはReplace操作を提供する。
- **BR-16**: Replace成功後は同じpath検査を再実行する。

## Removal

- **BR-17**: RemoveはSceneのimage referenceを外す。
- **BR-18**: コピー済みファイルの削除は、同じscript内で未参照の場合だけ候補にできる。
- **BR-19**: 未参照ファイルでも削除前に明示確認を必須とする。
- **BR-20**: 削除確認を拒否した場合、referenceは外すがファイルは保持する。
- **BR-21**: background、BGM、他Sceneから参照されるファイルは削除しない。

## Path Safety

- **BR-22**: video IDはU1の既存validation済み値を使用する。
- **BR-23**: source file nameからdirectory部分を除去する。
- **BR-24**: `..`、absolute path、destination外へのpath traversalを拒否する。
- **BR-25**: file dialogが返した通常ファイルだけをcopy sourceとして受け付ける。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。
