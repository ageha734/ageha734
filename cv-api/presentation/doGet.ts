import {verifySignature} from '../domain/auth/AuthService'
import {ALLOWED_PATHS, buildCvData, isAllowedPath} from '../domain/cv/CvRepository'
import type {SheetRow} from '../infrastructure/spreadsheet/SpreadsheetClient'

export interface DoGetEvent {
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
