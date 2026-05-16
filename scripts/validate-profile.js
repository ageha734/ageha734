const fs = require('node:fs')
const path = require('node:path')

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/profile.json'), 'utf8'))
const required = ['metadata', 'bio', 'links', 'skills', 'projects', 'articles']

for (const key of required) {
    if (!data[key]) throw new Error(`Missing key: ${key}`)
}
console.log('profile.json is valid.')
