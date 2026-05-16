/**
 * Fetches profile data from the GAS API and updates data/profile.json.
 *
 * Required env:
 *   GAS_API_URL      — deployed GAS Web App URL
 *   GAS_HMAC_SECRET  — shared secret for HMAC-SHA256 signing
 */

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const ROOT = path.join(__dirname, '..')
const PROFILE_PATH = path.join(ROOT, 'data', 'profile.json')

const GAS_URL = process.env.GAS_API_URL
const SECRET = process.env.GAS_HMAC_SECRET

if (!GAS_URL || !SECRET) {
    console.error('GAS_API_URL and GAS_HMAC_SECRET are required')
    process.exit(1)
}

function buildSignedUrl(resourcePath) {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const message = `${timestamp}:${resourcePath}`
    const signature = crypto.createHmac('sha256', SECRET).update(message).digest('hex')

    const url = new URL(GAS_URL)
    url.searchParams.set('path', resourcePath)
    url.searchParams.set('timestamp', timestamp)
    url.searchParams.set('signature', signature)
    return url.toString()
}

async function fetchResource(resourcePath) {
    const fetch = (await import('node-fetch')).default
    const url = buildSignedUrl(resourcePath)
    const res = await fetch(url, {
        headers: { 'User-Agent': 'ageha734-readme-bot/1.0' },
    })
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${resourcePath}`)
    }
    const body = await res.json()
    if (!body.ok) {
        throw new Error(`API error for ${resourcePath}: ${body.error}`)
    }
    return body.data
}

function normalizeCertifications(rows) {
    return rows.map(r => ({
        year: Number(r.year),
        month: Number(r.month),
        name_en: r.name_en ?? '',
        name_ja: r.name_ja ?? '',
    }))
}

function normalizeWorkExperience(rows) {
    return rows.map(r => ({
        company_en: r.company_en ?? '',
        company_ja: r.company_ja ?? '',
        start: r.start ?? '',
        end: r.end ?? null,
        role_en: r.role_en ?? '',
        role_ja: r.role_ja ?? '',
        description_en: r.description_en ?? '',
        description_ja: r.description_ja ?? '',
    }))
}

function normalizeSkills(rows) {
    const categories = {}
    for (const r of rows) {
        const cat = r.category ?? 'other'
        if (!categories[cat]) categories[cat] = []
        const entry = { name: r.name ?? '' }
        if (r.badge_url) entry.badge = r.badge_url
        if (r.icon_url) entry.icon = r.icon_url
        categories[cat].push(entry)
    }
    return categories
}

function normalizeProjects(rows) {
    return rows.map(r => ({
        name: r.name ?? '',
        url: r.url ?? '',
        description_en: r.description_en ?? '',
        description_ja: r.description_ja ?? '',
        stars_badge: r.stars_badge ?? '',
        forks_badge: r.forks_badge ?? '',
        issues_badge: r.issues_badge ?? '',
        prs_badge: r.prs_badge ?? '',
    }))
}

async function main() {
    const profile = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'))
    let updated = false

    const resources = [
        { path: 'certifications', key: 'certifications', normalize: normalizeCertifications },
        { path: 'work_experience', key: 'work_experience', normalize: normalizeWorkExperience },
        { path: 'skills', key: 'skills', normalize: normalizeSkills },
        { path: 'projects', key: 'projects', normalize: normalizeProjects },
    ]

    for (const { path: rPath, key, normalize } of resources) {
        try {
            const raw = await fetchResource(rPath)
            profile[key] = normalize(raw)
            console.log(`Synced ${key}: ${raw.length} rows`)
            updated = true
        } catch (err) {
            console.error(`Failed to sync ${key}: ${err.message}`)
        }
    }

    if (updated) {
        fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 4) + '\n', 'utf8')
        console.log('profile.json updated.')
    }
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
