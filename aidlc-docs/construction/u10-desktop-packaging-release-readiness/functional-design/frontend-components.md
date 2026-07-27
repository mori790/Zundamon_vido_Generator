# U10 Frontend Components

## Component構成

### FirstRunGate

- **目的**: WorkspaceがReadyになるまで制作画面をblockingする。
- **Props**: `workspaceState`
- **State**: `idle | selecting | validating | error`
- **操作**: folder選択、再試行、終了
- **API**: `workspaceApi.get`、`workspaceApi.select`

### WorkspaceStatus

- **目的**: 現在のWorkspace名と再選択操作を表示する。
- **Props**: `workspaceState`
- **操作**: 再選択
- **制約**: 通常表示では完全な内部pathを露出しない。

### DependencyStatusPanel

- **目的**: CodexとVOICEVOXの状態と復旧actionを独立表示する。
- **Props**: `DependencyReport`
- **State**: `checking | ready | degraded | error`
- **操作**: 再診断、関連する日本語手順を開く
- **API**: `dependencyApi.checkAll`

## Interaction

1. 起動時に`FirstRunGate`が`workspaceApi.get`を呼ぶ。
2. Readyなら既存Studioを表示し、バックグラウンドで依存診断する。
3. Unconfigured／Invalidならblocking setup viewを表示する。
4. 利用者が選択するとnative dialogを開き、Mainの検証結果だけを受け取る。
5. Readyへ遷移後に既存Studioをmountする。
6. CodexまたはVoiceの操作直前は対象dependencyを再診断し、失敗時は対象操作だけを止める。

## Form Validation

- Folder pathをRendererのtext inputから受け取らない。
- 選択中の重複requestを抑止する。
- Mainから未知のstatus codeを受けた場合は安全な汎用errorとして扱う。
- Errorには復旧actionを1つ以上関連付ける。

## Accessibility

- Setup viewの見出しへ起動時focusを置く。
- 状態変化をlive regionで通知する。
- すべてのbuttonへ日本語accessible nameを付ける。
- Keyboardだけで選択、再試行、終了ができる。

## Extension準拠

- Security: Rendererはpath、process、credentialを所有しない。
- Resiliency: Workspace再選択とdependency単位の再試行を提供する。
- PBT: UI表示codeはdomain statusの全許可値を網羅し、未知値を安全に処理する。
