Avatar: add skipped tests for middle-click and modifier-click

概要:

- `frontend/components/Avatar/__tests__/Avatar.test.tsx` を追加しました。
- 中クリック（auxclick）や Ctrl/Cmd+クリック、通常クリック、Enter/Space のスケルトンテストを `test.skip` で追加しています。

理由:

- 現行実装の中クリック挙動や修飾キー動作を保護するためのテストを追加する準備。
- 実装が揃うまで CI を壊さないようスキップしています。

作業内容:

- テストは `window.open` のスパイや `next/navigation` の `useRouter` をモックして期待挙動を検証する構成です。
- 型チェックが通るようにマイナー修正を行いました（`MouseEvent` を使った修正）。

注意事項:

- テストは現時点で `test.skip` です。実装完了後にスキップを外して CI で有効化してください。

Closes #73

-- by Copilot
