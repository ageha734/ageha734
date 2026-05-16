#!/usr/bin/env node
/**
 * HMAC-SHA256 signature generator for GAS API requests.
 *
 * Usage:
 *   node scripts/generate-hmac.js <path>
 *   node scripts/generate-hmac.js certifications
 *
 * Required env:
 *   GAS_HMAC_SECRET  — shared secret (same value stored in GAS script properties)
 *
 * Outputs to stdout (used by GitHub Actions):
 *   TIMESTAMP=<unix_seconds>
 *   SIGNATURE=<hex>
 *   GAS_URL=<full_url_with_params>
 */

const crypto = require('node:crypto')

const path = process.argv[2]
const secret = process.env.GAS_HMAC_SECRET
const gasUrl = process.env.GAS_API_URL

if (!path) {
    console.error('Usage: node scripts/generate-hmac.js <path>')
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
const message = `${timestamp}:${path}`
const signature = crypto.createHmac('sha256', secret).update(message).digest('hex')

const url = new URL(gasUrl)
url.searchParams.set('path', path)
url.searchParams.set('timestamp', timestamp)
url.searchParams.set('signature', signature)

if (process.env.GITHUB_OUTPUT) {
    const fs = require('node:fs')
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `TIMESTAMP=${timestamp}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `SIGNATURE=${signature}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `GAS_URL=${url.toString()}\n`)
} else {
    console.log(`TIMESTAMP=${timestamp}`)
    console.log(`SIGNATURE=${signature}`)
    console.log(`GAS_URL=${url.toString()}`)
}
