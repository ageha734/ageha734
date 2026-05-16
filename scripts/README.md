# scripts

プロフィールリポジトリの自動化を担う TypeScript スクリプト群。
実行には `tsx` を使用する（`pnpm tsx scripts/<file>.ts`）。

## 一覧

| スクリプト | `package.json` スクリプト名 | 概要 |
| --- | --- | --- |
| `sync-from-gas.ts` | `sync:gas` | GAS API から職務経歴書データを取得し `data/profile.json` を更新する |
| `sync-blog-posts.ts` | `sync:blog` | Qiita・Zenn から最新記事を取得し README のブログセクションを更新する |
| `update-readme.ts` | `generate` (前半) | `data/profile.json` と `templates/` から README を生成する |
| `generate-portfolio.ts` | `generate` (後半) | `data/profile.json` から `docs/index.html` を生成する |
| `validate-profile.ts` | `validate:profile` | `data/profile.json` の必須キー存在チェック |
| `validate-templates.ts` | `validate:templates` | Mustache テンプレートが空出力にならないかチェック |
| `generate-hmac.ts` | — | HMAC-SHA256 署名付き URL を手動生成するデバッグユーティリティ |

## 詳細

### `sync-from-gas.ts`

GAS Web App に HMAC-SHA256 署名付きリクエストを送る。
Google Sheets の各シートからデータを取得し、`data/profile.json` に書き込む。
対象シート：`certifications` / `work_experience` / `skills` / `projects`。

**必要な環境変数：**

| 変数名 | 説明 |
| --- | --- |
| `GAS_API_URL` | GAS Web App の URL |
| `GAS_HMAC_SECRET` | HMAC 署名の共有シークレット |

**実行例：**

```sh
GAS_API_URL=https://... GAS_HMAC_SECRET=secret pnpm sync:gas
```

### `sync-blog-posts.ts`

Qiita API と Zenn API から最新記事（各 3 件）を取得する。
日付降順で最大 5 件を README の `<!--START_SECTION:recent-posts-->` マーカー間に書き込む。

**環境変数（省略時はデフォルト値を使用）：**

| 変数名 | デフォルト |
| --- | --- |
| `QIITA_USERNAME` | `ageha734` |
| `ZENN_USERNAME` | `ageha734` |

### `update-readme.ts`

`templates/README.mustache` と `templates/README.ja.mustache` を `data/profile.json` でレンダリングする。
`README.md` / `README.ja.md` を生成し、WakaTime・LAPRAS カードセクションは上書きせず保持する。

### `generate-portfolio.ts`

`templates/portfolio.html.mustache` を `data/profile.json` でレンダリングして `docs/index.html` を生成する。

### `validate-profile.ts`

`data/profile.json` に必須キーが存在するかチェックする。
対象キー：`metadata` / `bio` / `links` / `skills` / `projects` / `articles`。
`pre-push` フックおよび CI で実行される。

### `validate-templates.ts`

`README.mustache` / `README.ja.mustache` を `data/profile.json` でレンダリングし、
出力が 100 文字未満にならないかチェックする。`pre-push` フックおよび CI で実行される。

### `generate-hmac.ts`

GAS API の HMAC-SHA256 署名付き URL をローカルで手動生成するデバッグ用ユーティリティ。
GitHub Actions では `sync-from-gas.ts` が内部で署名生成するため、通常は不要。

**必要な環境変数：** `GAS_API_URL`、`GAS_HMAC_SECRET`

**実行例：**

```sh
GAS_API_URL=https://... GAS_HMAC_SECRET=secret pnpm tsx scripts/generate-hmac.ts certifications
```
