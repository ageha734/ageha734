import path from 'node:path'
import {expect, test} from '@playwright/test'

/**
 * ポートフォリオページ E2E テスト
 *
 * セットアップ (api.setup.ts) で profile.json が更新・HTML が再生成された後に実行される
 * DOM 検証 + スクリーンショット比較でページが正しく反映されているかを確認する
 */

test.describe('ポートフォリオページ', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('/')
    })

    // ─── ページ基本構造 ───────────────────────────────────────

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

    // ─── Skills セクション ───────────────────────────────────

    test('Skills セクションにスキルタグが表示されている', async ({page}) => {
        await page.locator('#skills').scrollIntoViewIfNeeded()
        const skillTags = page.locator('.skill-tag')
        await expect(skillTags.first()).toBeVisible()
        const count = await skillTags.count()
        expect(count).toBeGreaterThan(0)
    })

    test('Advanced スキルが profile.json の値と一致する', async ({page}) => {
        const profilePath = path.resolve(__dirname, '../../data/profile.json')
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const profile = require(profilePath) as {skills: {advanced: {name: string}[]}}
        const advancedSkills = profile.skills.advanced.map(s => s.name)

        await page.locator('#skills').scrollIntoViewIfNeeded()
        const advancedTags = page.locator('.skill-tag.advanced')

        for (const skillName of advancedSkills) {
            await expect(advancedTags.filter({hasText: skillName})).toBeVisible()
        }
    })

    // ─── Projects セクション ─────────────────────────────────

    test('Projects セクションにプロジェクトカードが表示されている', async ({page}) => {
        await page.locator('#projects').scrollIntoViewIfNeeded()
        const cards = page.locator('.project-card')
        await expect(cards.first()).toBeVisible()
        const count = await cards.count()
        expect(count).toBeGreaterThan(0)
    })

    test('プロジェクト名が profile.json の値と一致する', async ({page}) => {
        const profilePath = path.resolve(__dirname, '../../data/profile.json')
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const profile = require(profilePath) as {projects: {name: string}[]}

        await page.locator('#projects').scrollIntoViewIfNeeded()
        for (const project of profile.projects) {
            await expect(page.locator('.project-card-name', {hasText: project.name})).toBeVisible()
        }
    })

    // ─── スクリーンショット比較 ───────────────────────────────

    test('ヒーローセクションのスクリーンショット', async ({page}) => {
        await page.locator('#hero').scrollIntoViewIfNeeded()
        await page.waitForTimeout(500) // アニメーション待ち
        await expect(page.locator('#hero')).toHaveScreenshot('hero.png', {
            maxDiffPixelRatio: 0.02
        })
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
