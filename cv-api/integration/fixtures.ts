/**
 * 統合テスト用フィクスチャ。
 * スキルシートのrow-indexベースレイアウトに合わせた2次元配列。
 * - work_experience / certifications: row 7-13
 * - skills: row 21-27 (col1=カテゴリ, col2=A, col5=B, col8=C, col11=D)
 * - projects: row 33以降、2行1組
 */

function makeRow(len: number, values: Record<number, unknown> = {}): unknown[] {
    const row = Array<unknown>(len).fill('')
    for (const [i, v] of Object.entries(values)) {
        row[Number(i)] = v
    }
    return row
}

// row 0-6: ヘッダー行（空）。projects は row 33-34 の2行1組なので length=35 必要
const emptyRows = Array.from({length: 35}, () => Array<unknown>(12).fill(''))

// work_experience & certifications: row 7-8
// row7: col2=期間, col3=社名, col6=雇用形態, col7=役職, col9=取得年月, col10=資格名
emptyRows[7] = makeRow(12, {
    2: '2022年4月\n〜2024年3月',
    3: '株式会社Example',
    6: '正社員',
    7: 'バックエンドエンジニア',
    9: '2023年11月',
    10: 'AWS認定ソリューションアーキテクト'
})
emptyRows[8] = makeRow(12, {
    2: '2024年4月\n〜現在',
    3: '現職株式会社',
    6: '正社員',
    7: 'クラウドエンジニア'
})

// skills: row 21 (col1=カテゴリ, col2=A グレードスキル)
emptyRows[21] = makeRow(12, {
    1: '言語',
    2: 'Go(Golang)(4)TypeScript(3)'
})

// projects: row 33-34 (2行1組)
emptyRows[33] = makeRow(12, {
    1: '1',
    2: '2023年9月',
    3: 'IT・通信',
    4: 'ソフトウェアエンジニア',
    5: '2',
    6: 'テストプロジェクト',
    7: '業務内容テスト',
    11: 'Go / AWS'
})
emptyRows[34] = makeRow(12, {2: '2023年11月'})

const sharedRows = emptyRows

export const FIXTURES: Record<string, unknown[][]> = {
    certifications: sharedRows,
    work_experience: sharedRows,
    skills: sharedRows,
    projects: sharedRows
}
