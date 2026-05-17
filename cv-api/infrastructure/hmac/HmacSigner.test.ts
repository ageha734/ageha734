import {describe, expect, it} from 'vitest'
import {TIMESTAMP_TOLERANCE_SEC, buildMessage, safeEquals} from './HmacSigner'

describe('safeEquals', () => {
    it('同一文字列は true', () => {
        expect(safeEquals('abc', 'abc')).toBe(true)
    })
    it('異なる文字列は false', () => {
        expect(safeEquals('abc', 'abd')).toBe(false)
    })
    it('長さが異なる場合は false', () => {
        expect(safeEquals('abc', 'ab')).toBe(false)
    })
    it('空文字同士は true', () => {
        expect(safeEquals('', '')).toBe(true)
    })
    it('マルチバイト文字を正しく比較する', () => {
        expect(safeEquals('あいう', 'あいう')).toBe(true)
        expect(safeEquals('あいう', 'あいえ')).toBe(false)
    })
})

describe('buildMessage', () => {
    it('"timestamp:path" 形式で組み立てる', () => {
        expect(buildMessage('1234567890', 'certifications')).toBe('1234567890:certifications')
    })
})

describe('TIMESTAMP_TOLERANCE_SEC', () => {
    it('300秒（5分）である', () => {
        expect(TIMESTAMP_TOLERANCE_SEC).toBe(300)
    })
})
