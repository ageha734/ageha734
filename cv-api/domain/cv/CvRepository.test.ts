import {describe, expect, it} from 'vitest'
import {ALLOWED_PATHS, buildCvData, isAllowedPath} from './CvRepository'

describe('isAllowedPath', () => {
    it('許可されたパスは true を返す', () => {
        for (const path of ALLOWED_PATHS) {
            expect(isAllowedPath(path)).toBe(true)
        }
    })
    it('許可されていないパスは false を返す', () => {
        expect(isAllowedPath('personal_info')).toBe(false)
        expect(isAllowedPath('')).toBe(false)
        expect(isAllowedPath('SKILLS')).toBe(false)
    })
})

describe('buildCvData', () => {
    it('rawRows を parseRows して CvData を返す', () => {
        const raw = [
            ['name', 'value'],
            ['Alice', 1]
        ]
        const result = buildCvData('skills', raw)
        expect(result.path).toBe('skills')
        expect(result.rows).toHaveLength(1)
        expect(result.rows[0]).toEqual({name: 'Alice', value: 1})
    })

    it('空行はフィルタリングされる', () => {
        const raw = [
            ['name', 'value'],
            ['', ''],
            ['Alice', 1]
        ]
        const result = buildCvData('skills', raw)
        expect(result.rows).toHaveLength(1)
    })
})
