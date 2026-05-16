import crypto from 'node:crypto'
import http from 'node:http'
/**
 * E2E tests — 認証して職務経歴書データを取得し内部で処理するシナリオ（ブラックボックス）
 * 正常系: 認証 → 全カテゴリ取得 → データ構造検証
 * 異常系: 認証失敗 → データ取得不可
 */
import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import {parseRows} from '../../lib/sheet'

const SECRET = process.env['TEST_HMAC_SECRET'] ?? 'e2e-test-secret'
const PORT = 13002

function sign(path: string, timestamp: string): string {
    return crypto.createHmac('sha256', SECRET).update(`${timestamp}:${path}`, 'utf8').digest('hex')
}

function now(): string {
    return String(Math.floor(Date.now() / 1000))
}

interface ApiResponse {
    ok: boolean
    path?: string
    data?: Record<string, unknown>[]
    error?: string
    code?: number
}

async function fetchCv(
    params: Record<string, string>
): Promise<{status: number; body: ApiResponse}> {
    const qs = new URLSearchParams(params).toString()
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${PORT}?${qs}`, res => {
            let raw = ''
            res.on('data', chunk => {
                raw += chunk
            })
            res.on('end', () =>
                resolve({status: res.statusCode ?? 0, body: JSON.parse(raw) as ApiResponse})
            )
        }).on('error', reject)
    })
}

let server: http.Server

beforeAll(async () => {
    const {createServer} = await import('../../local/server.js')
    server = createServer(SECRET)
    await new Promise<void>(resolve => server.listen(PORT, resolve))
})

afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
        server.close(err => (err ? reject(err) : resolve()))
    )
})

// ─── 正常系シナリオ ──────────────────────────────────────────

describe('正常系シナリオ: 認証して職務経歴書データを取得・処理する', () => {
    it('シナリオ: certifications を取得し年・月・資格名が揃っている', async () => {
        const ts = now()
        const res = await fetchCv({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })

        expect(res.status).toBe(200)
        expect(res.body.ok).toBe(true)
        expect(res.body.data).toBeDefined()

        const data = res.body.data ?? []
        expect(data.length).toBeGreaterThan(0)
        for (const row of data) {
            expect(row).toHaveProperty('year')
            expect(row).toHaveProperty('month')
            expect(row).toHaveProperty('name_en')
            expect(row).toHaveProperty('name_ja')
        }
    })

    it('シナリオ: work_experience を取得し在職中レコードの end は null になっている', async () => {
        const ts = now()
        const res = await fetchCv({
            path: 'work_experience',
            timestamp: ts,
            signature: sign('work_experience', ts)
        })

        expect(res.status).toBe(200)
        const data = res.body.data ?? []
        expect(data.length).toBeGreaterThan(0)

        const current = data.find(r => r['end'] === null)
        expect(current).toBeDefined()
    })

    it('シナリオ: skills を取得し category・name が存在する', async () => {
        const ts = now()
        const res = await fetchCv({path: 'skills', timestamp: ts, signature: sign('skills', ts)})

        expect(res.status).toBe(200)
        const data = res.body.data ?? []
        expect(data.length).toBeGreaterThan(0)
        for (const row of data) {
            expect(typeof row['category']).toBe('string')
            expect(typeof row['name']).toBe('string')
        }
    })

    it('シナリオ: projects を取得し name・url が存在する', async () => {
        const ts = now()
        const res = await fetchCv({
            path: 'projects',
            timestamp: ts,
            signature: sign('projects', ts)
        })

        expect(res.status).toBe(200)
        const data = res.body.data ?? []
        expect(data.length).toBeGreaterThan(0)
        for (const row of data) {
            expect(typeof row['name']).toBe('string')
            expect(typeof row['url']).toBe('string')
        }
    })

    it('シナリオ: 取得した生データを parseRows で再処理しても同一結果になる', async () => {
        const ts = now()
        const res = await fetchCv({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })

        expect(res.status).toBe(200)
        const data = res.body.data ?? []

        // API が返す data は既に parseRows 処理済みなので空行を含まない
        const reProcessed = parseRows([
            Object.keys(data[0] ?? {}),
            ...data.map(r => Object.values(r))
        ])
        expect(reProcessed.length).toBe(data.length)
    })

    it('シナリオ: 全カテゴリを順番に取得できる（シーケンス全体）', async () => {
        const paths = ['certifications', 'work_experience', 'skills', 'projects'] as const
        for (const path of paths) {
            const ts = now()
            const res = await fetchCv({path, timestamp: ts, signature: sign(path, ts)})
            expect(res.status).toBe(200)
            expect(res.body.ok).toBe(true)
            expect(res.body.path).toBe(path)
        }
    })
})

// ─── 異常系シナリオ ──────────────────────────────────────────

describe('異常系シナリオ: 認証失敗時はデータを取得できない', () => {
    it('シナリオ: 署名なしではデータ取得不可', async () => {
        const ts = now()
        const res = await fetchCv({path: 'certifications', timestamp: ts, signature: ''})
        expect(res.status).toBe(401)
        expect(res.body.ok).toBe(false)
        expect(res.body.data).toBeUndefined()
    })

    it('シナリオ: 改ざんされた署名ではデータ取得不可', async () => {
        const ts = now()
        const validSig = sign('certifications', ts)
        const tamperedSig = validSig.slice(0, -1) + (validSig.endsWith('a') ? 'b' : 'a')
        const res = await fetchCv({path: 'certifications', timestamp: ts, signature: tamperedSig})
        expect(res.status).toBe(401)
        expect(res.body.ok).toBe(false)
    })

    it('シナリオ: 期限切れトークンではデータ取得不可', async () => {
        const ts = String(Math.floor(Date.now() / 1000) - 400)
        const res = await fetchCv({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(401)
        expect(res.body.ok).toBe(false)
    })

    it('シナリオ: 存在しないリソースはデータ取得不可（400）', async () => {
        const ts = now()
        const res = await fetchCv({
            path: 'personal_info',
            timestamp: ts,
            signature: sign('personal_info', ts)
        })
        expect(res.status).toBe(400)
        expect(res.body.ok).toBe(false)
        expect(res.body.data).toBeUndefined()
    })
})
