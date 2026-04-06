---
name: github-ops
description: 'Issue作成・PR作成・コミット・ghコマンド操作を行う時に使用するSkill。「Issue作って」「PR立てて」「コミットして」「PRレビューコメント確認」などの操作が対象。ラベル確認・本文ファイル生成・署名・Conventional Commitsルールを含む。'
argument-hint: '例: "認証機能追加のIssueを作成" / "PR作成してmain向けに" / "変更をコミットしてプッシュ"'
---

# GitHub Operations Skill

Issue作成・PR作成・コミット・GitHubコメント投稿など、`git` / `gh` CLIを使った操作全般を行う際のワークフロー。

## PR作成手順

必ず以下の順序で実行すること。

1. **ラベル確認**
   ```bash
   gh label list
   ```
   必要なラベルが存在しない場合は作成する：
   ```bash
   gh label create <name> --color <hex>
   ```

2. **本文ファイル生成**  
   PRの本文は `.github/DRAFTS/<ブランチ名>-pr.md` にファイルとして作成する。  
   テンプレートは [pull_request_template.md](../../pull_request_template.md) に従い全項目を埋める。  
   コマンドライン引数に `\n` を埋め込まない（シェル解釈や文字化け防止）。

3. **PR作成**
   ```bash
   gh pr create --title "タイトル" --body-file .github/DRAFTS/<ブランチ名>-pr.md --label "ラベル"
   ```

### ポイント
- タイトルにプレフィックス不要（例: `feat:` は不要）。変更内容を簡潔に表現する
- `Closes #Issue番号` を本文に必ず含める
- 重点レビュー箇所・変更の意図・影響範囲・テスト方針を明記する

---

## Issue作成手順

1. `.github/ISSUE_TEMPLATE/` から該当テンプレートを確認する
   - `feature.yml` / `bug_fix.yml` / `refactor.yml` / `test.yml` / `documentation.yml` / `ci_cd.yml` / `other.yml`

2. テンプレートの全項目を埋めてIssueを作成する
   ```bash
   gh issue create --title "[Feature] タイトル" --body-file <bodyファイル> --label "feature"
   ```
   - ラベルを必ず紐づける

---

## コミットルール

### Conventional Commits（日本語）
```
type: 日本語で説明
```

| type | 用途 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | リファクタリング |
| `test` | テスト追加・修正 |
| `docs` | ドキュメント修正 |
| `chore` | 設定・環境変更 |
| `style` | フォーマット・lint修正 |

例：
```
feat: 投稿作成機能を追加
fix: API認証エラーを修正
```

### コミット粒度
論理的に関連する変更ごとに小分けにする。1コミット1目的。  
`git add 特定ファイル` → `git commit` を繰り返す。複数の無関係な変更をまとめない。

### コミット前チェック
```bash
git status   # 変更ファイルを確認、漏れ・意図しないファイルがないかチェック
```

⚠️ `git add`/`commit`/`push` やファイル削除・DB操作など戻せない操作は、実行前にユーザーへ内容と影響を説明し明示的な許可を得ること。

---

## PRレビューコメント確認

時間指定（「何分前」）で絞り込まず、毎回確認対象コメントを全件取得して判定する。

```bash
# owner/repo を取得
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

# レビューコメント（コードへのインラインコメント）を全件取得
gh api --paginate "repos/${REPO}/pulls/<PR番号>/comments?per_page=100"

# PRのissueコメント（会話欄コメント）を全件取得
gh api --paginate "repos/${REPO}/issues/<PR番号>/comments?per_page=100"

# PR Review本文コメント（Approve / Request changes など）を全件取得
gh api --paginate "repos/${REPO}/pulls/<PR番号>/reviews?per_page=100"
```

### 判定ルール（ステータスマーカー運用）

- 対応状況の判定単位は、PR review comment ではコメント単体ではなくスレッド単位とする
- スレッド内コメント本文に以下のマーカーがある場合は、そのスレッド全体を「対応済み」として扱う
   - `<!-- resolved: true -->`（修正完了）
   - `<!-- ignored: true -->`（対応不要として明示）
   - `<!-- wontfix: true -->`（対応しない判断を明示）
- PR review comment は `in_reply_to_id` で親子関係を解釈し、親コメント自身にマーカーが無くても返信にマーカーがあれば親コメントも対応済みとして扱う
- スレッド内のどのコメントにもマーカーが無いスレッドは、その親コメントを「未対応」として扱う
- PRのissueコメント（会話欄コメント）と PR Review本文コメント（`pulls/<PR番号>/reviews`）は review comment のような親子スレッド構造が無いため、コメント単体でマーカー有無を判定する
- `gh pr view --comments` は補助的に使ってよいが、最終判定は `gh api --paginate` で取得した全件を用い、PR review comment はスレッド単位、issueコメントとReview本文コメントはコメント単体で行う

### 運用ルール

- 対応完了コメントには、親コメントではなく返信の末尾に `<!-- resolved: true -->` を付与する
- 対応不要・対応しない判断をした場合は、理由を書いたうえで親コメントではなく返信の末尾にそれぞれのマーカーを付与する
- 親コメント（レビュー指摘そのもの）にはマーカーを直接付与できない前提のため、返信側マーカーでスレッド全体の状態を表す
- 修正を行った場合は、必要に応じて返信内に修正コミットへのリンク（または短縮SHA）を1行添えてよい
- これにより次回確認時は、マーカー付き返信を含むスレッドを自動的にスキップして未対応のみ確認する

GitHubのWeb UIではなくCLIで確認する。

---

## GitHubへのコメント投稿（署名必須）

IssueやPRにコメントを投稿する際は、末尾に必ず署名を追加する：

```bash
gh issue comment <番号> --body-file <ファイル>
gh pr comment <番号> --body-file <ファイル>
```

本文ファイルの末尾に必ず以下を含める：
```
*-- by Copilot*
```

`--body` でなく `--body-file` を使い、実際の改行を含むファイルで渡す。
