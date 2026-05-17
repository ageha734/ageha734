import crypto from 'node:crypto'
import http from 'node:http'
/**
 * 認証フロー統合テスト
 * シーケンス: クライアント → タイムスタンプ+署名付きリクエスト → サーバー検証 → レスポンス
 */
import {afterAll, beforeAll, describe, expect, it} from 'vitest'

const HMAC_KEY = process.env['TEST_HMAC_KEY'] ?? 'integration-test-secret'
const PORT = Number.parseInt(process.env['PORT'] ?? '3000', 10)

function sign(path: string, timestamp: string): string {
    return crypto
        .createHmac('sha256', HMAC_KEY)
        .update(`${timestamp}:${path}`, 'utf8')
        .digest('hex')
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
    const {createServer} = await import('./server.js')
    server = createServer(HMAC_KEY)
    await new Promise<void>(resolve => server.listen(PORT, resolve))
})

afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
        server.close(err => (err ? reject(err) : resolve()))
    )
})

// ─── 正常系: 認証成功シーケンス ─────────────────────────────

describe('正常系: 認証成功シーケンス', () => {
    it('有効な署名+タイムスタンプで 200 を返す', async () => {
        const ts = now()
        const res = await get({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(200)
        expect((res.body as {ok: boolean}).ok).toBe(true)
    })

    it('パスは大文字でも正規化されて認証される', async () => {
        const ts = now()
        const res = await get({path: 'SKILLS', timestamp: ts, signature: sign('skills', ts)})
        expect(res.status).toBe(200)
    })

    it('許容範囲内（4分59秒前）のタイムスタンプで認証される', async () => {
        const ts = String(Math.floor(Date.now() / 1000) - 299)
        const res = await get({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(200)
    })
})

// ─── 異常系: 認証失敗シーケンス ─────────────────────────────

describe('異常系: 署名なし → 401', () => {
    it('署名が空の場合は 401 を返す', async () => {
        const ts = now()
        const res = await get({path: 'certifications', timestamp: ts, signature: ''})
        expect(res.status).toBe(401)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })

    it('署名が不正な場合は 401 を返す', async () => {
        const ts = now()
        const res = await get({path: 'certifications', timestamp: ts, signature: 'a'.repeat(64)})
        expect(res.status).toBe(401)
    })
})

describe('異常系: タイムスタンプ検証失敗 → 401', () => {
    it('タイムスタンプなしは 401 を返す', async () => {
        const ts = now()
        const res = await get({
            path: 'certifications',
            timestamp: '',
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(401)
    })

    it('期限切れタイムスタンプ（6分前）は 401 を返す', async () => {
        const ts = String(Math.floor(Date.now() / 1000) - 361)
        const res = await get({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(401)
    })

    it('未来タイムスタンプ（6分後）は 401 を返す', async () => {
        const ts = String(Math.floor(Date.now() / 1000) + 361)
        const res = await get({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(401)
    })
})

describe('異常系: リプレイ攻撃 → 401', () => {
    it('他パス向けの署名を使い回すと 401 を返す', async () => {
        const ts = now()
        const wrongSig = sign('skills', ts)
        const res = await get({path: 'certifications', timestamp: ts, signature: wrongSig})
        expect(res.status).toBe(401)
    })
})
