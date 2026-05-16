# 定期同期フロー

毎日 05:00 JST に GitHub Actions が自動実行し、Google スプレッドシートの最新データをリポジトリに反映します。

## 仕組みの概要

1. **GitHub Actions** がスケジュールまたは手動操作をトリガーとして同期処理を開始します。
2. 職務経歴書の各カテゴリ（資格・職歴・スキル・プロジェクト）について、順番にデータを取得します。
3. 取得したデータをもとに `profile.json` を更新し、README とポートフォリオサイトを再生成してリポジトリにコミットします。

```mermaid
sequenceDiagram
    participant CI as GitHub Actions
    participant API as 職務経歴書 API
    participant Sheet as Google スプレッドシート
    participant Repo as リポジトリ

    Note over CI: スケジュール実行または手動起動

    loop 資格・職歴・スキル・プロジェクトの順に繰り返す
        CI->>API: 職務経歴書データの取得リクエスト（カテゴリ・署名付き）
        alt 認証エラー・タイムアウト
            API-->>CI: エラーレスポンス
            Note over CI: エラーを記録して次のカテゴリへ
        else 認証成功
            API->>Sheet: 該当シートのデータを読み込み
            Sheet-->>API: データ一覧
            API-->>CI: 正常レスポンス（データ本体）
        end
    end

    CI->>Repo: profile.json を最新データで上書き
    CI->>Repo: README・ポートフォリオサイトを再生成
    Repo->>Repo: 変更をコミットしてプッシュ
```
