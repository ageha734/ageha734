import crypto from 'node:crypto'
import http from 'node:http'
/**
 * 職務経歴書取得フロー統合テスト
 * シーケンス: 認証済みリクエスト → 各カテゴリのデータ取得 → レスポンス構造検証
 */
import {afterAll, beforeAll, describe, expect, it} from 'vitest'

const HMAC_KEY = process.env['TEST_HMAC_KEY'] ?? 'integration-test-secret'
const PORT = 13003

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

// ─── 正常系: 各カテゴリの取得シーケンス ─────────────────────

describe('正常系: certifications 取得シーケンス', () => {
    it('certifications を取得し 200 と配列データを返す', async () => {
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

describe('正常系: work_experience 取得シーケンス', () => {
    it('work_experience を取得し 200 を返す', async () => {
        const ts = now()
        const res = await get({
            path: 'work_experience',
            timestamp: ts,
            signature: sign('work_experience', ts)
        })
        expect(res.status).toBe(200)
    })

    it('在職中レコードの end は null になっている', async () => {
        const ts = now()
        const res = await get({
            path: 'work_experience',
            timestamp: ts,
            signature: sign('work_experience', ts)
        })
        const data = (res.body as {data: Record<string, unknown>[]}).data
        const current = data.find(r => r['end'] === null)
        expect(current).toBeDefined()
    })
})

describe('正常系: skills 取得シーケンス', () => {
    it('skills を取得し 200 を返す', async () => {
        const ts = now()
        const res = await get({path: 'skills', timestamp: ts, signature: sign('skills', ts)})
        expect(res.status).toBe(200)
    })
})

describe('正常系: projects 取得シーケンス', () => {
    it('projects を取得し 200 を返す', async () => {
        const ts = now()
        const res = await get({path: 'projects', timestamp: ts, signature: sign('projects', ts)})
        expect(res.status).toBe(200)
    })
})

// ─── 異常系: 不正なパス ──────────────────────────────────────

describe('異常系: 不正なパス → 400', () => {
    it('許可されていないパスは 400 を返す', async () => {
        const ts = now()
        const res = await get({
            path: 'personal_info',
            timestamp: ts,
            signature: sign('personal_info', ts)
        })
        expect(res.status).toBe(400)
        expect((res.body as {ok: boolean}).ok).toBe(false)
    })

    it('空のパスは 400 を返す', async () => {
        const ts = now()
        const res = await get({path: '', timestamp: ts, signature: sign('', ts)})
        expect(res.status).toBe(400)
    })
})
