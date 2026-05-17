import {expect, test} from '@playwright/test'

const GITHUB_PAGES_URL = process.env['GITHUB_PAGES_URL'] ?? ''
const TOKEN = process.env['GH_TOKEN'] ?? ''
const REPO = process.env['GITHUB_REPOSITORY'] ?? ''

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

const workflowTest = TOKEN ? test : test.skip

for (const workflow of ['blog-post-sync.yml', 'sync-from-gas.yml']) {
    workflowTest(`シナリオ5: ${workflow} を dispatch して success で完了する`, async () => {
        test.setTimeout(6 * 60 * 1000)

        const headers = {
            Authorization: `Bearer ${TOKEN}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }

        const beforeDispatch = new Date().toISOString()

        const dispatchRes = await fetch(
            `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/dispatches`,
            {method: 'POST', headers, body: JSON.stringify({ref: 'master'})}
        )
        expect(dispatchRes.status).toBe(204)

        // dispatch直後はrun IDが未生成なので少し待つ
        await new Promise(r => setTimeout(r, 5000))

        // dispatch後に作成されたrunを取得
        const runsRes = await fetch(
            `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/runs?per_page=5`,
            {headers}
        )
        expect(runsRes.status).toBe(200)
        const runsBody = (await runsRes.json()) as {
            workflow_runs: {
                id: number
                created_at: string
                status: string
                conclusion: string | null
            }[]
        }
        const run = runsBody.workflow_runs.find(r => r.created_at >= beforeDispatch)
        expect(run, `${workflow} の実行が見つからない`).toBeDefined()
        if (!run) return
        const runId = run.id

        // completedになるまでポーリング（最大5分）
        const deadline = Date.now() + 5 * 60 * 1000
        let conclusion: string | null = null
        while (Date.now() < deadline) {
            await new Promise(r => setTimeout(r, 10000))
            const runRes = await fetch(
                `https://api.github.com/repos/${REPO}/actions/runs/${runId}`,
                {headers}
            )
            const runBody = (await runRes.json()) as {status: string; conclusion: string | null}
            if (runBody.status === 'completed') {
                conclusion = runBody.conclusion
                break
            }
        }

        expect(conclusion, `${workflow} がタイムアウト前に完了しなかった`).not.toBeNull()
        expect(conclusion).toBe('success')
    })
}
