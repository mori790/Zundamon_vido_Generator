# GUI and Codex Panel Requirements Questions

この質問ファイルは、Zundamon Video Generatorに「動画制作GUI + Codexパネル」を追加するための要件を詰めるものです。

各質問の `[Answer]:` に、選択肢の文字を記入してください。選択肢に合わない場合は最後の `Other` を選び、同じ行または次の行に希望を書いてください。

## Question 1
GUIの主な目的はどれですか？

A) 動画制作アプリを主役にし、Codexは右側パネルの相談役として使う

B) Codexチャットを主役にし、GUIはJSONやログを見やすくする補助画面にする

C) 最初は動画制作アプリ主役で作り、将来的にAI主導モードも追加する

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 2
Codexとの企画相談では、どこまでチャット内で完結させたいですか？

A) 企画、構成、台本、JSON生成、修正依頼までチャットで完結させたい

B) 企画と構成だけチャットで相談し、台本やJSONはGUIフォームで編集したい

C) チャットは補助的に使い、基本操作はすべてGUIボタンとフォームで行いたい

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 3
Codexが生成したJSONは、どの形式で確認したいですか？

A) 生JSONエディタで確認したい

B) シーン一覧、セリフ、表情、素材をカードや表として確認したい

C) 生JSONとGUI表示の両方を切り替えたい

X) Other (please describe after [Answer]: tag below)

[Answer]: c

## Question 4
Codexが生成したJSONの保存ルールはどれがよいですか？

A) 必ずユーザー確認後に `input/{videoId}.json` へ保存する

B) Codexが自動保存してよいが、差分確認画面を表示する

C) 下書きとして保存し、正式適用ボタンを押すまで動画生成には使わない

X) Other (please describe after [Answer]: tag below)

[Answer]: c

## Question 5
GUIのMVPで最初に必要な画面はどれですか？

A) プロジェクト一覧、シーン編集、Codexパネル、JSONレビュー、ログ、レンダー実行

B) 1動画だけを編集する単一画面、Codexパネル、JSONレビュー、レンダー実行

C) Codexパネル、JSONレビュー、ログだけの最小GUI

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 6
プレビュー体験はどこまでMVPに含めたいですか？

A) GUI内にRemotionプレビューを埋め込みたい

B) GUIからRemotion Studioを起動し、別画面で確認できればよい

C) MVPではMP4生成後に動画ファイルを開ければよい

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 7
Codexに許可する操作範囲はどれがよいですか？

A) 企画相談とJSON案生成のみ。ファイル保存やコマンド実行はユーザー操作に限定する

B) JSON保存まではCodexに許可し、音声生成やレンダーはユーザーが実行する

C) CodexがJSON保存、検証、音声生成、レンダーまで提案し、実行前にユーザー承認を取る

X) Other (please describe after [Answer]: tag below)

[Answer]: c

## Question 8
ChatGPT/Codexサブスクリプション利用の扱いはどれを優先しますか？

A) Codex App ServerのChatGPT managed認証を前提に、サブスクリプション利用を優先する

B) OpenAI APIキー方式も選べるようにし、サブスクリプション利用とAPI利用を両対応にする

C) MVPでは認証方式を固定せず、まずはCodex接続の技術検証を優先する

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 9
動画素材管理はMVPでどこまで必要ですか？

A) 画像ファイルをGUIで選択し、`public/visuals/{videoId}/` に配置できるようにしたい

B) 既存のフォルダ配置を使い、GUIでは参照と存在確認だけできればよい

C) MVPでは素材管理は後回しで、JSON内のパス編集だけでよい

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 10
制作フローの中心単位はどれですか？

A) 1つの動画プロジェクト単位で、企画からMP4出力まで管理する

B) 複数動画をまとめたシリーズ単位で、共通設定やテンプレートも管理する

C) まずは単発動画だけに絞り、シリーズ管理は将来対応にする

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 11
Security Extensions: セキュリティ拡張ルールをこのGUI構想に適用しますか？

A) Yes - 本番利用を見据えて、セキュリティルールをブロッキング制約として適用する

B) No - PoCまたは個人利用の試作として、セキュリティルールはスキップする

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 12
Resiliency Extensions: レジリエンシー基準をこのGUI構想に適用しますか？

A) Yes - 障害耐性、復旧性、観測性の設計ガイダンスとして適用する

B) No - ローカル個人ツールとして、まずは高速な試作を優先する

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 13
Property-Based Testing Extension: PBTルールをこのGUI構想に適用しますか？

A) Yes - JSON変換、状態遷移、保存処理などにPBTをブロッキング制約として適用する

B) Partial - 純粋関数、JSON変換、保存前検証など限定範囲に適用する

C) No - MVPでは通常の単体テストと結合テストを優先する

X) Other (please describe after [Answer]: tag below)

[Answer]: c

