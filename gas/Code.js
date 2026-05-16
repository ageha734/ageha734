/**
 * Google Apps Script — Profile API
 *
 * Setup:
 *   1. Set script properties via Project Settings > Script properties:
 *      - HMAC_SECRET  : shared secret (same value as GitHub secret GAS_HMAC_SECRET)
 *      - SPREADSHEET_ID : ID of the Google Spreadsheet
 *
 *   2. Deploy as Web App:
 *      Execute as: Me
 *      Who has access: Anyone  (authentication is handled by HMAC)
 *
 * Authentication:
 *   Each request must include headers:
 *     X-Timestamp : Unix time in seconds (UTC)
 *     X-Signature : HMAC-SHA256(secret, "<timestamp>:<path>") hex string
 *   Requests older than 5 minutes are rejected.
 *
 * Sheet structure (each sheet name corresponds to a resource):
 *   certifications : year | month | name_en | name_ja
 *   work_experience: company_en | company_ja | start | end | role_en | role_ja | description_en | description_ja
 *   skills         : category | name | badge_url | icon_url
 *   projects       : name | url | description_en | description_ja | stars_badge | forks_badge | issues_badge | prs_badge
 */

const ALLOWED_PATHS = ['certifications', 'work_experience', 'skills', 'projects']
const TIMESTAMP_TOLERANCE_SEC = 300

function doGet(e) {
    try {
        const path = (e.parameter.path || '').toLowerCase()
        const timestamp = e.parameter.timestamp || ''
        const signature = e.parameter.signature || ''

        if (!ALLOWED_PATHS.includes(path)) {
            return errorResponse(400, 'Invalid path. Use: ' + ALLOWED_PATHS.join(', '))
        }

        const authError = verifyHmac(timestamp, path, signature)
        if (authError) {
            return errorResponse(401, authError)
        }

        const data = getSheetData(path)
        return jsonResponse({ ok: true, path, data })
    } catch (err) {
        return errorResponse(500, err.message)
    }
}

function verifyHmac(timestamp, path, signature) {
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

function computeHmacSha256(secret, message) {
    const signatureBytes = Utilities.computeHmacSha256Signature(
        message,
        secret,
        Utilities.Charset.UTF_8
    )
    return signatureBytes
        .map(b => ('0' + (b & 0xff).toString(16)).slice(-2))
        .join('')
}

function safeEquals(a, b) {
    if (a.length !== b.length) return false
    let diff = 0
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return diff === 0
}

function getSheetData(sheetName) {
    const ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
    const ss = SpreadsheetApp.openById(ssId)
    const sheet = ss.getSheetByName(sheetName)
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`)

    const rows = sheet.getDataRange().getValues()
    if (rows.length < 2) return []

    const headers = rows[0].map(h => String(h).trim())
    return rows.slice(1).filter(row => row.some(cell => cell !== '')).map(row => {
        const obj = {}
        headers.forEach((h, i) => {
            obj[h] = row[i] === '' ? null : row[i]
        })
        return obj
    })
}

function jsonResponse(payload) {
    return ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON)
}

function errorResponse(code, message) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: message, code }))
        .setMimeType(ContentService.MimeType.JSON)
}
