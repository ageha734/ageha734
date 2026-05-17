import crypto from 'node:crypto'
import {expect, test as setup} from '@playwright/test'

const GAS_URL = process.env['GAS_API_URL'] ?? 'http://localhost:3000'
const HMAC_KEY = process.env['GAS_HMAC_SECRET'] ?? 'e2e-test-secret'
const SYNC_URL = process.env['SYNC_SERVER_URL'] ?? 'http://localhost:4000'

function sign(p: string, timestamp: string): string {
    return crypto.createHmac('sha256', HMAC_KEY).update(`${timestamp}:${p}`, 'utf8').digest('hex')
}

function now(): string {
    return String(Math.floor(Date.now() / 1000))
}

setup('GAS API の疎通確認', async () => {
    const ts = now()
    const res = await fetch(
        `${GAS_URL}?path=certifications&timestamp=${ts}&signature=${sign('certifications', ts)}`,
        {headers: {'User-Agent': 'ageha734-e2e/1.0'}}
    )
    expect(res.status).toBe(200)
})

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
