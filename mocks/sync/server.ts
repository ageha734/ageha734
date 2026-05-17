import {spawn} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {createServer} from 'node:http'
import {resolve} from 'node:path'

const PORT = Number(process.env['PORT'] ?? 14000)

type StepStatus = 'idle' | 'running' | 'success' | 'failure'

interface Step {
    command: string
    status: StepStatus
    logs: string[]
}

// SYNC_STEPS="name1:command1,name2:command2"
const steps: Record<string, Step> = Object.fromEntries(
    (process.env['SYNC_STEPS'] ?? '')
        .split(',')
        .filter(Boolean)
        .map(entry => {
            const idx = entry.indexOf(':')
            const name = entry.slice(0, idx)
            const command = entry.slice(idx + 1)
            return [name, {command, status: 'idle', logs: []}]
        })
)

function runStep(step: Step): void {
    step.status = 'running'
    step.logs = []

    const [cmd, ...args] = step.command.split(' ')
    if (!cmd) return
    const child = spawn(cmd, args, {env: process.env, shell: false})

    child.stdout.on('data', (d: Buffer) => step.logs.push(d.toString()))
    child.stderr.on('data', (d: Buffer) => step.logs.push(d.toString()))
    child.on('close', code => {
        step.status = code === 0 ? 'success' : 'failure'
    })
}

type Sender = (code: number, body: unknown) => void

function handleGet(url: string, send: Sender): void {
    if (url === '/health') return send(200, {ok: true})
    if (url === '/status') return send(200, {ok: true, steps})

    if (url.startsWith('/raw?')) {
        const file = new URLSearchParams(url.slice('/raw?'.length)).get('file')
        if (!file) return send(400, {ok: false, error: 'file query param required'})
        const abs = resolve('/workspace', file)
        if (!abs.startsWith('/workspace/')) return send(403, {ok: false, error: 'forbidden'})
        try {
            const content = JSON.parse(readFileSync(abs, 'utf8'))
            return send(200, {ok: true, content})
        } catch {
            return send(404, {ok: false, error: `not found: ${file}`})
        }
    }

    if (url.startsWith('/logs/')) {
        const name = url.slice('/logs/'.length)
        const step = steps[name]
        if (!step) return send(404, {ok: false, error: `unknown step: ${name}`})
        return send(200, {ok: true, status: step.status, logs: step.logs})
    }

    send(404, {ok: false})
}

function handlePost(url: string, send: Sender): void {
    if (url.startsWith('/run/')) {
        const name = url.slice('/run/'.length)
        const step = steps[name]
        if (!step) return send(404, {ok: false, error: `unknown step: ${name}`})
        if (step.status === 'running') return send(409, {ok: false, error: 'already running'})
        runStep(step)
        return send(202, {ok: true})
    }

    send(404, {ok: false})
}

createServer((req, res) => {
    const send: Sender = (code, body) => {
        res.writeHead(code, {'Content-Type': 'application/json', Connection: 'close'})
        res.end(JSON.stringify(body))
    }

    const url = req.url ?? ''
    if (req.method === 'GET') return handleGet(url, send)
    if (req.method === 'POST') return handlePost(url, send)
    send(404, {ok: false})
}).listen(PORT, () => {
    console.log(`sync-server running at http://localhost:${PORT}`)
    console.log(`steps: ${Object.keys(steps).join(', ')}`)
})
