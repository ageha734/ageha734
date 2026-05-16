import crypto from 'node:crypto'
import http from 'node:http'
/**
 * Integration tests — HTTP サーバーに実際にリクエストを送り
 * 認証 → データ取得のシーケンスを検証する（ブラックボックス）
 */
import {afterAll, beforeAll, describe, expect, it} from 'vitest'

const SECRET = process.env['TEST_HMAC_SECRET'] ?? 'integration-test-secret'
const PORT = 13001

function sign(path: string, timestamp: string): string {
    return crypto.createHmac('sha256', SECRET).update(`${timestamp}:${path}`, 'utf8').digest('hex')
}

function now(): string {
    return String(Math.floor(Date.now() / 1000))
}

async function get(params: Record<string, string>): Promise<{status: number; body: unknown}> {
    const qs = new URLSearchParams(params).toString()
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${PORT}?${qs}`, res => {
            let raw = ''
            res.on('data', chunk => {
                raw += chunk
            })
            res.on('end', () => resolve({status: res.statusCode ?? 0, body: JSON.parse(raw)}))
        }).on('error', reject)
    })
}

let server: http.Server

beforeAll(async () => {
    // local/server.ts と同じロジックをインポートして起動
    const {createServer} = await import('../../local/server.js')
    server = createServer(SECRET)
    await new Promise<void>(resolve => server.listen(PORT, resolve))
})

afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
        server.close(err => (err ? reject(err) : resolve()))
    )
})

// ─── 正常系：認証 → データ取得シーケンス ───────────────────

describe('正常系', () => {
    it('certifications: 署名付きリクエストで 200 と配列データを返す', async () => {
        const ts = now()
        const res = await get({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(200)
        expect((res.body as {ok: boolean}).ok).toBe(true)
        expect(Array.isArray((res.body as {data: unknown[]}).data)).toBe(true)
    })

    it('work_experience: 正常に取得できる', async () => {
        const ts = now()
        const res = await get({
            path: 'work_experience',
            timestamp: ts,
            signature: sign('work_experience', ts)
        })
        expect(res.status).toBe(200)
        expect((res.body as {ok: boolean}).ok).toBe(true)
    })

    it('skills: 正常に取得できる', async () => {
        const ts = now()
        const res = await get({path: 'skills', timestamp: ts, signature: sign('skills', ts)})
        expect(res.status).toBe(200)
        expect((res.body as {ok: boolean}).ok).toBe(true)
    })

    it('projects: 正常に取得できる', async () => {
        const ts = now()
        const res = await get({path: 'projects', timestamp: ts, signature: sign('projects', ts)})
        expect(res.status).toBe(200)
        expect((res.body as {ok: boolean}).ok).toBe(true)
    })

    it('レスポンスに path フィールドが含まれる', async () => {
        const ts = now()
        const res = await get({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect((res.body as {path: string}).path).toBe('certifications')
    })
})

// ─── 異常系：認証エラー ──────────────────────────────────────

describe('異常系: 認証エラー', () => {
    it('署名なし → 401', async () => {
        const ts = now()
        const res = await get({path: 'certifications', timestamp: ts, signature: ''})
        expect(res.status).toBe(401)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })

    it('不正な署名 → 401', async () => {
        const ts = now()
        const res = await get({path: 'certifications', timestamp: ts, signature: 'a'.repeat(64)})
        expect(res.status).toBe(401)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })

    it('タイムスタンプなし → 401', async () => {
        const ts = now()
        const res = await get({
            path: 'certifications',
            timestamp: '',
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(401)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })

    it('期限切れタイムスタンプ（6分前）→ 401', async () => {
        const ts = String(Math.floor(Date.now() / 1000) - 361)
        const res = await get({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(401)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })

    it('未来タイムスタンプ（6分後）→ 401', async () => {
        const ts = String(Math.floor(Date.now() / 1000) + 361)
        const res = await get({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(401)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })

    it('他パス向けの署名を使い回す（リプレイ攻撃） → 401', async () => {
        const ts = now()
        const wrongSig = sign('skills', ts)
        const res = await get({path: 'certifications', timestamp: ts, signature: wrongSig})
        expect(res.status).toBe(401)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })
})

// ─── 異常系：不正なパス ──────────────────────────────────────

describe('異常系: 不正なパス', () => {
    it('許可されていないパス → 400', async () => {
        const ts = now()
        const res = await get({path: 'unknown', timestamp: ts, signature: sign('unknown', ts)})
        expect(res.status).toBe(400)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })

    it('空のパス → 400', async () => {
        const ts = now()
        const res = await get({path: '', timestamp: ts, signature: sign('', ts)})
        expect(res.status).toBe(400)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })

    it('大文字パスは正規化して正常処理される', async () => {
        const ts = now()
        const res = await get({path: 'SKILLS', timestamp: ts, signature: sign('skills', ts)})
        expect(res.status).toBe(200)
    })
})
