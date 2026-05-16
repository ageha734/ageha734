# GAS Profile API — セットアップ手順

## 1. Google スプレッドシートを準備する

以下の4シートを作成し、1行目をヘッダーにする：

### certifications
| year | month | name_en | name_ja |
|------|-------|---------|---------|
| 2022 | 3 | AWS Certified Solutions Architect - Associate | AWS ソリューションアーキテクトアソシエイト |

### work_experience
| company_en | company_ja | start | end | role_en | role_ja | description_en | description_ja |
|---|---|---|---|---|---|---|---|
| Example Corp | 株式会社エグザンプル | 2022-04 | 2024-03 | Backend Engineer | バックエンドエンジニア | ... | ... |

> `end` は現職の場合は空欄にする（null として扱われる）

### skills
| category | name | badge_url | icon_url |
|---|---|---|---|
| advanced | Go | https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=white | |
| advanced | Kubernetes | | https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-original-wordmark.svg |

> `badge_url` か `icon_url` のどちらか一方を指定。両方指定した場合は `badge_url` が優先される。

### projects
| name | url | description_en | description_ja | stars_badge | forks_badge | issues_badge | prs_badge |
|---|---|---|---|---|---|---|---|

---

## 2. GAS プロジェクトを作成する

1. [Google Apps Script](https://script.google.com/) にアクセス
2. 新規プロジェクトを作成
3. `Code.js` の内容をエディタに貼り付け
4. `appsscript.json` の内容をプロジェクト設定の `appsscript.json` に反映

---

## 3. スクリプトプロパティを設定する

**プロジェクト設定 > スクリプト プロパティ** で以下を追加：

| キー | 値 |
|---|---|
| `HMAC_SECRET` | ローカルで生成したシークレット（後述） |
| `SPREADSHEET_ID` | スプレッドシートの URL から取得する ID |

---

## 4. シークレットキーを生成する

```bash
# ランダムな 32 バイトの hex 文字列を生成
openssl rand -hex 32
```

この値を：
- GAS の Script Properties `HMAC_SECRET` に設定
- GitHub Repository の Secrets `GAS_HMAC_SECRET` に設定

---

## 5. GAS Web App としてデプロイする

1. GAS エディタ右上の **デプロイ > 新しいデプロイ**
2. 種類: **ウェブアプリ**
3. 次のユーザーとして実行: **自分**
4. アクセスできるユーザー: **全員**（認証は HMAC で行う）
5. デプロイ → URL をコピー

---

## 6. GitHub Secrets を設定する

リポジトリの **Settings > Secrets and variables > Actions** で：

| Secret 名 | 値 |
|---|---|
| `GAS_API_URL` | GAS Web App の URL |
| `GAS_HMAC_SECRET` | 手順4で生成したシークレット |

---

## 7. 動作確認

```bash
# .env ファイルに設定
GAS_API_URL=https://script.google.com/macros/s/YOUR_ID/exec
GAS_HMAC_SECRET=your_secret_here

# 署名付き URL を生成して確認
node scripts/generate-hmac.js certifications

# profile.json を手動同期
node scripts/sync-from-gas.js
```

---

## API ドキュメント

- [Swagger UI](https://mypages.ageha734.jp/api/) — インタラクティブな API リファレンス
- [シーケンス図](https://mypages.ageha734.jp/api/sequence.md) — 認証フロー図解
