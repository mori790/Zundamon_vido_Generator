# Requirements Verification Questions

このファイルの各質問について、選択肢の記号を `[Answer]:` の後に記入してください。
どの選択肢にも合わない場合は、最後の `Other` を選び、同じ行または次の行に詳細を書いてください。

## Question 1
Security Baseline拡張ルールをこのプロジェクトで有効化しますか？

A) Yes - セキュリティ要件をブロッキング制約として適用する

B) No - セキュリティ拡張ルールは適用しない

X) Other (please describe after [Answer]: tag below)

[Answer]:b 

## Question 2
Resiliency Baseline拡張ルールをこのプロジェクトで有効化しますか？

A) Yes - レジリエンシー設計のベストプラクティスを適用する

B) No - レジリエンシー拡張ルールは適用しない

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 3
Property-Based Testing拡張ルールをこのプロジェクトで有効化しますか？

A) Yes - PBTルールをブロッキング制約として適用する

B) Partial - 純粋関数とシリアライズ往復など、対象を限定して適用する

C) No - PBT拡張ルールは適用しない

X) Other (please describe after [Answer]: tag below)

[Answer]: c

## Question 4
初回実装の到達点はどこに設定しますか？

A) Phase 1のみ - Remotionで固定1シーンのMP4出力まで

B) Phase 1からPhase 2 - JSON入力で複数シーンの動画内容が変わるところまで

C) MVP優先度A - JSON、VOICEVOX音声生成、音声時間、字幕、立ち絵、MP4出力まで

D) MVP全体 - 優先度A/B/Cを含む仕様書のMVP機能を一通り実装する

X) Other (please describe after [Answer]: tag below)

[Answer]: d

## Question 5
立ち絵や背景などの画像素材が未配置の場合、初期実装ではどう扱いますか？

A) 素材未配置なら明確なエラーで停止する

B) 開発用プレースホルダー画像を同梱して動作確認できるようにする

C) 素材チェックは警告にして、画像なしでも動画を生成する

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 6
VOICEVOX Engineが未起動の環境でも開発・テストできる代替手段を用意しますか？

A) Yes - テスト用の既存WAVまたはモック生成経路を用意する

B) No - VOICEVOX Engine必須として、未接続時は仕様通り停止する

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 7
MVPのテスト実行方針はどこまで必須にしますか？

A) 単体テスト中心 - バリデーション、字幕改行、フレーム計算、キャッシュ、タイムラインを必須にする

B) 単体テストと軽量結合テスト - VOICEVOX接続確認やタイムライン生成の結合も含める

C) 単体・結合・E2E - サンプル台本からMP4生成まで検証対象にする

X) Other (please describe after [Answer]: tag below)

[Answer]: b

