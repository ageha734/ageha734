export const FIXTURES: Record<string, unknown[][]> = {
    certifications: [
        ['year', 'month', 'name_en', 'name_ja'],
        [2023, 11, 'AWS Certified Solutions Architect – Associate', 'AWS 認定ソリューションアーキテクト – アソシエイト'],
        [2024, 3, 'Google Cloud Professional Cloud Architect', 'Google Cloud プロフェッショナル クラウド アーキテクト'],
    ],
    work_experience: [
        ['company_en', 'company_ja', 'role_en', 'role_ja', 'start', 'end'],
        ['Example Corp', '株式会社Example', 'Backend Engineer', 'バックエンドエンジニア', '2022-04', '2024-03'],
        ['Current Co', '現職株式会社', 'Cloud Engineer', 'クラウドエンジニア', '2024-04', ''],
    ],
    skills: [
        ['category', 'name'],
        ['advanced', 'Go'],
        ['advanced', 'Kubernetes'],
        ['intermediate', 'TypeScript'],
    ],
    projects: [
        ['name', 'url', 'description_en', 'description_ja'],
        ['README.pet', 'https://github.com/impostor-syndromes/README.pet', 'Raise a pet on your Github profile screen!', 'Githubのプロフィール画面でペットを育てよう！'],
    ],
}
