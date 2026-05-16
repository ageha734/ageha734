import {describe, expect, it} from 'vitest'
import {parseRows} from '../lib/sheet'

describe('parseRows', () => {
    it('returns empty array for empty data', () => {
        expect(parseRows([])).toEqual([])
    })
    it('returns empty array for header-only data', () => {
        expect(parseRows([['name', 'year']])).toEqual([])
    })
    it('maps headers to values correctly', () => {
        const rows = [
            ['name', 'year'],
            ['AWS SAA', 2023]
        ]
        expect(parseRows(rows)).toEqual([{name: 'AWS SAA', year: 2023}])
    })
    it('converts empty cells to null', () => {
        const rows = [
            ['name', 'end'],
            ['AWS SAA', '']
        ]
        expect(parseRows(rows)).toEqual([{name: 'AWS SAA', end: null}])
    })
    it('filters out fully empty rows', () => {
        const rows = [
            ['name', 'year'],
            ['AWS SAA', 2023],
            ['', '']
        ]
        expect(parseRows(rows)).toEqual([{name: 'AWS SAA', year: 2023}])
    })
    it('trims header whitespace', () => {
        const rows = [
            [' name ', ' year '],
            ['AWS SAA', 2023]
        ]
        expect(parseRows(rows)).toEqual([{name: 'AWS SAA', year: 2023}])
    })
    it('handles multiple rows', () => {
        const rows = [
            ['name', 'year'],
            ['AWS SAA', 2023],
            ['GCP ACE', 2024]
        ]
        expect(parseRows(rows)).toHaveLength(2)
    })
})
