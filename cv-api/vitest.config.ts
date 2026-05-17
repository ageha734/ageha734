import {defineConfig} from 'vitest/config'

export default defineConfig({
    test: {
        include: [
            'infrastructure/**/*.test.ts',
            'domain/**/*.test.ts',
            'presentation/**/*.test.ts',
            'integration/**/*.test.ts'
        ],
        globals: true
    }
})
