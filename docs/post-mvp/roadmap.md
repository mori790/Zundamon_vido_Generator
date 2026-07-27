# Post-MVP Roadmap

## Next

1. シリーズ管理。
2. テンプレートライブラリ。
3. 複数Workspace管理。

Next項目は制作効率への直接効果が高く、既存のlocal Workspace方針と整合しやすい。

## Later

- サムネイル自動生成。
- YouTubeアップロード。
- Render queue。
- ログ永続化。
- Preview filesystem watcher。

Later項目は公開効率や大規模制作に効くが、credential、長時間処理、watch負荷などの追加riskがある。

## Future

- Auto Update。
- DMG/PKG。
- Universal Binary/Intel Mac。
- Cloud共有/複数ユーザー。
- API-key型の代替AI provider。
- Codex完全自動実行。

Future項目は配布方式、cloud、credential、Human Approval境界への影響が大きいため、SecurityとResiliencyの再評価を必須にする。

## Exit Criteria

各項目を実装候補へ移す前に、次を満たす。

- 利用者価値が明確である。
- 依存関係が確認済みである。
- Security、Resiliency、PBTの適用範囲が決まっている。
- rollbackまたは無効化方法がある。
- 受入条件がGiven/When/Thenまたはchecklistで検証可能である。
