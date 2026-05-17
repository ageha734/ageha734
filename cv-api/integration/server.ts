import crypto from 'node:crypto'
import http from 'node:http'
import {verifySignature} from '../domain/auth/AuthService'
import {ALLOWED_PATHS, buildCvData, isAllowedPath} from '../domain/cv/CvRepository'
import {FIXTURES} from './fixtures'

function makeHmac(secret: string) {
    return (message: string) =>
        crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex')
}

export function createServer(secret: string): http.Server {
    const hmac = makeHmac(secret)

    return http.createServer((req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const rawPath = (url.searchParams.get('path') ?? '').toLowerCase()
        const timestamp = url.searchParams.get('timestamp') ?? ''
        const signature = url.searchParams.get('signature') ?? ''

        const send = (code: number, body: unknown) => {
            res.writeHead(code, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(body))
        }

        if (url.pathname === '/health') {
            return send(200, {ok: true})
        }

        if (!isAllowedPath(rawPath)) {
            return send(400, {
                ok: false,
                error: `Invalid path. Use: ${ALLOWED_PATHS.join(', ')}`,
                code: 400
            })
        }

        const auth = verifySignature({timestamp, path: rawPath, signature}, hmac)
        if (!auth.ok) return send(401, {ok: false, error: auth.reason, code: 401})

        const cvData = buildCvData(rawPath, FIXTURES[rawPath] ?? [])
        send(200, {ok: true, path: rawPath, data: cvData.rows})
    })
}

if (process.argv[1] === import.meta.filename) {
    const hmacKey = process.env['HMAC_SECRET'] ?? 'local-dev-secret'
    const port = Number.parseInt(process.env['PORT'] ?? '3000', 10)
    const server = createServer(hmacKey)
    server.listen(port, () => {
        console.log(`cv-api local server running at http://localhost:${port}`)
        const ts = Math.floor(Date.now() / 1000)
        const sig = crypto
            .createHmac('sha256', hmacKey)
            .update(`${ts}:certifications`, 'utf8')
            .digest('hex')
        console.log(
            `  curl "http://localhost:${port}?path=certifications&timestamp=${ts}&signature=${sig}"`
        )
    })
}
