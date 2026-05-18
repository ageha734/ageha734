import {build} from 'esbuild'

await build({
    entryPoints: ['Code.ts'],
    bundle: true,
    platform: 'neutral',
    format: 'iife',
    target: 'es2019',
    charset: 'utf8',
    outfile: 'dist/Code.js',
    tsconfig: 'tsconfig.build.json'
})
