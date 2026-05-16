import fs from 'node:fs'
import path from 'node:path'

const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/profile.json'), 'utf8')
) as Record<string, unknown>

const required = ['metadata', 'bio', 'links', 'skills', 'projects', 'articles'] as const

for (const key of required) {
    if (!data[key]) throw new Error(`Missing key: ${key}`)
}
console.log('profile.json is valid.')
