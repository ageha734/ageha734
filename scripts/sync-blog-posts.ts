import fs from 'node:fs'
import path from 'node:path'
import fetch from 'node-fetch'

const ROOT = path.join(__dirname, '..')
const QIITA_USER = process.env['QIITA_USERNAME'] ?? 'ageha734'
const ZENN_USER = process.env['ZENN_USERNAME'] ?? 'ageha734'

const RECENT_POSTS_START = '<!--START_SECTION:recent-posts-->'
const RECENT_POSTS_END = '<!--END_SECTION:recent-posts-->'

interface Post {
    platform: string
    title: string
    url: string
    date: string
}

interface QiitaItem {
    title: string
    url: string
    created_at: string
}

interface ZennArticle {
    title: string
    path: string
    published_at: string | null
}

interface ZennResponse {
    articles?: ZennArticle[]
}

async function fetchQiitaPosts(username: string): Promise<Post[]> {
    try {
        const res = await fetch(
            `https://qiita.com/api/v2/users/${username}/items?per_page=3&page=1`,
            { headers: { 'User-Agent': 'ageha734-readme-bot/1.0' } }
        )
        if (!res.ok) return []
        const items = (await res.json()) as QiitaItem[]
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

async function fetchZennPosts(username: string): Promise<Post[]> {
    try {
        const res = await fetch(
            `https://zenn.dev/api/articles?username=${username}&order=latest&count=3`,
            { headers: { 'User-Agent': 'ageha734-readme-bot/1.0' } }
        )
        if (!res.ok) return []
        const data = (await res.json()) as ZennResponse
        return (data.articles ?? []).map(a => ({
            platform: 'Zenn',
            title: a.title,
            url: `https://zenn.dev${a.path}`,
            date: a.published_at?.slice(0, 10) ?? '',
        }))
    } catch {
        return []
    }
}

function buildRecentPostsSection(posts: Post[]): string {
    if (posts.length === 0) return ''
    const rows = posts
        .map(p => `| ${p.platform} | [${p.title}](${p.url}) | ${p.date} |`)
        .join('\n')
    return `\n| Platform | Article | Date |\n|---|---|---|\n${rows}\n`
}

function updateSection(content: string, sectionContent: string): string {
    const escaped = RECENT_POSTS_START.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
    const escapedEnd = RECENT_POSTS_END.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
    const pattern = new RegExp(`${escaped}[\\s\\S]*?${escapedEnd}`, 'g')
    const replacement = `${RECENT_POSTS_START}${sectionContent}${RECENT_POSTS_END}`
    if (pattern.test(content)) {
        return content.replaceAll(pattern, replacement)
    }
    return content
}

async function main(): Promise<void> {
    const [qiita, zenn] = await Promise.all([
        fetchQiitaPosts(QIITA_USER),
        fetchZennPosts(ZENN_USER),
    ])

    const allPosts = [...qiita, ...zenn]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5)

    if (allPosts.length === 0) {
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

main().catch((e: unknown) => {
    console.error(e)
    process.exit(1)
})
