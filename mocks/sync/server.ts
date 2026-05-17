import {spawn} from 'node:child_process'
import {createServer} from 'node:http'

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

createServer((req, res) => {
    const send = (code: number, body: unknown) => {
        res.writeHead(code, {'Content-Type': 'application/json', Connection: 'close'})
        res.end(JSON.stringify(body))
    }

    if (req.method === 'GET' && req.url === '/health') {
        return send(200, {ok: true})
    }

    if (req.method === 'GET' && req.url === '/status') {
        return send(200, {ok: true, steps})
    }

    if (req.method === 'GET' && req.url?.startsWith('/logs/')) {
        const name = req.url.slice('/logs/'.length)
        const step = steps[name]
        if (!step) return send(404, {ok: false, error: `unknown step: ${name}`})
        return send(200, {ok: true, status: step.status, logs: step.logs})
    }

    if (req.method === 'POST' && req.url?.startsWith('/run/')) {
        const name = req.url.slice('/run/'.length)
        const step = steps[name]
        if (!step) return send(404, {ok: false, error: `unknown step: ${name}`})
        if (step.status === 'running') return send(409, {ok: false, error: 'already running'})
        runStep(step)
        return send(202, {ok: true})
    }

    send(404, {ok: false})
}).listen(PORT, () => {
    console.log(`sync-server running at http://localhost:${PORT}`)
    console.log(`steps: ${Object.keys(steps).join(', ')}`)
})
