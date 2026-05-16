import http from 'node:http'
import crypto from 'node:crypto'
import { FIXTURES } from './fixtures'
import { parseRows, type SheetRow } from '../lib/sheet'
import { ALLOWED_PATHS, safeEquals, verifyTimestamp, buildMessage, type AllowedPath } from '../lib/hmac'

const SECRET = process.env['HMAC_SECRET'] ?? 'local-dev-secret'
const PORT = parseInt(process.env['PORT'] ?? '3001', 10)

function computeHmac(secret: string, message: string): string {
    return crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex')
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
    const params = {
        path: url.searchParams.get('path') ?? '',
        timestamp: url.searchParams.get('timestamp') ?? '',
        signature: url.searchParams.get('signature') ?? '',
    }

    const send = (code: number, body: unknown) => {
        res.writeHead(code, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(body))
    }

    const p = params.path.toLowerCase() as AllowedPath
    if (!(ALLOWED_PATHS as readonly string[]).includes(p)) {
        return send(400, { ok: false, error: `Invalid path. Use: ${ALLOWED_PATHS.join(', ')}`, code: 400 })
    }

    const tsError = verifyTimestamp(params.timestamp)
    if (tsError) return send(401, { ok: false, error: tsError, code: 401 })

    const expected = computeHmac(SECRET, buildMessage(params.timestamp, p))
    if (!safeEquals(expected, params.signature)) {
        return send(401, { ok: false, error: 'Signature mismatch', code: 401 })
    }

    const rows = FIXTURES[p] ?? []
    const data: SheetRow[] = parseRows(rows as unknown[][])
    send(200, { ok: true, path: p, data })
})

server.listen(PORT, () => {
    console.log(`cv-api local server running at http://localhost:${PORT}`)
    console.log(`HMAC_SECRET: ${SECRET}`)
    console.log()
    console.log('Generate a test request:')
    const ts = Math.floor(Date.now() / 1000)
    const sig = crypto.createHmac('sha256', SECRET).update(`${ts}:certifications`, 'utf8').digest('hex')
    console.log(`  curl "http://localhost:${PORT}?path=certifications&timestamp=${ts}&signature=${sig}"`)
})
