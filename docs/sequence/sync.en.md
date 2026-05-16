# Periodic Sync Flow

GitHub Actions runs automatically every day at 05:00 JST to pull the latest data from Google Sheets and keep the repository up to date.

## How It Works

1. **GitHub Actions** starts the sync process on a schedule or when triggered manually.
2. It fetches data for each CV category (certifications, work experience, skills, projects) one at a time.
3. Once all data is collected, it updates `profile.json`, regenerates the README files and portfolio site, and commits the changes to the repository.

```mermaid
sequenceDiagram
    participant CI as GitHub Actions
    participant API as CV Data API
    participant Sheet as Google Sheets
    participant Repo as Repository

    Note over CI: Triggered by schedule or manual dispatch

    loop For each category: certifications, work experience, skills, projects
        CI->>API: Fetch CV data for category (signed request)
        alt Auth error or timeout
            API-->>CI: Error response
            Note over CI: Log error and continue to next category
        else Success
            API->>Sheet: Read data from the corresponding sheet
            Sheet-->>API: Data rows
            API-->>CI: Success response (data payload)
        end
    end

    CI->>Repo: Overwrite profile.json with latest data
    CI->>Repo: Regenerate README files and portfolio site
    Repo->>Repo: Commit and push changes
```
