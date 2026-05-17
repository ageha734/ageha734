export const ALLOWED_PATHS = ['certifications', 'work_experience', 'skills', 'projects'] as const
export type AllowedPath = (typeof ALLOWED_PATHS)[number]

export const TIMESTAMP_TOLERANCE_SEC = 300

export function buildMessage(timestamp: string, path: string): string {
    return `${timestamp}:${path}`
}

export function safeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    let diff = 0
    for (let i = 0; i < a.length; i++) {
        diff |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0)
    }
    return diff === 0
}
