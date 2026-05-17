import type {AllowedPath} from '../hmac/HmacSigner'

/**
 * スプレッドシート1行分をキーバリューマップとして表す型。
 * キーはヘッダー名または構造化パーサーが定義するフィールド名。
 */
export interface SheetRow {
    [key: string]: unknown
}

/**
 * スキルシートの行レイアウト（0始まり）
 * - row 7-13: 社歴データ（col2=期間, col3=社名, col6=雇用形態, col7=役職）
 * - row 7-12: 資格データ（col9=取得年月, col10=資格名）
 * - row 21-27: スキルマップ（col1=カテゴリ, col2=A, col5=B, col8=C, col11=D）
 * - row 33,35,37...: プロジェクト本体行、次行(col2)が終了時期
 */

/**
 * 行配列の指定列から文字列値を安全に取得する。
 * `null`・空値・非プリミティブ型は空文字列を返す。
 * 改行はスペースに置換し、前後の空白を除去する。
 *
 * @param row - スプレッドシートの1行データ
 * @param col - 取得する列インデックス（0始まり）
 * @returns 正規化済みの文字列。値が無効な場合は空文字列
 */
function cell(row: unknown[], col: number): string {
    const v = row[col]
    if (v == null || v === '') return ''
    if (typeof v !== 'string' && typeof v !== 'number' && typeof v !== 'boolean') return ''
    return String(v).replace(/\n/g, ' ').trim()
}

/**
 * 社歴行（row 7-13）を `work_experience` 形式にパースする。
 * 期間フォーマット: "2023年9月\n〜2024年3月" または "2023年9月\n〜現在"
 *
 * @param rows - スプレッドシートの全行データ
 * @returns 社歴エントリの配列
 */
function parseWorkExperience(rows: unknown[][]): SheetRow[] {
    const result: SheetRow[] = []
    for (let i = 7; i <= 13; i++) {
        const row = rows[i]
        if (!row) continue
        const raw2 = row[2]
        const periodRaw = (typeof raw2 === 'string' ? raw2 : '').trim()
        if (!periodRaw) continue
        const [startRaw, endRaw] = periodRaw.split(/〜/)
        const start = (startRaw ?? '').trim()
        const endStr = (endRaw ?? '').trim()
        result.push({
            company_ja: cell(row, 3),
            company_en: '',
            start,
            end: endStr === '現在' ? null : endStr,
            role_ja: cell(row, 7),
            role_en: '',
            employment_type: cell(row, 6),
            description_ja: '',
            description_en: ''
        })
    }
    return result
}

/**
 * 資格列（row 7-12, col9-10）を `certifications` 形式にパースする。
 * 日付フォーマット: "2019年10月"
 *
 * @param rows - スプレッドシートの全行データ
 * @returns 資格エントリの配列
 */
function parseCertifications(rows: unknown[][]): SheetRow[] {
    const result: SheetRow[] = []
    for (let i = 7; i <= 12; i++) {
        const row = rows[i]
        if (!row) continue
        const dateRaw = cell(row, 9)
        const name = cell(row, 10)
        if (!dateRaw || !name) continue
        const m = /(\d{4})年(\d{1,2})月/.exec(dateRaw)
        result.push({
            year: m ? Number(m[1]) : null,
            month: m ? Number(m[2]) : null,
            name_ja: name,
            name_en: ''
        })
    }
    return result
}

/**
 * 1セルのスキルテキスト（例: "Go(Golang)(4)Python(4)..."）を個別エントリに分解する。
 * パターンにマッチしない場合は文字境界で分割してフォールバックする。
 *
 * @param category - スキルカテゴリ名（例: `言語`）
 * @param grade - 習熟度グレード（`A` | `B` | `C` | `D`）
 * @param text - セルに格納された連結スキルテキスト
 * @returns 個別スキルエントリの配列
 */
function parseSkillEntries(category: string, grade: string, text: string): SheetRow[] {
    const pattern = /([^(]+)\(([^)]+)\)\((\d+)\)/g
    const result: SheetRow[] = []
    let match: RegExpExecArray | null
    pattern.lastIndex = 0
    while ((match = pattern.exec(text)) !== null) {
        result.push({
            category,
            name: `${match[1].trim()}(${match[2].trim()})`,
            years: Number(match[3]),
            grade
        })
    }
    if (result.length === 0) {
        const fallbacks = text
            .split(/(?=[A-Za-z぀-ヿ一-鿿])/)
            .map(s => s.trim())
            .filter(Boolean)
        for (const name of fallbacks) {
            result.push({category, name, years: null, grade})
        }
    }
    return result
}

/**
 * スキルマップ行（row 21-27）を `skills` 形式にパースする。
 * 各行はカテゴリ単位で A/B/C/D 評価列に複数スキルが連結されている。
 *
 * @param rows - スプレッドシートの全行データ
 * @returns スキルエントリの配列
 */
function parseSkills(rows: unknown[][]): SheetRow[] {
    const result: SheetRow[] = []
    const grades: [string, number][] = [
        ['A', 2],
        ['B', 5],
        ['C', 8],
        ['D', 11]
    ]
    for (const i of [21, 22, 23, 24, 25, 26, 27]) {
        const row = rows[i]
        if (!row) continue
        const category = cell(row, 1)
        if (!category) continue
        for (const [grade, col] of grades) {
            const text = cell(row, col)
            if (!text) continue
            result.push(...parseSkillEntries(category, grade, text))
        }
    }
    return result
}

/**
 * プロジェクト行（row 33以降、2行1組）を `projects` 形式にパースする。
 * 本体行の次行 col2 が終了時期。"現在" の場合は null。
 *
 * @param rows - スプレッドシートの全行データ
 * @returns プロジェクトエントリの配列
 */
function parseProjects(rows: unknown[][]): SheetRow[] {
    const result: SheetRow[] = []
    for (let i = 33; i < rows.length - 1; i += 2) {
        const row = rows[i]
        const nextRow = rows[i + 1]
        if (!row) continue
        const no = cell(row, 1)
        if (!no || !/^\d+$/.test(no)) continue
        const endRaw = nextRow ? cell(nextRow, 2) : ''
        result.push({
            no: Number(no),
            start: cell(row, 2),
            end: endRaw === '現在' ? null : endRaw,
            industry: cell(row, 3),
            role_ja: cell(row, 4),
            role_en: '',
            scale: cell(row, 5),
            title_ja: cell(row, 6),
            title_en: '',
            description_ja: cell(row, 7),
            description_en: '',
            tech_stack: cell(row, 11)
        })
    }
    return result
}

/**
 * パスに応じてスキルシートの raw 行データを構造化された `SheetRow[]` に変換する。
 *
 * @param path - データ種別を示すパス（`AllowedPath` のいずれか）
 * @param rows - スプレッドシートの全行データ
 * @returns パスに対応したパーサーで変換されたエントリ配列
 */
export function parseByPath(path: AllowedPath, rows: unknown[][]): SheetRow[] {
    switch (path) {
        case 'work_experience':
            return parseWorkExperience(rows)
        case 'certifications':
            return parseCertifications(rows)
        case 'skills':
            return parseSkills(rows)
        case 'projects':
            return parseProjects(rows)
    }
}

/**
 * 汎用的なヘッダー行ベースのパーサー。
 * 1行目をヘッダーとして扱い、残行をオブジェクト配列に変換する。
 * 全セルが空の行はスキップする。空セルは `null` に変換される。
 *
 * @param rows - 先頭行がヘッダーの2次元配列
 * @returns ヘッダーをキーとするオブジェクトの配列。行数が1以下の場合は空配列
 */
export function parseRows(rows: unknown[][]): SheetRow[] {
    if (rows.length < 2) return []
    const headers = rows[0].map(h => {
        if (typeof h === 'string') return h.trim()
        if (typeof h === 'number' || typeof h === 'boolean') return String(h).trim()
        return ''
    })
    return rows
        .slice(1)
        .filter(row => row.some(cell => cell !== ''))
        .map(row => {
            const obj: SheetRow = {}
            headers.forEach((h, i) => {
                obj[h] = row[i] === '' ? null : row[i]
            })
            return obj
        })
}
