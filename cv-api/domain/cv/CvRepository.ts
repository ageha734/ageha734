import {ALLOWED_PATHS, type AllowedPath} from '../../infrastructure/hmac/HmacSigner'
import {type SheetRow, parseByPath} from '../../infrastructure/spreadsheet/SpreadsheetClient'

export type {AllowedPath}
export {ALLOWED_PATHS}

/**
 * CV データの取得結果を表すドメインオブジェクト。
 */
export interface CvData {
    /** データ種別を示すパス */
    path: AllowedPath
    /** パース済みの行データ */
    rows: SheetRow[]
}

/**
 * 任意の文字列が許可パス（`AllowedPath`）であるかを型ガードで判定する。
 *
 * @param path - 判定する文字列
 * @returns `path` が `AllowedPath` のいずれかに一致する場合は `true`
 */
export function isAllowedPath(path: string): path is AllowedPath {
    return (ALLOWED_PATHS as readonly string[]).includes(path)
}

/**
 * パスと raw 行データから `CvData` ドメインオブジェクトを生成する。
 *
 * @param path - データ種別を示すパス（`AllowedPath`）
 * @param rawRows - スプレッドシートから取得した未加工の2次元配列
 * @returns パース済み行データを含む `CvData` オブジェクト
 */
export function buildCvData(path: AllowedPath, rawRows: unknown[][]): CvData {
    return {path, rows: parseByPath(path, rawRows)}
}
