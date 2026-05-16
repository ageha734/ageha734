// GAS entrypoint — clasp push transpiles this to JavaScript
// Pure logic lives in lib/ and is independently testable

const ALLOWED_PATHS = ['certifications', 'work_experience', 'skills', 'projects'] as const
type AllowedPath = (typeof ALLOWED_PATHS)[number]

const TIMESTAMP_TOLERANCE_SEC = 300

interface RequestParams {
    path?: string
    timestamp?: string
    signature?: string
}

interface DoGetEvent {
    parameter: RequestParams
}

interface SheetRow {
    [key: string]: unknown
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

        const authError = verifyHmac(timestamp, path, signature)
        if (authError) {
            return errorResponse(401, authError)
        }

        const data = getSheetData(path)
        return jsonResponse({ ok: true, path, data })
    } catch (err) {
        return errorResponse(500, err instanceof Error ? err.message : String(err))
    }
}

function verifyHmac(timestamp: string, path: string, signature: string): string | null {
    if (!timestamp || !signature) {
        return 'Missing timestamp or signature'
    }

    const now = Math.floor(Date.now() / 1000)
    const ts = parseInt(timestamp, 10)

    if (Number.isNaN(ts) || Math.abs(now - ts) > TIMESTAMP_TOLERANCE_SEC) {
        return 'Timestamp expired or invalid (tolerance: 5 min)'
    }

    const secret = PropertiesService.getScriptProperties().getProperty('HMAC_SECRET')
    if (!secret) {
        return 'Server misconfiguration: HMAC_SECRET not set'
    }

    const message = `${timestamp}:${path}`
    const expected = computeHmacSha256(secret, message)

    if (!safeEquals(expected, signature)) {
        return 'Signature mismatch'
    }
    return null
}

function computeHmacSha256(secret: string, message: string): string {
    const signatureBytes = Utilities.computeHmacSha256Signature(
        message,
        secret,
        Utilities.Charset.UTF_8
    )
    return signatureBytes
        .map((b: number) => `0${(b & 0xff).toString(16)}`.slice(-2))
        .join('')
}

function safeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    let diff = 0
    for (let i = 0; i < a.length; i++) {
        diff |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0)
    }
    return diff === 0
}

function getSheetData(sheetName: string): SheetRow[] {
    const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
    if (!ssId) throw new Error('SPREADSHEET_ID not set')

    const ss = SpreadsheetApp.openById(ssId)
    const sheet = ss.getSheetByName(sheetName)
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`)

    const rows = sheet.getDataRange().getValues() as unknown[][]
    if (rows.length < 2) return []

    const headers = (rows[0] as unknown[]).map(h => String(h).trim())
    return rows
        .slice(1)
        .filter(row => (row as unknown[]).some(cell => cell !== ''))
        .map(row => {
            const obj: SheetRow = {}
            headers.forEach((h, i) => {
                obj[h] = (row as unknown[])[i] === '' ? null : (row as unknown[])[i]
            })
            return obj
        })
}

function jsonResponse(payload: SuccessPayload): GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON)
}

function errorResponse(code: number, message: string): GoogleAppsScript.Content.TextOutput {
    const payload: ErrorPayload = { ok: false, error: message, code }
    return ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON)
}
