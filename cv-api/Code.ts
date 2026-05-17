import {handleDoGet} from './presentation/doGet'
import type {DoGetEvent} from './presentation/doGet'

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

function fetchRows(_path: string): unknown[][] {
    const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
    if (!ssId) throw new Error('SPREADSHEET_ID not set')
    const ss = SpreadsheetApp.openById(ssId)
    const sheet = ss.getSheetByName('スキルシート')
    if (!sheet) throw new Error('Sheet not found: スキルシート')
    return sheet.getDataRange().getValues() as unknown[][]
}

function doGet(e: DoGetEvent): GoogleAppsScript.Content.TextOutput {
    return handleDoGet(e, computeHmac, fetchRows)
}
;(globalThis as any).doGet = doGet
