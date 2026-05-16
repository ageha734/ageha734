const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const QIITA_USER = process.env.QIITA_USERNAME || 'ageha734'
const ZENN_USER = process.env.ZENN_USERNAME || 'ageha734'

const RECENT_POSTS_START = '<!--START_SECTION:recent-posts-->'
const RECENT_POSTS_END = '<!--END_SECTION:recent-posts-->'

async function fetchQiitaPosts(username) {
    const fetch = (await import('node-fetch')).default
    try {
        const res = await fetch(
            `https://qiita.com/api/v2/users/${username}/items?per_page=3&page=1`,
            { headers: { 'User-Agent': 'ageha734-readme-bot/1.0' } }
        )
        if (!res.ok) return []
        const items = await res.json()
        return items.map(item => ({
            platform: 'Qiita',
            title: item.title,
            url: item.url,
            date: item.created_at.slice(0, 10),
        }))
    } catch {
        return []
    }
}

async function fetchZennPosts(username) {
    const fetch = (await import('node-fetch')).default
    try {
        const res = await fetch(
            `https://zenn.dev/api/articles?username=${username}&order=latest&count=3`,
            { headers: { 'User-Agent': 'ageha734-readme-bot/1.0' } }
        )
        if (!res.ok) return []
        const data = await res.json()
        return (data.articles || []).map(a => ({
            platform: 'Zenn',
            title: a.title,
            url: `https://zenn.dev${a.path}`,
            date: a.published_at?.slice(0, 10) || '',
        }))
    } catch {
        return []
    }
}

function buildRecentPostsSection(posts) {
    if (!posts.length) return ''

    const rows = posts
        .map(p => `| ${p.platform} | [${p.title}](${p.url}) | ${p.date} |`)
        .join('\n')

    return `\n| Platform | Article | Date |\n|---|---|---|\n${rows}\n`
}

function updateSection(content, sectionContent) {
    const pattern = new RegExp(
        `${RECENT_POSTS_START.replace(/<!--/g, '<!--').replace(/-->/g, '-->')}[\\s\\S]*?${RECENT_POSTS_END}`,
        'g'
    )
    const replacement = `${RECENT_POSTS_START}${sectionContent}${RECENT_POSTS_END}`

    if (pattern.test(content)) {
        return content.replace(pattern, replacement)
    }
    return content
}

async function main() {
    const [qiita, zenn] = await Promise.all([
        fetchQiitaPosts(QIITA_USER),
        fetchZennPosts(ZENN_USER),
    ])

    const allPosts = [...qiita, ...zenn]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5)

    if (!allPosts.length) {
        console.log('No posts fetched, skipping update.')
        return
    }

    const sectionContent = buildRecentPostsSection(allPosts)

    for (const file of ['README.md', 'README.ja.md']) {
        const filePath = path.join(ROOT, file)
        if (!fs.existsSync(filePath)) continue
        const content = fs.readFileSync(filePath, 'utf8')
        const updated = updateSection(content, sectionContent)
        if (updated !== content) {
            fs.writeFileSync(filePath, updated, 'utf8')
            console.log(`Updated ${file} with ${allPosts.length} recent posts.`)
        } else {
            console.log(`No section markers found in ${file}, skipping.`)
        }
    }
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
