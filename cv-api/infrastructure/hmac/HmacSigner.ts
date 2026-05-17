/** API で受け付けるパスの一覧 */
export const ALLOWED_PATHS = ['certifications', 'work_experience', 'skills', 'projects'] as const

/** `ALLOWED_PATHS` のユニオン型 */
export type AllowedPath = (typeof ALLOWED_PATHS)[number]

/** タイムスタンプの許容誤差（秒）。リプレイ攻撃を防ぐためのウィンドウ幅。 */
export const TIMESTAMP_TOLERANCE_SEC = 300

/**
 * HMAC 署名対象のメッセージ文字列を組み立てる。
 * フォーマット: `{timestamp}:{path}`
 *
 * @param timestamp - Unix エポック秒の文字列
 * @param path - リクエストパス（例: `skills`）
 * @returns HMAC 計算に使用するメッセージ文字列
 */
export function buildMessage(timestamp: string, path: string): string {
    return `${timestamp}:${path}`
}

/**
 * タイミング攻撃を防ぐための定数時間文字列比較を行う。
 * 長さが異なる場合は即座に `false` を返す。
 *
 * @param a - 比較する文字列（期待値）
 * @param b - 比較する文字列（実測値）
 * @returns 両文字列が等しい場合は `true`、そうでなければ `false`
 */
export function safeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    let diff = 0
    for (let i = 0; i < a.length; i++) {
        diff |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0)
    }
    return diff === 0
}
