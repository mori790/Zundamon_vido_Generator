# U10 デスクトップパッケージング・リリース準備 要件確認質問

U10は複数componentにまたがる高リスクのdistribution changeなので、Comprehensive Requirements Analysisを使用します。各質問の `[Answer]:` に選択肢の文字を入力してください。

公式前提:

- Electronはpackaging/distribution toolとしてElectron Forgeを推奨しています: [Electron Application Packaging](https://www.electronjs.org/docs/latest/tutorial/application-distribution/)
- 一般配布するmacOSアプリはcode signingとnotarizationが推奨されます: [Electron Code Signing](https://www.electronjs.org/docs/latest/tutorial/code-signing)
- Apple notarizationはDeveloper ID、Hardened Runtime、secure timestamp、notarytoolを前提とします: [Apple Notarization](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)

## 質問1
U10の配布対象はどれですか？

A) このMacだけで使用するunsigned local `.app`（最小）

B) Mac App Store外で他ユーザーへ配布するsigned/notarized application（推奨）

C) Mac App Storeへ提出するapplication

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:b

## 質問2
サポートするMac architectureはどれですか？

A) Apple Silicon arm64のみ（現在の開発Mac向け、最小）

B) Apple Silicon arm64とIntel x64を別artifactで提供

C) Universal binaryを1 artifactで提供

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問3
生成する配布artifactはどれですか？

A) `.app`とZIP（最小、更新・検証しやすい）

B) DMGとZIP（一般ユーザー配布向け、推奨）

C) PKG installer

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問4
Packaging toolはどれを使用しますか？

A) Electron Forge（Electron公式推奨、推奨）

B) `@electron/packager`を直接使用する最小構成

C) electron-builder

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問5
Application identityはどの値を使用しますか？

A) Product name `Zundamon Video Generator`、bundle ID `com.tomimorisatoshihare.zundamon-video-generator`（推奨）

B) Product name `Zundamon Studio`、bundle ID `com.tomimorisatoshihare.zundamon-studio`

X) その他（製品名とbundle IDを`[Answer]:`の後に記載してください）

[Answer]:a

## 質問6
Packaging後のWorkspace data rootはどこにしますか？

A) ユーザーが選択したproject folderをrootにし、選択状態だけをElectron `userData`へ保存する（推奨）

B) 全dataをElectron `userData`配下へ移す

C) 現行どおりprocess current working directoryを使用する（packaged appでは不安定）

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問7
外部Codex CLI dependencyをどう扱いますか？

A) Bundleせず、起動時に存在/version/loginを確認してinstall/login手順を表示する（推奨）

B) Codex CLIをapplicationへbundleする

C) U10 artifactではReal Codexを無効にし、Mockのみ提供する

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問8
外部VOICEVOX dependencyをどう扱いますか？

A) Bundleせず、接続確認とinstall/start手順を表示する（推奨）

B) VOICEVOX Engineをapplicationへbundleする

C) U10 artifactではVoice生成を無効にする

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問9
Signing/notarization credentialの現状はどれですか？

A) Apple Developer Program、Developer ID Application certificate、notarytool credentialを利用できる

B) Apple Developer Programへ加入済みだがcertificate/credential準備が必要

C) 現在利用できないため、signed configurationと検証手順まで実装し、実notarizationはdeferredにする（推奨）

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:c

## 質問10
Release automationの範囲はどれですか？

A) Local `package`/`make`/verification scriptsのみ（最小、推奨）

B) GitHub Actionsでbuild/test/packageし、signed/notarized artifactはlocalで作る

C) GitHub Actionsでsigned/notarized release artifactまで作る

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問11
Application update方式はどれですか？

A) U10ではmanual download/reinstallのみ。Auto-updateはout of scope（推奨）

B) GitHub Releasesを使うauto-updateもU10に含める

C) 独自update serverを使う

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問12
Release acceptanceで必須にするclean-machine確認はどれですか？

A) 新規macOS user profileでinstall、Gatekeeper起動、Workspace選択、Mock、CLI checks、Preview、Renderを確認（推奨）

B) 開発Mac上のpackaged artifact smokeのみ

C) arm64とx64の各physical Macで完全workflowを確認

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問13
U10でapplication iconとend-user documentationをどこまで作成しますか？

A) Temporary generated icon、Install/First Run/Dependencies/Privacy/Recovery文書を含める（推奨）

B) 既存のブランドアイコンを使用する（対象ファイルのパスを「その他」として指定）

C) Default Electron iconのままにし、最小Install文書のみ

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問14
Security Baseline extensionをU10で適用しますか？

A) はい — すべてのSECURITY規則を、違反時に進行を止める必須制約として適用する（一般配布では推奨）

B) いいえ — Security extensionを無効化する

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問15
Resiliency Baseline extensionをU10で適用しますか？

A) はい — リリース、ロールバック、依存関係の障害、復旧へ適用する（推奨）

B) いいえ — Resiliency extensionを無効化する

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a

## 質問16
Property-Based Testing extensionをU10で適用しますか？

A) はい — パッケージングのパス、設定、バージョン、manifestロジックを含む完全なPBTを適用する（推奨）

B) 一部適用 — 純粋関数とシリアライズの往復変換だけに適用する

C) いいえ — 具体例テストとE2Eテストだけを使用する

X) その他（`[Answer]:`の後に内容を記載してください）

[Answer]:a
