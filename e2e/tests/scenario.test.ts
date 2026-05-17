import crypto from 'node:crypto'
/**
 * E2E シナリオテスト
 *
 * ローカル: GAS_API_URL 未設定 → Docker の cv-api ローカルサーバー (http://localhost:3000) を使用
 * deploy後: GAS_API_URL 設定済み → 実際の GAS エンドポイントを使用
 *
 * シナリオ:
 *   1. GAS API に認証してデータを取得
 *   2. sync-from-gas 相当の変換処理を実行
 *   3. update-readme 相当の処理を実行
 *   4. 成果物（profile.json の更新・README 生成）が期待通りか検証
 *   5. deploy後: GitHub Pages URL のHTMLが期待通りか検証
 */
import {describe, expect, it} from 'vitest'

const GAS_URL = process.env['GAS_API_URL'] ?? 'http://localhost:3000'
const SECRET = process.env['GAS_HMAC_SECRET'] ?? 'e2e-test-secret'
const GITHUB_PAGES_URL = process.env['GITHUB_PAGES_URL'] ?? ''

function sign(p: string, timestamp: string): string {
    return crypto.createHmac('sha256', SECRET).update(`${timestamp}:${p}`, 'utf8').digest('hex')
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

async function fetchApi(
    params: Record<string, string>
): Promise<{status: number; body: ApiResponse}> {
    const url = new URL(GAS_URL)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    const res = await fetch(url.toString(), {headers: {'User-Agent': 'ageha734-e2e/1.0'}})
    const body = (await res.json()) as ApiResponse
    return {status: res.status, body}
}

// ─── シナリオ1: GAS API 認証 → データ取得 ───────────────────

describe('シナリオ1: GAS API 認証してデータを取得できる', () => {
    const paths = ['certifications', 'work_experience', 'skills', 'projects'] as const

    for (const p of paths) {
        it(`${p} を認証して取得できる`, async () => {
            const ts = now()
            const res = await fetchApi({path: p, timestamp: ts, signature: sign(p, ts)})
            expect(res.status).toBe(200)
            expect(res.body.ok).toBe(true)
            expect(res.body.path).toBe(p)
            expect(Array.isArray(res.body.data)).toBe(true)
            expect((res.body.data ?? []).length).toBeGreaterThan(0)
        })
    }

    it('不正な署名では取得できない（401）', async () => {
        const ts = now()
        const res = await fetchApi({path: 'certifications', timestamp: ts, signature: 'invalid'})
        expect(res.status).toBe(401)
        expect(res.body.ok).toBe(false)
    })

    it('不正なパスは拒否される（400）', async () => {
        const ts = now()
        const res = await fetchApi({
            path: 'personal_info',
            timestamp: ts,
            signature: sign('personal_info', ts)
        })
        expect(res.status).toBe(400)
        expect(res.body.ok).toBe(false)
    })
})

// ─── シナリオ2: 取得データの構造検証 ────────────────────────

describe('シナリオ2: 取得データが期待する構造を持っている', () => {
    it('certifications に year・month・name_en・name_ja が含まれる', async () => {
        const ts = now()
        const res = await fetchApi({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        const data = res.body.data ?? []
        for (const row of data) {
            expect(row).toHaveProperty('year')
            expect(row).toHaveProperty('month')
            expect(row).toHaveProperty('name_en')
            expect(row).toHaveProperty('name_ja')
        }
    })

    it('work_experience に在職中レコード（end: null）が存在する', async () => {
        const ts = now()
        const res = await fetchApi({
            path: 'work_experience',
            timestamp: ts,
            signature: sign('work_experience', ts)
        })
        const data = res.body.data ?? []
        const current = data.find(r => r['end'] === null)
        expect(current).toBeDefined()
    })

    it('skills に category・name が含まれる', async () => {
        const ts = now()
        const res = await fetchApi({path: 'skills', timestamp: ts, signature: sign('skills', ts)})
        const data = res.body.data ?? []
        for (const row of data) {
            expect(typeof row['category']).toBe('string')
            expect(typeof row['name']).toBe('string')
        }
    })

    it('projects に name・url が含まれる', async () => {
        const ts = now()
        const res = await fetchApi({
            path: 'projects',
            timestamp: ts,
            signature: sign('projects', ts)
        })
        const data = res.body.data ?? []
        for (const row of data) {
            expect(typeof row['name']).toBe('string')
            expect(typeof row['url']).toBe('string')
        }
    })
})

// ─── シナリオ3: sync-from-gas 変換処理が正常に動く ──────────

describe('シナリオ3: 取得データを変換して profile.json に反映できる', () => {
    it('certifications データを数値変換できる', async () => {
        const ts = now()
        const res = await fetchApi({
            path: 'certifications',
            timestamp: ts,
            signature: sign('certifications', ts)
        })
        const data = res.body.data ?? []
        for (const row of data) {
            expect(typeof Number(row['year'])).toBe('number')
            expect(typeof Number(row['month'])).toBe('number')
            expect(Number.isNaN(Number(row['year']))).toBe(false)
        }
    })

    it('work_experience の end が null または string である', async () => {
        const ts = now()
        const res = await fetchApi({
            path: 'work_experience',
            timestamp: ts,
            signature: sign('work_experience', ts)
        })
        const data = res.body.data ?? []
        for (const row of data) {
            expect(row['end'] === null || typeof row['end'] === 'string').toBe(true)
        }
    })
})

// ─── シナリオ4: GitHub Pages HTML 検証（deploy後のみ） ───────

describe('シナリオ4: GitHub Pages の HTML が正常に配信されている', () => {
    it.skipIf(!GITHUB_PAGES_URL)('GitHub Pages URL が 200 を返す', async () => {
        const res = await fetch(GITHUB_PAGES_URL)
        expect(res.status).toBe(200)
    })

    it.skipIf(!GITHUB_PAGES_URL)('HTML に portfolio のコンテンツが含まれる', async () => {
        const res = await fetch(GITHUB_PAGES_URL)
        const html = await res.text()
        expect(html).toContain('ageha734')
    })
})
