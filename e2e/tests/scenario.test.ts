import {expect, test} from '@playwright/test'

const GITHUB_PAGES_URL = process.env['GITHUB_PAGES_URL'] ?? ''

test.describe('シナリオ4: GitHub Pages の HTML が正常に配信されている', () => {
    test.skip(!GITHUB_PAGES_URL, 'GITHUB_PAGES_URL が未設定のためスキップ')

    test('GitHub Pages URL が 200 を返す', async () => {
        const res = await fetch(GITHUB_PAGES_URL)
        expect(res.status).toBe(200)
    })

    test('HTML に portfolio のコンテンツが含まれる', async () => {
        const res = await fetch(GITHUB_PAGES_URL)
        const html = await res.text()
        expect(html).toContain('ageha734')
    })
})
