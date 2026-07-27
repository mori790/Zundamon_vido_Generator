# U10 Service設計

## Workspace Orchestration

1. Main起動時にWorkspace Serviceが保存済み参照を読む。
2. canonical化、存在、directory、read／write、必要構造を検証する。
3. 有効なら既存local-file、command、preview、render serviceへrootを供給する。
4. 無効ならFirst-Run Rendererへtyped stateを返し、再選択までmutationを拒否する。

## Dependency Diagnosis

1. First Runまたは機能実行前にDependency Diagnosis Serviceを呼ぶ。
2. Codex adapterはexecutable、対応version、login状態を確認する。
3. VOICEVOX adapterはlocal endpointと対応versionを確認する。
4. 結果は日本語文言ではなく安定したaction codeでRendererへ返し、UIが日本語表示する。
5. 一方の失敗で他方や無関係な制作機能を停止しない。

## Packaged Command Orchestration

1. Rendererの目的別requestをPreloadがMainへ転送する。
2. MainはWorkspace Serviceから有効rootを取得する。
3. Packaged Resource Resolverが固定runtime entryを返す。
4. Packaged Command Adapterが既存Command Runner用invocationを構築する。
5. 既存progress、Stop、retry、overwrite、reveal flowを再利用する。

## Release Orchestration

1. Build scriptがtypecheck、tests、Studio build、Forge package／makeを実行する。
2. Release Moduleがinclusion policy、SBOM、checksum、manifestを生成・検証する。
3. 認証情報がなければ`local-acceptance`で終了し、公開用出力と分離する。
4. 認証情報があれば署名、公証、staple、Gatekeeper、ticketを検証する。
5. すべての証跡が揃った場合だけ`publishable`を返す。

## 失敗とcleanup

- Workspace無効時は既存folderやresource rootへ暗黙fallbackしない。
- 診断のtimeoutはdependency単位で閉じ、secretをlogへ出さない。
- Build／公証失敗は非ゼロ終了し、途中成果物をpublishable場所へ置かない。
- Child process、listener、temporary fileは既存cleanup pathへ統合する。
