import crypto from 'node:crypto'
import http from 'node:http'
import {
    ALLOWED_PATHS,
    type AllowedPath,
    buildMessage,
    safeEquals,
    verifyTimestamp
} from '../lib/hmac'
import {type SheetRow, parseRows} from '../lib/sheet'
import {FIXTURES} from './fixtures'

function computeHmac(secret: string, message: string): string {
    return crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex')
}

export function createServer(secret: string): http.Server {
    return http.createServer((req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const params = {
            path: url.searchParams.get('path') ?? '',
            timestamp: url.searchParams.get('timestamp') ?? '',
            signature: url.searchParams.get('signature') ?? ''
        }

        const send = (code: number, body: unknown) => {
            res.writeHead(code, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(body))
        }

        const p = params.path.toLowerCase() as AllowedPath
        if (!(ALLOWED_PATHS as readonly string[]).includes(p)) {
            return send(400, {
                ok: false,
                error: `Invalid path. Use: ${ALLOWED_PATHS.join(', ')}`,
                code: 400
            })
        }

        const tsError = verifyTimestamp(params.timestamp)
        if (tsError) return send(401, {ok: false, error: tsError, code: 401})

        const expected = computeHmac(secret, buildMessage(params.timestamp, p))
        if (!safeEquals(expected, params.signature)) {
            return send(401, {ok: false, error: 'Signature mismatch', code: 401})
        }

        const rows = FIXTURES[p] ?? []
        const data: SheetRow[] = parseRows(rows)
        send(200, {ok: true, path: p, data})
    })
}

// エントリーポイントとして直接実行された場合のみ起動
if (require.main === module) {
    const SECRET = process.env['HMAC_SECRET'] ?? 'local-dev-secret'
    const PORT = Number.parseInt(process.env['PORT'] ?? '3001', 10)
    const server = createServer(SECRET)
    server.listen(PORT, () => {
        console.log(`cv-api local server running at http://localhost:${PORT}`)
        console.log(`HMAC_SECRET: ${SECRET}`)
        console.log()
        console.log('Generate a test request:')
        const ts = Math.floor(Date.now() / 1000)
        const sig = crypto
            .createHmac('sha256', SECRET)
            .update(`${ts}:certifications`, 'utf8')
            .digest('hex')
        console.log(
            `  curl "http://localhost:${PORT}?path=certifications&timestamp=${ts}&signature=${sig}"`
        )
    })
}
