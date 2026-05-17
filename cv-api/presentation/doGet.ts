import {verifySignature} from '../domain/auth/AuthService'
import {ALLOWED_PATHS, buildCvData, isAllowedPath} from '../domain/cv/CvRepository'
import type {SheetRow} from '../infrastructure/spreadsheet/SpreadsheetClient'

/**
 * Google Apps Script の doGet ハンドラに渡されるイベントオブジェクト。
 */
export interface DoGetEvent {
    /** クエリパラメータのマップ */
    parameter: {
        /** リクエストするデータパス（例: `skills`, `projects`） */
        path?: string
        /** Unix エポック秒のタイムスタンプ文字列 */
        timestamp?: string
        /** HMAC-SHA256 署名の16進数文字列 */
        signature?: string
    }
}

/**
 * 正常レスポンスのペイロード。
 */
interface SuccessPayload {
    ok: true
    /** リクエストされたパス */
    path: string
    /** 取得した CV データ行 */
    data: SheetRow[]
}

/**
 * エラーレスポンスのペイロード。
 */
interface ErrorPayload {
    ok: false
    /** エラーメッセージ */
    error: string
    /** HTTP ステータスコードに相当するエラーコード */
    code: number
}

/**
 * GET リクエストを処理してCV データを返すプレゼンテーション層のハンドラ。
 * パスの検証、署名認証、データ取得・整形を順に実行する。
 *
 * @param e - GET イベントオブジェクト
 * @param computeHmac - HMAC-SHA256 署名を計算する関数（依存性注入）
 * @param fetchRows - スプレッドシートから行データを取得する関数（依存性注入）
 * @returns JSON 形式の成功またはエラーレスポンス
 */
export function handleDoGet(
    e: DoGetEvent,
    computeHmac: (message: string) => string,
    fetchRows: (path: string) => unknown[][]
): GoogleAppsScript.Content.TextOutput {
    try {
        const rawPath = (e.parameter.path ?? '').toLowerCase()
        const timestamp = e.parameter.timestamp ?? ''
        const signature = e.parameter.signature ?? ''

        if (!isAllowedPath(rawPath)) {
            return errorResponse(400, `Invalid path. Use: ${ALLOWED_PATHS.join(', ')}`)
        }

        const auth = verifySignature({timestamp, path: rawPath, signature}, computeHmac)
        if (!auth.ok) return errorResponse(401, auth.reason)

        const cvData = buildCvData(rawPath, fetchRows(rawPath))
        return jsonResponse({ok: true, path: rawPath, data: cvData.rows})
    } catch (err) {
        return errorResponse(500, err instanceof Error ? err.message : String(err))
    }
}

/**
 * 成功ペイロードを JSON テキスト出力に変換する。
 *
 * @param payload - 送信する成功レスポンスオブジェクト
 * @returns JSON MimeType が設定された TextOutput
 */
function jsonResponse(payload: SuccessPayload): GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
        ContentService.MimeType.JSON
    )
}

/**
 * エラーコードとメッセージから JSON エラーレスポンスを生成する。
 *
 * @param code - HTTP ステータスコードに相当するエラーコード
 * @param message - クライアントに返すエラーメッセージ
 * @returns JSON MimeType が設定された TextOutput
 */
function errorResponse(code: number, message: string): GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput(
        JSON.stringify({ok: false, error: message, code} satisfies ErrorPayload)
    ).setMimeType(ContentService.MimeType.JSON)
}
