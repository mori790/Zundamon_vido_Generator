# インストールと初回起動

## 対応環境

- Apple Silicon Mac
- macOS 13 Ventura以降
- 一般配布では署名・公証済みarm64 ZIPのみを使用する

## インストール

1. 配布ZIPのSHA-256がrelease manifestと一致することを確認する。
2. ZIPを展開する。
3. `Zundamon Video Generator.app`をApplications folderへ移動する。
4. Finderから起動し、macOSの通常の初回確認に従う。

Gatekeeperを無効化したり、quarantine属性を削除したりしない。起動を拒否された場合は、配布元へ署名・公証状態を確認する。

## First Run

1. 「Workspaceを選択」を押す。
2. 制作データを保存するfolderを選ぶ。
3. Appは不足している`input`、`public`、`generated`、`output`を作成する。
4. CodexとVOICEVOXの診断結果を確認する。

選択したWorkspaceの参照だけがElectron `userData`へ保存される。台本、素材、音声、動画は選択したWorkspaceに保存される。

## Permission

Appは次の操作だけを行う。

- 選択したWorkspaceの読み書き
- Codex CLIのlocal process起動
- VOICEVOXの`127.0.0.1:50021`への接続
- FinderでRender結果を表示
