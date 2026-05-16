---
title: Authentication Flow
---

<p align="right">
  <a href="../../index.md">← Back to index</a>
  ｜ <a href="../ja/auth.md">日本語</a> ｜ English
</p>

Each request is signed and verified so that only authorized clients can retrieve data.
By including a timestamp in the signature, the system also prevents replay attacks.

## API specifications

[Auth API](https://ageha734.github.io/ageha734/)

## Sequence diagram

```mermaid
sequenceDiagram
    participant client as GitHub Actions
    participant api as CV Data API

    client ->> api: Request CV data (with path, timestamp, and signature)
    activate api

    opt Timestamp is more than 5 minutes old
        api -->> client: 401 Timestamp expired
    end

    opt Signature does not match
        api -->> client: 401 Signature mismatch
    end

    opt Both checks pass
        api -->> client: 200 OK
    end
    deactivate api
```

{% include mermaid.html %}
