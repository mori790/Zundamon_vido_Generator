# Zundamon Video Generator

台本JSONから、VOICEVOX音声、字幕、ずんだもん立ち絵、説明素材、タイムラインを組み合わせてRemotionでMP4を生成するローカルCLIツールです。

## Requirements

- macOS
- Node.js LTS
- npm
- VOICEVOX Engine running at `http://localhost:50021`
- FFmpeg/Chromium dependencies required by Remotion

## Setup

```bash
npm install
```

VOICEVOX Engineの接続先は環境変数で変更できます。

```bash
VOICEVOX_BASE_URL=http://localhost:50021
```

## Quick Start

まず同梱の `sample-video` で、VOICEVOXなしで確認できる範囲を実行します。

```bash
npm run validate -- sample-video
npm test
```

MP4まで生成する場合は、先にVOICEVOX Engineを起動してから実行します。

```bash
npm run video -- sample-video
```

成功すると次のファイルが作成されます。

```text
output/sample-video.mp4
```

## Basic Workflow

### 1. 台本JSONを用意する

`input/{videoId}.json` を作成します。まずは `input/sample-video.json` をコピーして編集するのが簡単です。

```bash
cp input/sample-video.json input/my-video.json
```

JSON内の `id` はファイル名と一致させてください。

```json
{
  "id": "my-video",
  "title": "動画タイトル",
  "scenes": []
}
```

### 2. 素材を配置する

説明画像は `public/visuals/{videoId}/` に置きます。

```text
public/visuals/my-video/example.png
```

台本JSONからは `/visuals/my-video/example.png` のように参照します。

ずんだもん立ち絵は `public/characters/zundamon/` に配置します。必要なファイル名は [Asset Policy](#asset-policy) を参照してください。

### 3. 入力を検証する

```bash
npm run validate -- my-video
```

この時点で、JSONの不備、存在しない画像、パスの誤りなどを確認できます。

### 4. VOICEVOX Engineを起動する

VOICEVOX Engineを起動し、次のURLで接続できる状態にします。

```text
http://localhost:50021
```

接続先を変える場合は環境変数を指定します。

```bash
VOICEVOX_BASE_URL=http://localhost:50021 npm run voice -- my-video
```

### 5. 音声を生成する

```bash
npm run voice -- my-video
```

生成されたWAVは次に保存されます。

```text
public/audio/my-video/
```

同じセリフと音声設定ならキャッシュが使われます。強制的に再生成する場合は `--force` を付けます。

```bash
npm run voice -- my-video --force
```

### 6. タイムラインを生成する

```bash
npm run timeline -- my-video
```

生成されたタイムラインは次に保存されます。

```text
generated/timelines/my-video.timeline.json
```

### 7. プレビューする

```bash
npm run preview -- my-video
```

Remotion Studioで見た目を確認します。事前に音声とタイムラインを生成しておく必要があります。

### 8. MP4を書き出す

```bash
npm run video -- my-video
```

出力先:

```text
output/my-video.mp4
```

## Commands

| Command | Purpose |
|---|---|
| `npm run validate -- {videoId}` | 台本JSONと素材参照を検証する |
| `npm run voice -- {videoId}` | VOICEVOXでWAV音声を生成する |
| `npm run timeline -- {videoId}` | 音声長からフレームタイムラインを生成する |
| `npm run preview -- {videoId}` | Remotion Studioでプレビューする |
| `npm run video -- {videoId}` | 検証、音声生成、タイムライン生成、MP4出力を一括実行する |
| `npm run video -- {videoId} --force` | 音声キャッシュを使わずに一括生成する |
| `npm run video -- {videoId} --verbose` | 詳細ログ付きで一括生成する |
| `npm test` | 通常の単体テストを実行する |
| `npm run test:integration` | VOICEVOX接続を含む結合テストを実行する |
| `npm run test:render` | サンプル動画の任意render検証を実行する |

`npm run test:integration` はVOICEVOX Engineが起動していない場合に失敗します。`npm run test:render` は任意の重い検証コマンドで、通常の `npm test` には含めません。

## Directory Layout

```text
input/                  User-authored script JSON
public/audio/           Generated WAV files
public/characters/      Character assets
public/visuals/         Explanation visuals
public/backgrounds/     Background assets
generated/manifests/    Voice cache manifests
generated/timelines/    Frame timelines
output/                 Rendered MP4 files
scripts/                CLI entry points
src/core/               Validation, VOICEVOX, cache, timeline, render services
src/components/         Remotion scene components
src/compositions/       Remotion compositions
src/schemas/            Zod schemas
src/types/              Shared TypeScript types
src/utils/              Helpers
tests/                  Unit and integration tests
```

## Script Input

Create `input/{videoId}.json`. See `input/sample-video.json` for a working sample.

Required top-level fields:

```text
id
title
speaker
video
subtitle
scenes
```

Each scene must have:

```text
id
type
text
```

Supported scene types:

```text
title
explanation
code
summary
ending
```

Supported emotions:

```text
normal
happy
surprised
troubled
```

## Asset Policy

User-created videos should provide real character PNG files:

```text
public/characters/zundamon/normal-open.png
public/characters/zundamon/normal-close.png
public/characters/zundamon/happy-open.png
public/characters/zundamon/happy-close.png
public/characters/zundamon/surprised-open.png
public/characters/zundamon/surprised-close.png
public/characters/zundamon/troubled-open.png
public/characters/zundamon/troubled-close.png
```

The bundled `sample-video` can use SVG placeholder character assets for first-run validation and preview.

## Troubleshooting

### VOICEVOXに接続できない

VOICEVOX Engineを起動してください。標準接続先は次です。

```text
http://localhost:50021
```

接続先を変える場合:

```bash
VOICEVOX_BASE_URL=http://localhost:50021 npm run video -- sample-video
```

### `npm run validate` で説明画像が見つからない

JSONの `visual.src` は `public` 配下を `/` 始まりで指定します。

```json
{
  "visual": {
    "type": "image",
    "src": "/visuals/my-video/example.png"
  }
}
```

実ファイルは次に置きます。

```text
public/visuals/my-video/example.png
```

### ユーザー動画で立ち絵が見つからない

`sample-video` 以外ではPNG立ち絵が必要です。`public/characters/zundamon/` に必要な8ファイルを配置してください。

### キャッシュを無視して音声を作り直したい

```bash
npm run voice -- my-video --force
npm run video -- my-video --force
```

### 詳細ログを見たい

```bash
npm run video -- my-video --verbose
```

## Manual Verification

1. Start VOICEVOX Engine.
2. Run `npm run validate -- sample-video`.
3. Run `npm run voice -- sample-video`.
4. Run `npm run timeline -- sample-video`.
5. Run `npm run video -- sample-video`.
6. Confirm `output/sample-video.mp4` is created and plays.
