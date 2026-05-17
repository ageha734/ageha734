import fs from 'node:fs'
import path from 'node:path'
import Mustache from 'mustache'

const ROOT = path.join(__dirname, '..')

interface Profile {
    metadata: {
        username: string
        role_en: string
        role_ja: string
        keywords_en: string
        keywords_ja: string
        lapras_share_id: string
        wakatime_user_id: string
    }
    links: Record<string, string>
    skills: {
        tools: SkillItem[]
        advanced: SkillItem[]
        intermediate: SkillItem[]
        beginner: SkillItem[]
    }
    projects: ProjectItem[]
    articles: ArticleItem[]
    certifications: CertItem[]
}

interface SkillItem {
    name: string
    badge?: string
    icon?: string
}
interface ProjectItem {
    name: string
    url: string
    description_en: string
    description_ja: string
    stars_badge: string
    forks_badge: string
    icon?: string
}
interface ArticleItem {
    platform: string
    url: string
    topics_en: string
    topics_ja: string
}
interface CertItem {
    year: number
    month: number
    name_en: string
    name_ja: string
}

const PROJECT_ICONS: Record<string, string> = {
    'README.pet': '🐾',
    PresenterPro: '🎤',
    EchoSleep: '😴'
}

const TYPING_PHRASES = [
    'Cloud Infrastructure Specialist',
    'Go / Kubernetes / Terraform',
    'GCP · AWS · Docker',
    'Full Stack Engineer'
]

function buildView(profile: Profile): Record<string, unknown> {
    const projects = profile.projects.map(p => ({
        ...p,
        icon: PROJECT_ICONS[p.name] ?? '📦'
    }))

    const certifications_portfolio = profile.certifications.map(c => ({
        label: c.name_ja
    }))

    const typing_phrases = TYPING_PHRASES.map((phrase, i) => ({
        phrase,
        last: i === TYPING_PHRASES.length - 1
    }))

    return {
        ...profile,
        projects,
        certifications_portfolio,
        typing_phrases
    }
}

const profile = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/profile.json'), 'utf8')) as Profile

const template = fs.readFileSync(path.join(ROOT, 'templates/portfolio.html.mustache'), 'utf8')

const view = buildView(profile)
const html = Mustache.render(template, view)

fs.mkdirSync(path.join(ROOT, 'docs'), {recursive: true})
fs.writeFileSync(path.join(ROOT, 'docs/index.html'), html, 'utf8')
console.log('Generated: docs/index.html')
