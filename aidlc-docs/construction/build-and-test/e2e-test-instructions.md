# End-to-End Test Instructions

## First Run

1. 新規macOS user profileで未署名local acceptance `.app`を起動する。
2. First Run画面が操作をblockingすることを確認する。
3. 空のtest directoryをWorkspaceとして選択する。
4. `input/`、`public/`、`generated/`、`output/`が作成されることを確認する。
5. 再起動し、Workspace参照が復元されることを確認する。

## Dependency Diagnosis

1. Codex CLI未導入、VOICEVOX停止状態で日本語actionが独立表示されることを確認する。
2. Codexをloginし、VOICEVOXを起動して再診断する。
3. 一方の失敗が他方のready状態を隠さないことを確認する。

## Creator Workflow

1. 台本を作成または読込し、素材を選択する。
2. Validate、Voice、Timeline、Previewを実行する。
3. Renderのprogress、ETA、Stop、manual retryを確認する。
4. Finder revealからMP4を再生し、映像、音声、字幕、末尾を確認する。

## Release Workflow

1. `npm run release:local`で`.app`、ZIP、SBOM、manifestを生成する。
2. manifestのversion、architecture、SHA-256、`local-acceptance`を確認する。
3. credentialなしの`npm run verify:release`が失敗することを確認する。
4. Apple credentialがあるrelease担当者だけが署名・公証済みpublic workflowを実行する。
