import {execSync} from 'node:child_process'
import crypto from 'node:crypto'
import path from 'node:path'
import {expect, test as setup} from '@playwright/test'

/**
 * E2E セットアップ
 * 1. GAS API からデータを取得して profile.json を更新
 * 2. generate-portfolio.ts を実行して docs/index.html を再生成
 *
 * ローカル: GAS_API_URL 未設定 → http://localhost:3000 (Docker cv-api)
 * deploy後: GAS_API_URL 設定済み → 実際の GAS エンドポイント
 */

const GAS_URL = process.env['GAS_API_URL'] ?? 'http://localhost:3000'
const SECRET = process.env['GAS_HMAC_SECRET'] ?? 'e2e-test-secret'
const ROOT = path.resolve(new URL('../../..', import.meta.url).pathname)

function sign(p: string, timestamp: string): string {
    return crypto.createHmac('sha256', SECRET).update(`${timestamp}:${p}`, 'utf8').digest('hex')
}

function now(): string {
    return String(Math.floor(Date.now() / 1000))
}

setup('GAS API からデータを取得して portfolio を生成する', async () => {
    // GAS API の疎通確認
    const ts = now()
    const res = await fetch(
        `${GAS_URL}?path=certifications&timestamp=${ts}&signature=${sign('certifications', ts)}`,
        {headers: {'User-Agent': 'ageha734-e2e/1.0'}}
    )
    expect(res.status).toBe(200)

    // sync-from-gas → profile.json 更新
    execSync('pnpm tsx scripts/sync-from-gas.ts', {
        cwd: ROOT,
        env: {
            ...process.env,
            GAS_API_URL: GAS_URL,
            GAS_HMAC_SECRET: SECRET
        },
        stdio: 'inherit'
    })

    // generate-portfolio → docs/index.html 再生成
    execSync('pnpm tsx scripts/generate-portfolio.ts', {
        cwd: ROOT,
        stdio: 'inherit'
    })
})
