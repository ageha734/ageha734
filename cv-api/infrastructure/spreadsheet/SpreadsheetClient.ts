export interface SheetRow {
    [key: string]: unknown
}

export function parseRows(rows: unknown[][]): SheetRow[] {
    if (rows.length < 2) return []
    const headers = rows[0].map(h => {
        if (typeof h === 'string') return h.trim()
        if (typeof h === 'number' || typeof h === 'boolean') return String(h).trim()
        return ''
    })
    return rows
        .slice(1)
        .filter(row => row.some(cell => cell !== ''))
        .map(row => {
            const obj: SheetRow = {}
            headers.forEach((h, i) => {
                obj[h] = row[i] === '' ? null : row[i]
            })
            return obj
        })
}
