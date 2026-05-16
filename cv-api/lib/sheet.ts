export interface SheetRow {
    [key: string]: unknown
}

export function parseRows(rows: unknown[][]): SheetRow[] {
    if (rows.length < 2) return []
    const headers = (rows[0] as unknown[]).map(h => String(h).trim())
    return rows
        .slice(1)
        .filter(row => (row as unknown[]).some(cell => cell !== ''))
        .map(row => {
            const obj: SheetRow = {}
            headers.forEach((h, i) => {
                obj[h] = (row as unknown[])[i] === '' ? null : (row as unknown[])[i]
            })
            return obj
        })
}
