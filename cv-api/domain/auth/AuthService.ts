import {
    TIMESTAMP_TOLERANCE_SEC,
    buildMessage,
    safeEquals
} from '../../infrastructure/hmac/HmacSigner'

/**
 * 署名検証リクエストのパラメータ。
 */
export interface AuthRequest {
    /** Unix エポック秒のタイムスタンプ文字列 */
    timestamp: string
    /** リクエストパス（例: `skills`） */
    path: string
    /** クライアントが計算した HMAC-SHA256 署名の16進数文字列 */
    signature: string
}

/**
 * 認証結果の判別共用体型。
 * `ok: true` の場合は認証成功、`ok: false` の場合は失敗理由を含む。
 */
export type AuthResult = {ok: true} | {ok: false; reason: string}

/**
 * タイムスタンプの有効性を検証する。
 * 未設定・非数値・許容誤差（`TIMESTAMP_TOLERANCE_SEC`）超過の場合は失敗とする。
 *
 * @param timestamp - 検証する Unix エポック秒の文字列
 * @returns 検証が成功した場合は `null`、失敗した場合はエラーメッセージ文字列
 */
export function verifyTimestamp(timestamp: string): string | null {
    if (!timestamp) return 'Missing timestamp'
    const now = Math.floor(Date.now() / 1000)
    const ts = Number.parseInt(timestamp, 10)
    if (Number.isNaN(ts) || Math.abs(now - ts) > TIMESTAMP_TOLERANCE_SEC) {
        return 'Timestamp expired or invalid (tolerance: 5 min)'
    }
    return null
}

/**
 * タイムスタンプと HMAC 署名を検証して認証結果を返す。
 * タイムスタンプ検証 → 署名存在確認 → 署名一致確認の順に実行する。
 *
 * @param request - 検証する認証リクエスト情報
 * @param computeHmac - HMAC-SHA256 署名を計算する関数（依存性注入）
 * @returns 認証成功の場合は `{ok: true}`、失敗の場合は `{ok: false, reason: string}`
 */
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
