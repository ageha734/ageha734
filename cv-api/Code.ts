import {
    ALLOWED_PATHS,
    type AllowedPath,
    buildMessage,
    safeEquals,
    verifyTimestamp
} from './lib/hmac'
import {type SheetRow, parseRows} from './lib/sheet'

interface DoGetEvent {
    parameter: {
        path?: string
        timestamp?: string
        signature?: string
    }
}

interface SuccessPayload {
    ok: true
    path: string
    data: SheetRow[]
}

interface ErrorPayload {
    ok: false
    error: string
    code: number
}

function doGet(e: DoGetEvent): GoogleAppsScript.Content.TextOutput {
    try {
        const path = (e.parameter.path ?? '').toLowerCase() as AllowedPath
        const timestamp = e.parameter.timestamp ?? ''
        const signature = e.parameter.signature ?? ''

        if (!(ALLOWED_PATHS as readonly string[]).includes(path)) {
            return errorResponse(400, `Invalid path. Use: ${ALLOWED_PATHS.join(', ')}`)
        }

        const tsError = verifyTimestamp(timestamp)
        if (tsError) return errorResponse(401, tsError)

        const secret = PropertiesService.getScriptProperties().getProperty('HMAC_SECRET')
        if (!secret) return errorResponse(500, 'Server misconfiguration: HMAC_SECRET not set')

        const expected = computeHmacSha256(secret, buildMessage(timestamp, path))
        if (!safeEquals(expected, signature)) return errorResponse(401, 'Signature mismatch')

        const data = getSheetData(path)
        return jsonResponse({ok: true, path, data})
    } catch (err) {
        return errorResponse(500, err instanceof Error ? err.message : String(err))
    }
}

function computeHmacSha256(secret: string, message: string): string {
    const signatureBytes = Utilities.computeHmacSha256Signature(
        message,
        secret,
        Utilities.Charset.UTF_8
    )
    return signatureBytes.map((b: number) => `0${(b & 0xff).toString(16)}`.slice(-2)).join('')
}

function getSheetData(sheetName: string): SheetRow[] {
    const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
    if (!ssId) throw new Error('SPREADSHEET_ID not set')

    const ss = SpreadsheetApp.openById(ssId)
    const sheet = ss.getSheetByName(sheetName)
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`)

    const rows = sheet.getDataRange().getValues() as unknown[][]
    return parseRows(rows)
}

function jsonResponse(payload: SuccessPayload): GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
        ContentService.MimeType.JSON
    )
}

function errorResponse(code: number, message: string): GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput(
        JSON.stringify({ok: false, error: message, code} satisfies ErrorPayload)
    ).setMimeType(ContentService.MimeType.JSON)
}
