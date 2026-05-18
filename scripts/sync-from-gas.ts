import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.join(__dirname, '..')
const PROFILE_PATH = path.join(ROOT, 'data', 'profile.json')

const GAS_URL_RAW = process.env['GAS_API_URL']
const SECRET_RAW = process.env['GAS_HMAC_SECRET']

if (!GAS_URL_RAW || !SECRET_RAW) {
    console.warn('GAS_API_URL or GAS_HMAC_SECRET is not set — skipping sync')
    process.exit(0)
}

const GAS_URL: string = GAS_URL_RAW
const SECRET: string = SECRET_RAW

interface GasResponse<T> {
    ok: boolean
    data: T
    error?: string
}

type RawRow = Record<string, unknown>

interface CertRow {
    year: unknown
    month: unknown
    name_en: unknown
    name_ja: unknown
}
interface WorkRow {
    company_en: unknown
    company_ja: unknown
    start: unknown
    end: unknown
    role_en: unknown
    role_ja: unknown
    description_en: unknown
    description_ja: unknown
}
interface SkillRow {
    category: unknown
    name: unknown
    years: unknown
    grade: unknown
}
interface ProjectRow {
    no: unknown
    start: unknown
    end: unknown
    industry: unknown
    role_ja: unknown
    role_en: unknown
    scale: unknown
    title_ja: unknown
    title_en: unknown
    description_ja: unknown
    description_en: unknown
    tech_stack: unknown
}

function str(v: unknown): string {
    return typeof v === 'string' ? v : ''
}

function buildSignedUrl(resourcePath: string): string {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const message = `${timestamp}:${resourcePath}`
    const signature = crypto.createHmac('sha256', SECRET).update(message).digest('hex')
    const url = new URL(GAS_URL)
    url.searchParams.set('path', resourcePath)
    url.searchParams.set('timestamp', timestamp)
    url.searchParams.set('signature', signature)
    return url.toString()
}

async function fetchResource<T>(resourcePath: string): Promise<T[]> {
    const url = buildSignedUrl(resourcePath)
    const res = await fetch(url, {headers: {'User-Agent': 'ageha734-readme-bot/1.0'}})
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${resourcePath}`)
    const body = (await res.json()) as GasResponse<T[]>
    if (!body.ok) throw new Error(`API error for ${resourcePath}: ${body.error ?? 'unknown'}`)
    return body.data
}

function normalizeCertifications(rows: RawRow[]) {
    return (rows as unknown as CertRow[]).map(r => ({
        year: Number(r.year),
        month: Number(r.month),
        name_en: str(r.name_en),
        name_ja: str(r.name_ja)
    }))
}

function normalizeWorkExperience(rows: RawRow[]) {
    return (rows as unknown as WorkRow[]).map(r => ({
        company_en: str(r.company_en),
        company_ja: str(r.company_ja),
        start: str(r.start),
        end: r.end == null ? null : str(r.end),
        role_en: str(r.role_en),
        role_ja: str(r.role_ja),
        description_en: str(r.description_en),
        description_ja: str(r.description_ja)
    }))
}

const GRADE_MAP: Record<string, string> = {
    A: 'advanced',
    B: 'intermediate',
    C: 'basic',
    D: 'knowledge'
}

function normalizeSkills(rows: RawRow[]) {
    const groups: Record<string, {name: string; years: number | null; category: string}[]> = {}
    for (const r of rows as unknown as SkillRow[]) {
        const gradeKey = GRADE_MAP[str(r.grade)] ?? 'other'
        groups[gradeKey] ??= []
        groups[gradeKey]?.push({
            name: str(r.name),
            years: r.years != null && r.years !== '' ? Number(r.years) : null,
            category: str(r.category)
        })
    }
    return groups
}

function normalizeProjects(rows: RawRow[]) {
    return (rows as unknown as ProjectRow[]).map(r => ({
        no: Number(r.no),
        name: str(r.title_ja),
        start: str(r.start),
        end: r.end == null ? null : str(r.end),
        industry: str(r.industry),
        role_ja: str(r.role_ja),
        role_en: str(r.role_en),
        scale: str(r.scale),
        title_ja: str(r.title_ja),
        title_en: str(r.title_en),
        description_ja: str(r.description_ja),
        description_en: str(r.description_en),
        tech_stack: str(r.tech_stack)
    }))
}

async function main(): Promise<void> {
    const profile = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8')) as Record<string, unknown>
    let updated = false

    const resources = [
        {path: 'certifications', key: 'certifications', normalize: normalizeCertifications},
        {path: 'work_experience', key: 'work_experience', normalize: normalizeWorkExperience},
        {path: 'skills', key: 'skills', normalize: normalizeSkills},
        {path: 'projects', key: 'projects', normalize: normalizeProjects}
    ] as const

    for (const {path: rPath, key, normalize} of resources) {
        try {
            const raw = await fetchResource<RawRow>(rPath)
            profile[key] = normalize(raw)
            console.log(`Synced ${key}: ${raw.length} rows`)
            updated = true
        } catch (err) {
            console.error(
                `Failed to sync ${key}: ${err instanceof Error ? err.message : String(err)}`
            )
        }
    }

    if (updated) {
        fs.writeFileSync(PROFILE_PATH, `${JSON.stringify(profile, null, 4)}\n`, 'utf8')
        console.log('profile.json updated.')
    }
}

main().catch((e: unknown) => {
    console.error(e)
    process.exit(1)
})
