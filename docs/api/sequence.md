# Profile API — シーケンス図

GitHub Pages で閲覧する場合、Mermaid は GitHub Markdown エンジンで自動レンダリングされます。

---

## 1. 初期セットアップ（初回のみ）

```mermaid
sequenceDiagram
    actor Dev as 開発者
    participant GAS as Google Apps Script
    participant GH as GitHub Repository

    Dev->>Dev: openssl rand -hex 32 で HMAC_SECRET を生成
    Dev->>GAS: Script Properties に HMAC_SECRET & SPREADSHEET_ID を設定
    Dev->>GAS: Web App としてデプロイ (execute as: Me, access: Anyone)
    GAS-->>Dev: Deployment URL を取得
    Dev->>GH: Secrets に GAS_API_URL & GAS_HMAC_SECRET を登録
```

---

## 2. 定期同期フロー（毎日 05:00 JST）

```mermaid
sequenceDiagram
    participant Cron as GitHub Actions (cron)
    participant Node as sync-from-gas.js
    participant GAS as GAS Web App
    participant Sheet as Google Sheets
    participant Repo as Repository

    Cron->>Node: workflow_dispatch or schedule trigger
    loop 各リソース (certifications, work_experience, skills, projects)
        Node->>Node: timestamp = now(), message = "{timestamp}:{path}"
        Node->>Node: signature = HMAC-SHA256(secret, message)
        Node->>GAS: GET ?path={path}&timestamp={ts}&signature={sig}
        GAS->>GAS: |now - timestamp| <= 300 sec? を検証
        GAS->>GAS: HMAC-SHA256(secret, message) と比較
        alt 検証成功
            GAS->>Sheet: getDataRange().getValues()
            Sheet-->>GAS: rows[]
            GAS-->>Node: { ok: true, data: [...] }
        else 検証失敗
            GAS-->>Node: { ok: false, error: "Signature mismatch" }
            Note over Node: エラーをログに記録して次のリソースへ
        end
    end
    Node->>Repo: data/profile.json を更新
    Node->>Repo: scripts/update-readme.js を実行
    Repo->>Repo: README.md / README.ja.md を再生成
    Repo->>Repo: git commit & push
```

---

## 3. HMAC-SHA256 署名の仕組み

```mermaid
sequenceDiagram
    participant Client as GitHub Actions
    participant Server as GAS Web App

    Note over Client: secret = GAS_HMAC_SECRET (GitHub Secret)
    Note over Server: secret = HMAC_SECRET (GAS Script Property)

    Client->>Client: timestamp = floor(Date.now() / 1000)
    Client->>Client: message = "{timestamp}:{path}"
    Client->>Client: signature = HMAC-SHA256(secret, message)
    Client->>Server: GET ?path=certifications&timestamp=1716000000&signature=a1b2...

    Server->>Server: |now - timestamp| > 300? → reject (replay attack 防止)
    Server->>Server: expected = HMAC-SHA256(HMAC_SECRET, "{timestamp}:{path}")
    Server->>Server: safeEquals(expected, signature)?  ← タイミング攻撃対策
    alt 一致
        Server-->>Client: 200 { ok: true, data: [...] }
    else 不一致
        Server-->>Client: { ok: false, error: "Signature mismatch", code: 401 }
    end
```

---

## 4. ローカルでの動作確認

```bash
# .env に設定
GAS_API_URL=https://script.google.com/macros/s/YOUR_ID/exec
GAS_HMAC_SECRET=your_secret_here

# 署名を生成して URL を確認
node scripts/generate-hmac.js certifications

# profile.json を手動同期
node scripts/sync-from-gas.js
```
