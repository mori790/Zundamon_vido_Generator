# U4 NFR Design 追加確認

## 検出した矛盾

NFR Requirementsでは、提案抽出、状態遷移、永続化データ検証をReact表示から分離すると承認されています。一方、NFR Design Question 5では「CodexPanel内部ですべて管理」が選択されています。

## Question 1
CodexPanelを提案状態の所有者にしつつ、ロジック配置をどのようにしますか？

A) CodexPanelが状態を所有し、提案抽出・状態遷移・保存形式検証はshared層の純粋関数へ分離する

B) 承認済みNFRを変更し、提案抽出・状態遷移・保存形式検証もCodexPanel内へ置く

C) CodexPanelの親であるStudioAppが状態を所有し、すべてのロジックをshared層へ分離する

D) Other（希望する配置を [Answer]: の後に記載してください）

[Answer]:c
