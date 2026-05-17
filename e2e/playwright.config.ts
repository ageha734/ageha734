import {defineConfig} from '@playwright/test'

export default defineConfig({
    testDir: './tests',
    timeout: 60_000,
    retries: process.env['CI'] ? 2 : 0,
    use: {
        baseURL: process.env['PORTFOLIO_URL'] ?? 'http://localhost:8080',
        screenshot: 'only-on-failure',
        trace: 'on-first-retry'
    },
    snapshotDir: './snapshots',
    projects: [
        {
            name: 'setup',
            testMatch: /api\.setup\.ts/
        },
        {
            name: 'chromium',
            use: {browserName: 'chromium'},
            dependencies: ['setup']
        }
    ],
    webServer: process.env['PORTFOLIO_URL']
        ? undefined
        : {
              command: 'npx serve ../docs -p 8080 --no-clipboard',
              port: 8080,
              reuseExistingServer: true
          }
})
