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
    it('certifications: 資格データを正しくパースする', () => {
        // row 0-6: ヘッダー行（空）, row 7: 資格データ
        const raw: unknown[][] = Array.from({length: 13}, () => Array(13).fill(''))
        raw[7] = [
            '',
            '',
            '2023年9月\n〜2024年3月',
            '10pct.株式会社',
            '',
            '',
            '業務委託',
            'クラウドエンジニア',
            '',
            '2019年10月',
            '検定1級',
            '',
            '-'
        ]
        const result = buildCvData('certifications', raw)
        expect(result.path).toBe('certifications')
        expect(result.rows).toHaveLength(1)
        expect(result.rows[0]).toMatchObject({year: 2019, month: 10, name_ja: '検定1級'})
    })

    it('work_experience: 社歴データを正しくパースする', () => {
        const raw: unknown[][] = Array.from({length: 14}, () => Array(8).fill(''))
        raw[7] = [
            '',
            '',
            '2023年9月\n〜2024年3月',
            '10pct.株式会社',
            '',
            '',
            '業務委託',
            'クラウドエンジニア'
        ]
        const result = buildCvData('work_experience', raw)
        expect(result.path).toBe('work_experience')
        expect(result.rows).toHaveLength(1)
        expect(result.rows[0]).toMatchObject({
            company_ja: '10pct.株式会社',
            start: '2023年9月',
            end: '2024年3月'
        })
    })

    it('work_experience: 在職中は end が null になる', () => {
        const raw: unknown[][] = Array.from({length: 14}, () => Array(8).fill(''))
        raw[7] = [
            '',
            '',
            '2025年4月\n〜現在',
            '合同会社DMM.com',
            '',
            '',
            '正社員',
            'サーバーサイドエンジニア'
        ]
        const result = buildCvData('work_experience', raw)
        expect(result.rows[0]).toMatchObject({end: null})
    })

    it('projects: プロジェクトデータを正しくパースする', () => {
        const raw: unknown[][] = Array.from({length: 36}, () => Array(12).fill(''))
        raw[33] = [
            '',
            '1',
            '2023年9月',
            'IT・通信',
            'ソフトウェアエンジニア',
            '2',
            'テストプロジェクト',
            '業務内容',
            '',
            '',
            '',
            'Go / AWS'
        ]
        raw[34] = ['', '', '2023年11月']
        const result = buildCvData('projects', raw)
        expect(result.rows).toHaveLength(1)
        expect(result.rows[0]).toMatchObject({
            no: 1,
            title_ja: 'テストプロジェクト',
            tech_stack: 'Go / AWS',
            end: '2023年11月'
        })
    })
})
