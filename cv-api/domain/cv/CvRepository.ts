import {ALLOWED_PATHS, type AllowedPath} from '../../infrastructure/hmac/HmacSigner'
import {type SheetRow, parseRows} from '../../infrastructure/spreadsheet/SpreadsheetClient'

export type {AllowedPath}
export {ALLOWED_PATHS}

export interface CvData {
    path: AllowedPath
    rows: SheetRow[]
}

export function isAllowedPath(path: string): path is AllowedPath {
    return (ALLOWED_PATHS as readonly string[]).includes(path)
}

export function buildCvData(path: AllowedPath, rawRows: unknown[][]): CvData {
    return {path, rows: parseRows(rawRows)}
}
