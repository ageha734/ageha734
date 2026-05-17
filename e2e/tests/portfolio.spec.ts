import {expect, test} from '@playwright/test'

const SYNC_URL = process.env['SYNC_SERVER_URL'] ?? 'http://localhost:14000'

interface Profile {
    skills: {advanced: {name: string}[]}
    projects: {name: string}[]
}

async function fetchProfile(): Promise<Profile> {
    const res = await fetch(`${SYNC_URL}/raw?file=data/profile.json`)
    const body = (await res.json()) as {ok: boolean; content: Profile}
    return body.content
}

test.describe('ポートフォリオページ', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('/')
    })

    test('ページが正常に表示される', async ({page}) => {
        await expect(page).toHaveTitle(/ageha734/)
        await expect(page.locator('nav')).toBeVisible()
        await expect(page.locator('#hero')).toBeVisible()
    })

    test('全セクションが存在する', async ({page}) => {
        for (const id of ['skills', 'projects', 'articles', 'contact']) {
            await expect(page.locator(`#${id}`)).toBeVisible()
        }
    })

    test('Skills セクションにスキルタグが表示されている', async ({page}) => {
        await page.locator('#skills').scrollIntoViewIfNeeded()
        const skillTags = page.locator('.skill-tag')
        await expect(skillTags.first()).toBeVisible()
        expect(await skillTags.count()).toBeGreaterThan(0)
    })

    test('Advanced スキルが profile.json の値と一致する', async ({page}) => {
        const profile = await fetchProfile()
        const advancedSkills = profile.skills.advanced.map(s => s.name)

        await page.locator('#skills').scrollIntoViewIfNeeded()
        const advancedTags = page.locator('.skill-tag.advanced')

        for (const skillName of advancedSkills) {
            await expect(advancedTags.filter({hasText: skillName})).toBeVisible()
        }
    })

    test('Projects セクションにプロジェクトカードが表示されている', async ({page}) => {
        await page.locator('#projects').scrollIntoViewIfNeeded()
        const cards = page.locator('.project-card')
        await expect(cards.first()).toBeVisible()
        expect(await cards.count()).toBeGreaterThan(0)
    })

    test('プロジェクト名が profile.json の値と一致する', async ({page}) => {
        const profile = await fetchProfile()

        await page.locator('#projects').scrollIntoViewIfNeeded()
        for (const project of profile.projects) {
            await expect(page.locator('.project-card-name', {hasText: project.name})).toBeVisible()
        }
    })

    test('ヒーローセクションのスクリーンショット', async ({page}) => {
        await page.locator('#hero').scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)
        await expect(page.locator('#hero')).toHaveScreenshot('hero.png', {maxDiffPixelRatio: 0.02})
    })

    test('Skills セクションのスクリーンショット', async ({page}) => {
        await page.locator('#skills').scrollIntoViewIfNeeded()
        await page.waitForTimeout(300)
        await expect(page.locator('#skills')).toHaveScreenshot('skills.png', {
            maxDiffPixelRatio: 0.02
        })
    })

    test('Projects セクションのスクリーンショット', async ({page}) => {
        await page.locator('#projects').scrollIntoViewIfNeeded()
        await page.waitForTimeout(300)
        await expect(page.locator('#projects')).toHaveScreenshot('projects.png', {
            maxDiffPixelRatio: 0.02
        })
    })

    test('ページ全体のスクリーンショット', async ({page}) => {
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveScreenshot('full-page.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.02
        })
    })
})
