import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {verifySignature, verifyTimestamp} from './AuthService'

const FIXED_NOW = 1700000000
const SECRET = 'test-secret'

function makeHmac(secret: string) {
    return (message: string) => {
        const crypto = require('node:crypto')
        return crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex')
    }
}

beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW * 1000)
})
afterEach(() => {
    vi.restoreAllMocks()
})

describe('verifyTimestamp', () => {
    it('有効なタイムスタンプは null を返す', () => {
        expect(verifyTimestamp(String(FIXED_NOW))).toBeNull()
    })
    it('空文字は "Missing timestamp" を返す', () => {
        expect(verifyTimestamp('')).toBe('Missing timestamp')
    })
    it('許容範囲内の過去タイムスタンプは null を返す', () => {
        expect(verifyTimestamp(String(FIXED_NOW - 299))).toBeNull()
    })
    it('期限切れタイムスタンプ（6分前）はエラーを返す', () => {
        expect(verifyTimestamp(String(FIXED_NOW - 361))).not.toBeNull()
    })
    it('未来タイムスタンプ（6分後）はエラーを返す', () => {
        expect(verifyTimestamp(String(FIXED_NOW + 361))).not.toBeNull()
    })
    it('数値以外の文字列はエラーを返す', () => {
        expect(verifyTimestamp('not-a-number')).not.toBeNull()
    })
})

describe('verifySignature', () => {
    const hmac = makeHmac(SECRET)
    const ts = String(FIXED_NOW)

    it('正しい署名は ok: true を返す', () => {
        const sig = hmac(`${ts}:certifications`)
        const result = verifySignature(
            {timestamp: ts, path: 'certifications', signature: sig},
            hmac
        )
        expect(result.ok).toBe(true)
    })
    it('署名なしは ok: false を返す', () => {
        const result = verifySignature({timestamp: ts, path: 'certifications', signature: ''}, hmac)
        expect(result.ok).toBe(false)
    })
    it('不正な署名は ok: false を返す', () => {
        const result = verifySignature(
            {timestamp: ts, path: 'certifications', signature: 'a'.repeat(64)},
            hmac
        )
        expect(result.ok).toBe(false)
    })
    it('期限切れタイムスタンプは ok: false を返す', () => {
        const expiredTs = String(FIXED_NOW - 400)
        const sig = hmac(`${expiredTs}:certifications`)
        const result = verifySignature(
            {timestamp: expiredTs, path: 'certifications', signature: sig},
            hmac
        )
        expect(result.ok).toBe(false)
    })
    it('他パス向けの署名の使い回し（リプレイ攻撃）は ok: false を返す', () => {
        const sig = hmac(`${ts}:skills`)
        const result = verifySignature(
            {timestamp: ts, path: 'certifications', signature: sig},
            hmac
        )
        expect(result.ok).toBe(false)
    })
})
