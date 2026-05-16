import crypto from 'node:crypto'
import fs from 'node:fs'

const resourcePath = process.argv[2]
const secret = process.env['GAS_HMAC_SECRET']
const gasUrl = process.env['GAS_API_URL']

if (!resourcePath) {
    console.error('Usage: tsx scripts/generate-hmac.ts <path>')
    process.exit(1)
}
if (!secret) {
    console.error('GAS_HMAC_SECRET environment variable is required')
    process.exit(1)
}
if (!gasUrl) {
    console.error('GAS_API_URL environment variable is required')
    process.exit(1)
}

const timestamp = Math.floor(Date.now() / 1000).toString()
const message = `${timestamp}:${resourcePath}`
const signature = crypto.createHmac('sha256', secret).update(message).digest('hex')

const url = new URL(gasUrl)
url.searchParams.set('path', resourcePath)
url.searchParams.set('timestamp', timestamp)
url.searchParams.set('signature', signature)

const githubOutput = process.env['GITHUB_OUTPUT']
if (githubOutput) {
    fs.appendFileSync(githubOutput, `TIMESTAMP=${timestamp}\n`)
    fs.appendFileSync(githubOutput, `SIGNATURE=${signature}\n`)
    fs.appendFileSync(githubOutput, `GAS_URL=${url.toString()}\n`)
} else {
    console.log(`TIMESTAMP=${timestamp}`)
    console.log(`SIGNATURE=${signature}`)
    console.log(`GAS_URL=${url.toString()}`)
}
