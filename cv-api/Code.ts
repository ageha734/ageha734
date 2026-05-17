import {handleDoGet} from './presentation/doGet'
import type {DoGetEvent} from './presentation/doGet'

/**
 * スクリプトプロパティの `HMAC_SECRET` を使って HMAC-SHA256 署名を計算する。
 *
 * @param message - 署名対象のメッセージ文字列
 * @returns 16進数小文字のHMAC-SHA256ダイジェスト文字列
 * @throws `HMAC_SECRET` が未設定の場合
 */
function computeHmac(message: string): string {
    const secret = PropertiesService.getScriptProperties().getProperty('HMAC_SECRET')
    if (!secret) throw new Error('Server misconfiguration: HMAC_SECRET not set')
    const signatureBytes = Utilities.computeHmacSha256Signature(
        message,
        secret,
        Utilities.Charset.UTF_8
    )
    return signatureBytes.map((b: number) => `0${(b & 0xff).toString(16)}`.slice(-2)).join('')
}

/**
 * スクリプトプロパティの `SPREADSHEET_ID` で指定されたスプレッドシートから
 * 「スキルシート」シートの全行データを取得する。
 *
 * @param _path - 現在は使用しないパス（将来の拡張用に保持）
 * @returns シートの全セル値を表す2次元配列
 * @throws `SPREADSHEET_ID` が未設定の場合、またはシートが見つからない場合
 */
function fetchRows(_path: string): unknown[][] {
    const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
    if (!ssId) throw new Error('SPREADSHEET_ID not set')
    const ss = SpreadsheetApp.openById(ssId)
    const sheet = ss.getSheetByName('スキルシート')
    if (!sheet) throw new Error('Sheet not found: スキルシート')
    return sheet.getDataRange().getValues() as unknown[][]
}

/**
 * Google Apps Script の HTTP GET エンドポイント。
 * リクエストパラメータを検証し、スプレッドシートから CV データを返す。
 *
 * @param e - Apps Script が渡す GET イベントオブジェクト
 * @returns JSON 形式のレスポンス
 */
function doGet(e: DoGetEvent): GoogleAppsScript.Content.TextOutput {
    return handleDoGet(e, computeHmac, fetchRows)
}
;(globalThis as any).doGet = doGet
