import {
    TIMESTAMP_TOLERANCE_SEC,
    buildMessage,
    safeEquals
} from '../../infrastructure/hmac/HmacSigner'

export interface AuthRequest {
    timestamp: string
    path: string
    signature: string
}

export type AuthResult = {ok: true} | {ok: false; reason: string}

export function verifyTimestamp(timestamp: string): string | null {
    if (!timestamp) return 'Missing timestamp'
    const now = Math.floor(Date.now() / 1000)
    const ts = Number.parseInt(timestamp, 10)
    if (Number.isNaN(ts) || Math.abs(now - ts) > TIMESTAMP_TOLERANCE_SEC) {
        return 'Timestamp expired or invalid (tolerance: 5 min)'
    }
    return null
}

export function verifySignature(
    request: AuthRequest,
    computeHmac: (message: string) => string
): AuthResult {
    const tsError = verifyTimestamp(request.timestamp)
    if (tsError) return {ok: false, reason: tsError}

    if (!request.signature) return {ok: false, reason: 'Missing signature'}

    const expected = computeHmac(buildMessage(request.timestamp, request.path))
    if (!safeEquals(expected, request.signature)) {
        return {ok: false, reason: 'Signature mismatch'}
    }

    return {ok: true}
}
