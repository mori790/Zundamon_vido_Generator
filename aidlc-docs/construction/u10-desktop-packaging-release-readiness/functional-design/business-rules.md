# U10 Business Rules

## Workspace

- **BR-W1**: Ready以外ではfilesystem mutation、production command、Codex thread persistenceを開始しない。
- **BR-W2**: 保存済みpathへ暗黙にfallbackせず、起動ごとに再検証する。
- **BR-W3**: 必須4 directoryは不足分だけ作り、既存内容を上書きしない。
- **BR-W4**: 相対path解決後のcanonical pathが許可root外なら拒否する。
- **BR-W5**: Rendererから渡されたabsolute pathを操作対象として受理しない。
- **BR-W6**: 保存するのはWorkspace参照とschema versionだけで、制作dataは保存しない。

## Dependency Diagnosis

- **BR-D1**: 起動時診断結果は表示用snapshotであり、利用直前に対象依存を再診断する。
- **BR-D2**: Codex未導入、version不足、未loginを別codeにする。
- **BR-D3**: VOICEVOX未導入、未起動、version不足、接続不能を別codeにする。
- **BR-D4**: token、credential、login detail、内部stackを診断結果と通常logへ含めない。
- **BR-D5**: 一方の依存失敗で無関係な機能をlockしない。

## Release

- **BR-R1**: 状態順序は`local-acceptance → signed → notarized → verified → publishable`に固定する。
- **BR-R2**: 各遷移は前状態と当該証跡の両方を必要とする。
- **BR-R3**: 認証情報なしは正常なlocal acceptance結果だが、公開成功ではない。
- **BR-R4**: 署名、公証、Gatekeeper、ticket、checksum、manifestのいずれかが失敗すればpublishableにしない。
- **BR-R5**: `get-task-allow`、secret、test fixture、不要source map、Workspace混入を検出したら失敗する。
- **BR-R6**: 同一versionの旧成果物を新しい検証証跡なしで再利用しない。
- **BR-R7**: Release manifestはversion、revision、architecture、artifact checksum、verification stateを含む。

## UI

- **BR-U1**: Workspace未設定または無効時はblocking setup viewを表示する。
- **BR-U2**: setup viewは選択、再試行、終了をkeyboard操作でき、状態をaccessible labelで通知する。
- **BR-U3**: 依存診断は制作開始を一律に妨げず、利用不能な機能と復旧actionだけを示す。
- **BR-U4**: 内部pathやstack traceを通常利用者へ表示しない。

## PBT不変条件

- Workspace path解決結果は常に許可root内である。
- Workspace設定のnormalizeは冪等で、serialize／parseはJSON正規化後に同値である。
- Release状態は前段階を飛ばさず、証跡不足でpublishableにならない。
- Manifest normalizeは冪等で、checksum formatとarchitectureは許可集合内である。
- Inclusion policyの結果は単純allowlist oracleと一致する。
