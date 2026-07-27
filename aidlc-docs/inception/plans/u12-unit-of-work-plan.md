# U12 Unit of Work 計画

## 計画チェックリスト

- [x] U12要件、ユーザーストーリー、Application Design、実行計画を読み込む。
- [x] 分解の判断ポイントを特定する。
- [x] 質問への回答を収集する。
- [x] 回答の曖昧さ・矛盾・不足を分析する（曖昧さなし）。
- [x] `unit-of-work.md` を生成する。
- [x] `unit-of-work-dependency.md` を生成する。
- [x] `unit-of-work-story-map.md` を生成する。
- [x] ユニット境界と依存の検証を行う。
- [x] 全ストーリーがいずれかのユニットに割り当てられていることを確認する。

## 必須成果物

- [x] `aidlc-docs/inception/application-design/unit-of-work.md`
- [x] `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
- [x] `aidlc-docs/inception/application-design/unit-of-work-story-map.md`

## 分解方針（暫定案）

Application Designで特定した5コンポーネントを基に、5つの実装ユニットを設定する。

| ユニット | 名称 | 主要ストーリー |
|---|---|---|
| U12-A | テキスト入力パネル | US-1, US-2 |
| U12-B | AIシーン分割エンジン | US-3 |
| U12-C | シーン調整UI | US-4, US-5 |
| U12-D | 素材推薦パネル | US-6, US-7 |
| U12-E | JSON自動生成・パイプライン接続 | US-8, US-9, US-10, US-11 |

---

## 確認質問

すべての `[Answer]:` へ選択肢の文字を記入してください。

### 質問1
暫定案の5ユニット構成をどう扱いますか？

A) そのまま5ユニット（U12-A〜U12-E）で進める（推奨）

B) U12-AとU12-Bをまとめて「テキスト入力・シーン分割」1ユニットにする

C) U12-DとU12-Eをまとめて「素材割り当て・JSON生成」1ユニットにする

X) その他（記入）

[Answer]: a

### 質問2
ユニット間の依存順（A→B→C→D→E）で進めますか？

A) はい、A→B→C→D→Eの依存順に逐次実装する（推奨）

B) U12-AとU12-Bは並行して進める

C) 依存関係だけ示し、実装順は後で決める

X) その他（記入）

[Answer]: a

### 質問3
成果物には実装推奨順を含めますか？

A) 含める（依存順に基づいた推奨実装順を記載する）（推奨）

B) 依存関係のみ。実装順は後で決める

X) その他（記入）

[Answer]: a

### 質問4
U12-E（JSON自動生成・パイプライン接続）に含まれるUS-9〜US-11（VOICEVOX・プレビュー・レンダリング）は既存パイプライン再利用なので、U12-Eのスコープをどこまでにしますか？

A) U12-EはJSON生成まで。US-9〜US-11は「既存パイプライン統合確認」として同ユニットに含める（推奨）

B) US-9〜US-11を別ユニット（U12-F）として分離する

C) US-9〜US-11はU12のスコープ外とし、既存パイプラインへの接続確認は後で実施する

X) その他（記入）

[Answer]: a
