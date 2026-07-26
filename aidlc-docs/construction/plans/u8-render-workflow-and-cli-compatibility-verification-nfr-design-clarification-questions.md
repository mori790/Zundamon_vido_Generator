# U8 NFR Design Clarification Questions

回答間に次の矛盾があります。

- Question 6の回答BはRender専用worker process poolを追加する選択です。
- 承認済みNFR RequirementsとTech Stack Decisionsは、1 Workspaceにつき同時Render 1件、U6 single Command Runnerの再利用、U8専用runnerやworker poolを追加しない方針です。

## Question 1
Render execution componentの最終方針はどれですか？

A) 承認済みNFRを維持し、Existing U6 single Command Runnerだけを使用する

B) 承認済みNFRを変更し、複数同時Renderに対応するworker process poolを追加する

C) 同時Renderは1件のまま、U6が管理するRender専用worker processを1つ追加する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:b

## Further Clarification

回答Bでは、worker poolが単一Render内のframe処理を並列化するのか、複数videoIdのRender jobsを同時実行するのかが未確定です。

## Question 2
Render worker poolは何を並列化しますか？

A) 単一Render内のframes。Remotionのexisting `concurrency`機能を使用し、Application-levelでは同時Render 1件を維持する

B) 複数videoIdのRender jobs。固定2件を同時実行し、3件目以降は拒否する

C) 複数videoIdのRender jobs。CPU数に応じたpoolとmemory-only queueを追加する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:a

## Content Validation

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown質問形式、空行、`[Answer]:` tagsを検証済み。
