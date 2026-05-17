import {describe, expect, it} from 'vitest'
import {parseRows} from './SpreadsheetClient'

describe('parseRows', () => {
    it('空配列は空配列を返す', () => {
        expect(parseRows([])).toEqual([])
    })

    it('ヘッダー行のみは空配列を返す', () => {
        expect(parseRows([['name', 'value']])).toEqual([])
    })

    it('ヘッダーと1行のデータを正しくマッピングする', () => {
        const result = parseRows([
            ['name', 'value'],
            ['Alice', 42]
        ])
        expect(result).toEqual([{name: 'Alice', value: 42}])
    })

    it('空文字のセルは null に変換する', () => {
        const result = parseRows([
            ['name', 'end'],
            ['Current', '']
        ])
        expect(result[0]?.['end']).toBeNull()
    })

    it('全セルが空の行はフィルタリングする', () => {
        const result = parseRows([
            ['name', 'value'],
            ['', ''],
            ['Alice', 1]
        ])
        expect(result).toHaveLength(1)
    })

    it('ヘッダーの空白をトリムする', () => {
        const result = parseRows([
            ['  name  ', 'value'],
            ['Alice', 1]
        ])
        expect(result[0]).toHaveProperty('name')
    })

    it('数値・真偽値のヘッダーを文字列に変換する', () => {
        const result = parseRows([
            [1, true],
            ['a', 'b']
        ])
        expect(result[0]).toHaveProperty('1')
        expect(result[0]).toHaveProperty('true')
    })
})
