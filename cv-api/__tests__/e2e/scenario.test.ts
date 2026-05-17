import crypto from 'node:crypto'
/**
 * E2E tests — デプロイ済みの GAS エンドポイントに実際にリクエストを送り
 * 認証 → 全カテゴリ取得 → データ構造検証のシナリオを検証する
 */
import {describe, expect, it} from 'vitest'

const GAS_URL = process.env['GAS_API_URL']
const SECRET = process.env['GAS_HMAC_SECRET']

if (!GAS_URL || !SECRET) {
    throw new Error('GAS_API_URL and GAS_HMAC_SECRET are required for E2E tests')
}

function sign(path: string, timestamp: string): string {
    return crypto.createHmac('sha256', SECRET!).update(`${timestamp}:${path}`, 'utf8').digest('hex')
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

async function fetchGas(
    params: Record<string, string>
): Promise<{status: number; body: ApiResponse}> {
    const url = new URL(GAS_URL!)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    const res = await fetch(url.toString(), {headers: {'User-Agent': 'ageha734-e2e/1.0'}})
    const body = (await res.json()) as ApiResponse
    return {status: res.status, body}
}

// ─── 正常系シナリオ ──────────────────────────────────────────

describe('正常系シナリオ: 認証して職務経歴書データを取得・処理する', () => {
    it('シナリオ: certifications を取得し年・月・資格名が揃っている', async () => {
        const ts = now()
        const res = await fetchGas({
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
        const res = await fetchGas({
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
        const res = await fetchGas({path: 'skills', timestamp: ts, signature: sign('skills', ts)})

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
        const res = await fetchGas({
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

    it('シナリオ: 全カテゴリを順番に取得できる（シーケンス全体）', async () => {
        const paths = ['certifications', 'work_experience', 'skills', 'projects'] as const
        for (const path of paths) {
            const ts = now()
            const res = await fetchGas({path, timestamp: ts, signature: sign(path, ts)})
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
        const res = await fetchGas({path: 'certifications', timestamp: ts, signature: ''})
        expect(res.status).toBe(401)
        expect(res.body.ok).toBe(false)
        expect(res.body.data).toBeUndefined()
    })

    it('シナリオ: 改ざんされた署名ではデータ取得不可', async () => {
        const ts = now()
        const validSig = sign('certifications', ts)
        const tamperedSig = validSig.slice(0, -1) + (validSig.endsWith('a') ? 'b' : 'a')
        const res = await fetchGas({path: 'certifications', timestamp: ts, signature: tamperedSig})
        expect(res.status).toBe(401)
        expect(res.body.ok).toBe(false)
    })

    it('シナリオ: 期限切れトークンではデータ取得不可', async () => {
        const ts = String(Math.floor(Date.now() / 1000) - 400)
        const res = await fetchGas({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        expect(res.status).toBe(401)
        expect(res.body.ok).toBe(false)
    })

    it('シナリオ: 存在しないリソースはデータ取得不可（400）', async () => {
        const ts = now()
        const res = await fetchGas({
            path: 'personal_info',
            timestamp: ts,
            signature: sign('personal_info', ts)
        })
        expect(res.status).toBe(400)
        expect(res.body.ok).toBe(false)
        expect(res.body.data).toBeUndefined()
    })
})
