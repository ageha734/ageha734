import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { safeEquals, verifyTimestamp, buildMessage, TIMESTAMP_TOLERANCE_SEC } from '../lib/hmac'

describe('safeEquals', () => {
    it('returns true for identical strings', () => {
        expect(safeEquals('abc123', 'abc123')).toBe(true)
    })
    it('returns false for different strings of same length', () => {
        expect(safeEquals('abc123', 'abc124')).toBe(false)
    })
    it('returns false for different length strings', () => {
        expect(safeEquals('abc', 'abcd')).toBe(false)
    })
    it('handles empty strings', () => {
        expect(safeEquals('', '')).toBe(true)
    })
    it('handles multibyte characters', () => {
        expect(safeEquals('あいう', 'あいう')).toBe(true)
        expect(safeEquals('あいう', 'あいえ')).toBe(false)
    })
})

describe('verifyTimestamp', () => {
    const now = 1700000000
    beforeEach(() => {
        vi.spyOn(Date, 'now').mockReturnValue(now * 1000)
    })
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns null for valid timestamp', () => {
        expect(verifyTimestamp(String(now))).toBeNull()
    })
    it('returns null for timestamp within tolerance', () => {
        expect(verifyTimestamp(String(now + TIMESTAMP_TOLERANCE_SEC - 1))).toBeNull()
        expect(verifyTimestamp(String(now - TIMESTAMP_TOLERANCE_SEC + 1))).toBeNull()
    })
    it('returns error for expired timestamp', () => {
        expect(verifyTimestamp(String(now - TIMESTAMP_TOLERANCE_SEC - 1))).not.toBeNull()
    })
    it('returns error for future timestamp beyond tolerance', () => {
        expect(verifyTimestamp(String(now + TIMESTAMP_TOLERANCE_SEC + 1))).not.toBeNull()
    })
    it('returns error for empty string', () => {
        expect(verifyTimestamp('')).not.toBeNull()
    })
    it('returns error for non-numeric string', () => {
        expect(verifyTimestamp('not-a-number')).not.toBeNull()
    })
})

describe('buildMessage', () => {
    it('formats timestamp:path correctly', () => {
        expect(buildMessage('1700000000', 'skills')).toBe('1700000000:skills')
    })
})
