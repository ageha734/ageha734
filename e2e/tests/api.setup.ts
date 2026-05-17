import crypto from 'node:crypto'
import {expect, test as setup} from '@playwright/test'

const GAS_URL = process.env['GAS_API_URL'] ?? 'http://localhost:3000'
const HMAC_KEY = process.env['GAS_HMAC_SECRET'] ?? 'e2e-test-secret'
const SYNC_URL = process.env['SYNC_SERVER_URL'] ?? 'http://localhost:14000'

function sign(p: string, timestamp: string): string {
    return crypto.createHmac('sha256', HMAC_KEY).update(`${timestamp}:${p}`, 'utf8').digest('hex')
}

function now(): string {
    return String(Math.floor(Date.now() / 1000))
}

function buildSignedUrl(p: string): string {
    const ts = now()
    return `${GAS_URL}?path=${p}&timestamp=${ts}&signature=${sign(p, ts)}`
}

// ─── シナリオ1: GAS API 認証 → データ取得 ───────────────────

setup('GAS API の疎通確認', async () => {
    const res = await fetch(buildSignedUrl('certifications'), {
        headers: {'User-Agent': 'ageha734-e2e/1.0'}
    })
    expect(res.status).toBe(200)
})

setup('GAS API: 全リソースを認証して取得できる', async () => {
    const paths = ['certifications', 'work_experience', 'skills', 'projects'] as const
    for (const p of paths) {
        const res = await fetch(buildSignedUrl(p), {headers: {'User-Agent': 'ageha734-e2e/1.0'}})
        expect(res.status, `${p} should return 200`).toBe(200)
        const body = (await res.json()) as {ok: boolean; data: unknown[]}
        expect(body.ok, `${p} ok should be true`).toBe(true)
        expect(body.data.length, `${p} should have data`).toBeGreaterThan(0)
    }
})

setup('GAS API: 不正な署名は 401 を返す', async () => {
    const ts = now()
    const url = `${GAS_URL}?path=certifications&timestamp=${ts}&signature=invalid`
    const res = await fetch(url, {headers: {'User-Agent': 'ageha734-e2e/1.0'}})
    expect(res.status).toBe(401)
})

setup('GAS API: 不正なパスは 400 を返す', async () => {
    const res = await fetch(buildSignedUrl('personal_info'), {
        headers: {'User-Agent': 'ageha734-e2e/1.0'}
    })
    expect(res.status).toBe(400)
})

// ─── シナリオ2: sync-from-gas 実行 ──────────────────────────

setup('sync-from-gas を実行して profile.json を更新する', async () => {
    const res = await fetch(`${SYNC_URL}/run/sync-from-gas`, {method: 'POST'})
    expect(res.status).toBe(202)

    await expect
        .poll(
            async () => {
                const r = await fetch(`${SYNC_URL}/logs/sync-from-gas`)
                return (await r.json()) as {status: string}
            },
            {timeout: 60_000, intervals: [2000]}
        )
        .toMatchObject({status: 'success'})
})

// ─── シナリオ3: データ構造検証 ───────────────────────────────

setup('certifications の変換データが正しい構造を持つ', async () => {
    const res = await fetch(buildSignedUrl('certifications'), {
        headers: {'User-Agent': 'ageha734-e2e/1.0'}
    })
    const body = (await res.json()) as {data: Record<string, unknown>[]}
    for (const row of body.data) {
        expect(Number.isNaN(Number(row['year']))).toBe(false)
        expect(Number.isNaN(Number(row['month']))).toBe(false)
    }
})

setup('work_experience に在職中レコード（end: null）が存在する', async () => {
    const res = await fetch(buildSignedUrl('work_experience'), {
        headers: {'User-Agent': 'ageha734-e2e/1.0'}
    })
    const body = (await res.json()) as {data: Record<string, unknown>[]}
    const current = body.data.find(r => r['end'] === null)
    expect(current).toBeDefined()
})

// ─── generate-portfolio 実行 ─────────────────────────────────

setup('generate-portfolio を実行して docs/index.html を生成する', async () => {
    const res = await fetch(`${SYNC_URL}/run/generate-portfolio`, {method: 'POST'})
    expect(res.status).toBe(202)

    await expect
        .poll(
            async () => {
                const r = await fetch(`${SYNC_URL}/logs/generate-portfolio`)
                return (await r.json()) as {status: string}
            },
            {timeout: 60_000, intervals: [2000]}
        )
        .toMatchObject({status: 'success'})
})

setup('全ステップの STATUS が success であることを確認する', async () => {
    const res = await fetch(`${SYNC_URL}/status`)
    const body = (await res.json()) as {steps: Record<string, {status: string}>}
    for (const [name, step] of Object.entries(body.steps)) {
        expect(step.status, `step "${name}" failed`).toBe('success')
    }
})
