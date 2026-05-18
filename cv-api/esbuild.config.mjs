import {mkdir, rm} from 'node:fs/promises'
import {build} from 'esbuild'

await mkdir('dist', {recursive: true})
await Promise.all([
    rm('dist/function.js', {force: true}),
    rm('dist/function.js.sha256', {force: true}),
    rm('dist/appsscript.json', {force: true})
])

await build({
    entryPoints: ['function.ts'],
    bundle: true,
    platform: 'neutral',
    format: 'iife',
    target: 'es2019',
    charset: 'utf8',
    outfile: 'dist/function.js',
    tsconfig: 'tsconfig.build.json'
})
