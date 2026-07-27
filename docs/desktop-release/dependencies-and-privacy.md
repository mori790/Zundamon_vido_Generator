# Codex、VOICEVOX、Privacy

## Codex CLI

- Appへbundleされない。
- 未導入の場合は公式手順でinstallする。
- Version不足の場合は0.145.0以降へupgradeする。
- 未loginの場合はTerminalで`codex login`を実行する。
- Appはtokenやlogin credentialを保存しない。

Codexが利用不能でもMock、台本、素材、Preview、Renderの利用可能な機能は継続できる。

## VOICEVOX

- VOICEVOX EngineはAppへbundleされない。
- Voice実行前にVOICEVOXを起動する。
- Default接続先は`http://127.0.0.1:50021`。

VOICEVOXが利用不能でも台本編集、Codex、既存音声を使うRenderは継続できる。

## Privacy

- 制作dataは選択したlocal Workspaceに保存される。
- AppはAppleの公証、dependency取得、利用者が実行したCodex以外のcloud serviceを必要としない。
- 通常logへcredential、token、login detailを出力しない。
- Build MacとWorkspaceはFileVaultなどOS管理の保存時暗号化を使用する。
