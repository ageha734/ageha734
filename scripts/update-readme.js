const fs = require('node:fs')
const path = require('node:path')
const Mustache = require('mustache')

const ROOT = path.join(__dirname, '..')
const DATA_FILE = path.join(ROOT, 'data', 'profile.json')
const TEMPLATES_DIR = path.join(ROOT, 'templates')
const PARTIALS_DIR = path.join(TEMPLATES_DIR, 'partials')

function loadProfile() {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(raw)
}

function loadPartials() {
    const partials = {}
    for (const file of fs.readdirSync(PARTIALS_DIR)) {
        if (!file.endsWith('.mustache')) continue
        const name = path.basename(file, '.mustache')
        partials[name] = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8')
    }
    return partials
}

function preserveSections(existing, rendered) {
    const sections = [
        { start: '<!--START_SECTION:waka-->', end: '<!--END_SECTION:waka-->' },
        { start: '<!--START_SECTION:lapras-card-->', end: '<!--END_SECTION:lapras-card-->' },
    ]

    let result = rendered
    for (const { start, end } of sections) {
        const escapedStart = escapeRegex(start)
        const escapedEnd = escapeRegex(end)
        const existingMatch = existing.match(
            new RegExp(String.raw`${escapedStart}([\s\S]*?)${escapedEnd}`)
        )
        if (existingMatch) {
            result = result.replace(
                new RegExp(String.raw`${escapedStart}[\s\S]*?${escapedEnd}`),
                `${start}${existingMatch[1]}${end}`
            )
        }
    }
    return result
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
}

function buildViewData(profile, lang) {
    const isJa = lang === 'ja'

    const projects = profile.projects.map(p => ({
        ...p,
        description: isJa ? p.description_ja : p.description_en,
    }))

    return {
        ...profile,
        projects,
        typing_lines: isJa
            ? 'こんにちは、アゲハです。;ようこそ、私のページへ！;私はフルスタックであるが、クラウドが専門分野です。;仲良くしてください!+😁'
            : "Hi,+I'm+Ageha;Welcome+to+my+page!;I'm+a+Full+Stack+Engineer;With+a+primary+focus+on+Cloud+Infrastructure;Be+Welcome!+😁",
        skills_title: isJa ? 'スキル' : 'Things I code with',
        tools_label: isJa ? '愛用ツール: ' : 'Like Tools: ',
        advanced_label: isJa ? '上級: ' : 'Advanced: ',
        intermediate_label: isJa ? '中級: ' : 'Intermediate: ',
        beginner_label: isJa ? '初心者: ' : 'Beginner: ',
        pg_stats_label: isJa ? 'ステータス: ' : 'PG Stats: ',
        stats_title: isJa ? 'GitHubの活動' : 'GitHub Stats',
        support_title: isJa ? 'サポート' : 'Support Me',
        projects_title: isJa ? 'オープンソースプロジェクト' : 'Open source projects',
        col_projects: isJa ? 'プロジェクト' : 'Projects',
        col_abstract: isJa ? '要旨' : 'Abstract',
    }
}

function generateReadme(templateFile, outputFile, profile, lang) {
    const template = fs.readFileSync(path.join(TEMPLATES_DIR, templateFile), 'utf8')
    const partials = loadPartials()
    const view = buildViewData(profile, lang)
    const rendered = Mustache.render(template, view, partials)

    let final = rendered
    if (fs.existsSync(outputFile)) {
        const existing = fs.readFileSync(outputFile, 'utf8')
        final = preserveSections(existing, rendered)
    }

    fs.writeFileSync(outputFile, final, 'utf8')
    console.log(`Generated: ${path.relative(ROOT, outputFile)}`)
}

function main() {
    const profile = loadProfile()

    generateReadme('README.mustache', path.join(ROOT, 'README.md'), profile, 'en')
    generateReadme('README.ja.mustache', path.join(ROOT, 'README.ja.md'), profile, 'ja')

    console.log('README generation complete.')
}

main()
