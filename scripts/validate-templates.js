const fs = require('node:fs')
const path = require('node:path')
const Mustache = require('mustache')

const ROOT = path.join(__dirname, '..')
const profile = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/profile.json'), 'utf8'))

const partials = {}
for (const f of fs.readdirSync(path.join(ROOT, 'templates/partials'))) {
    if (!f.endsWith('.mustache')) continue
    partials[path.basename(f, '.mustache')] = fs.readFileSync(
        path.join(ROOT, 'templates/partials', f),
        'utf8'
    )
}

for (const tmplFile of ['README.mustache', 'README.ja.mustache']) {
    const tmpl = fs.readFileSync(path.join(ROOT, 'templates', tmplFile), 'utf8')
    const output = Mustache.render(tmpl, profile, partials)
    if (!output || output.length < 100) throw new Error(`${tmplFile} rendered to empty output`)
    console.log(`${tmplFile} OK (${output.length} chars)`)
}
