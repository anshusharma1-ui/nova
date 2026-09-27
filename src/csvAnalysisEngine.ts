export type CsvDataType = 'number' | 'boolean' | 'date' | 'text' | 'mixed' | 'empty'

export interface CsvColumnSummary {
  name: string
  type: CsvDataType
  nonEmptyCount: number
  missingCount: number
  distinctCount: number
}

export interface CsvNumericStatistics {
  column: string
  count: number
  minimum: number
  maximum: number
  average: number
  median: number
  total: number
}

export interface CsvFinding {
  id: string
  title: string
  detail: string
  investigation: string
}

export interface CsvAnalysis {
  rowCount: number
  columns: readonly CsvColumnSummary[]
  numericStatistics: readonly CsvNumericStatistics[]
  preview: readonly (readonly string[])[]
  findings: readonly CsvFinding[]
}

export class CsvAnalysisError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CsvAnalysisError'
  }
}

function parseRows(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let insideQuotes = false
  let quoteClosed = false

  const finishRow = () => {
    row.push(field)
    if (row.length > 1 || row[0].trim() !== '') rows.push(row)
    row = []
    field = ''
    quoteClosed = false
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (insideQuotes) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        insideQuotes = false
        quoteClosed = true
      } else {
        field += character
      }
      continue
    }
    if (quoteClosed) {
      if (character === ',') {
        row.push(field)
        field = ''
        quoteClosed = false
      } else if (character === '\n' || character === '\r') {
        if (character === '\r' && text[index + 1] === '\n') index += 1
        finishRow()
      } else if (character !== ' ' && character !== '\t') {
        throw new CsvAnalysisError('A quoted value is followed by unexpected text. Check the CSV quoting.')
      }
      continue
    }
    if (character === '"') {
      if (field.length > 0) throw new CsvAnalysisError('A quote appears inside an unquoted value. Check the CSV formatting.')
      insideQuotes = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      finishRow()
    } else {
      field += character
    }
  }

  if (insideQuotes) throw new CsvAnalysisError('A quoted value was not closed. Check the CSV formatting.')
  if (row.length > 0 || field.length > 0 || quoteClosed) finishRow()
  return rows
}

function uniqueHeaders(rawHeaders: readonly string[]) {
  const used = new Map<string, number>()
  return rawHeaders.map((header, index) => {
    const name = header.trim() || `Column ${index + 1}`
    const key = name.toLocaleLowerCase()
    const count = (used.get(key) ?? 0) + 1
    used.set(key, count)
    return count === 1 ? name : `${name} (${count})`
  })
}

function numberValue(value: string): number | null {
  if (!value.trim()) return null
  const parsed = Number(value.trim())
  return Number.isFinite(parsed) ? parsed : null
}

function isDateValue(value: string) {
  return /^\d{4}-\d{1,2}-\d{1,2}(?:[T ][\d:.+\-Z]+)?$/.test(value.trim()) && Number.isFinite(Date.parse(value))
}

function columnType(values: readonly string[]): CsvDataType {
  const populated = values.filter((value) => value.trim() !== '')
  if (populated.length === 0) return 'empty'
  if (populated.every((value) => numberValue(value) !== null)) return 'number'
  if (populated.every((value) => /^(true|false|yes|no)$/i.test(value.trim()))) return 'boolean'
  if (populated.every(isDateValue)) return 'date'
  if (populated.some((value) => numberValue(value) !== null)) return 'mixed'
  return 'text'
}

function median(sortedValues: readonly number[]) {
  const middle = Math.floor(sortedValues.length / 2)
  return sortedValues.length % 2 === 0
    ? (sortedValues[middle - 1] + sortedValues[middle]) / 2
    : sortedValues[middle]
}

function quartile(sortedValues: readonly number[], fraction: number) {
  const position = (sortedValues.length - 1) * fraction
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (position - lower)
}

function displayValue(value: string) {
  const singleLine = value.replace(/\s+/g, ' ').trim()
  return singleLine.length > 48 ? `${singleLine.slice(0, 45)}...` : singleLine
}

export function analyzeCsvText(input: string, previewLimit = 8): CsvAnalysis {
  const parsedRows = parseRows(input)
  if (parsedRows.length === 0) throw new CsvAnalysisError('This CSV is empty. Add a header row and at least one data row.')
  const headers = uniqueHeaders(parsedRows[0])
  const rows = parsedRows.slice(1)
  if (rows.length === 0) throw new CsvAnalysisError('This CSV has column names but no data rows to analyze.')

  rows.forEach((row, index) => {
    if (row.length !== headers.length) {
      throw new CsvAnalysisError(`Row ${index + 2} has ${row.length} values; expected ${headers.length}. Check the delimiters.`)
    }
  })

  const valuesByColumn = headers.map((_, columnIndex) => rows.map((row) => row[columnIndex]))
  const columns = headers.map((name, index): CsvColumnSummary => {
    const values = valuesByColumn[index]
    const nonEmpty = values.filter((value) => value.trim() !== '')
    return {
      name,
      type: columnType(values),
      nonEmptyCount: nonEmpty.length,
      missingCount: values.length - nonEmpty.length,
      distinctCount: new Set(nonEmpty.map((value) => value.trim())).size,
    }
  })

  const numericStatistics = columns.flatMap((column, index): CsvNumericStatistics[] => {
    if (column.type !== 'number') return []
    const values = valuesByColumn[index].map(numberValue).filter((value): value is number => value !== null)
    const sorted = [...values].sort((left, right) => left - right)
    const total = values.reduce((sum, value) => sum + value, 0)
    return [{ column: column.name, count: values.length, minimum: sorted[0], maximum: sorted[sorted.length - 1], average: total / values.length, median: median(sorted), total }]
  })

  const findings: CsvFinding[] = []
  const missing = columns.filter((column) => column.missingCount > 0).sort((left, right) => right.missingCount - left.missingCount)
  const missingTotal = missing.reduce((sum, column) => sum + column.missingCount, 0)
  if (missingTotal > 0) {
    findings.push({
      id: 'missing-values',
      title: 'Missing values',
      detail: `${missingTotal} blank cells across ${missing.length} column${missing.length === 1 ? '' : 's'}. ${missing[0].name} has the most (${missing[0].missingCount}).`,
      investigation: `Check whether blanks in ${missing[0].name} represent unknown values or a consistent exclusion.`,
    })
  }

  const repeated = columns.flatMap((column, index) => {
    const counts = new Map<string, number>()
    valuesByColumn[index].forEach((value) => {
      const key = value.trim()
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return [...counts.entries()].filter(([, count]) => count > 1).map(([value, count]) => ({ column: column.name, value, count }))
  }).sort((left, right) => right.count - left.count).slice(0, 2)
  repeated.forEach((item, index) => findings.push({
    id: `repeated-${index}`,
    title: 'Repeated values',
    detail: `${JSON.stringify(displayValue(item.value))} appears ${item.count} times in ${item.column}.`,
    investigation: `Review repeated ${item.column} entries to confirm they are expected and not duplicate records.`,
  }))

  const numericIndices = columns.flatMap((column, index) => column.type === 'number' ? [index] : [])
  const trends = numericIndices.flatMap((index) => {
    const values = valuesByColumn[index].map(numberValue)
    if (values.some((value) => value === null) || values.length < 3) return []
    const sequence = values as number[]
    const increasing = sequence.every((value, position) => position === 0 || value >= sequence[position - 1]) && sequence.at(-1)! > sequence[0]
    const decreasing = sequence.every((value, position) => position === 0 || value <= sequence[position - 1]) && sequence.at(-1)! < sequence[0]
    if (!increasing && !decreasing) return []
    return [{ column: columns[index].name, direction: increasing ? 'increases' : 'decreases', first: sequence[0], last: sequence.at(-1)! }]
  }).slice(0, 2)
  trends.forEach((trend, index) => findings.push({
    id: `trend-${index}`,
    title: 'Consistent row-order trend',
    detail: `${trend.column} ${trend.direction} from ${trend.first} to ${trend.last} in file row order.`,
    investigation: `Check whether the row order for ${trend.column} represents a meaningful sequence before interpreting this trend.`,
  }))

  const outliers = numericIndices.flatMap((columnIndex) => {
    const values = valuesByColumn[columnIndex].map(numberValue)
    if (values.some((value) => value === null) || values.length < 5) return []
    const numbers = values as number[]
    const sorted = [...numbers].sort((left, right) => left - right)
    const spread = quartile(sorted, 0.75) - quartile(sorted, 0.25)
    const lower = quartile(sorted, 0.25) - 1.5 * spread
    const upper = quartile(sorted, 0.75) + 1.5 * spread
    return numbers.flatMap((value, rowIndex) => value >= lower && value <= upper ? [] : [{ column: headers[columnIndex], value, row: rowIndex + 2, direction: value < lower ? 'low' : 'high' }])
  }).slice(0, 3)
  outliers.forEach((item, index) => findings.push({
    id: `outlier-${index}`,
    title: `Unusually ${item.direction} value`,
    detail: `${item.column} is ${item.value} at data row ${item.row}, outside the 1.5× IQR range.`,
    investigation: `Verify the ${item.column} value at data row ${item.row} against its source before treating it as an exception.`,
  }))

  let largestChange: { column: string; from: number; to: number; row: number } | null = null
  for (const columnIndex of numericIndices) {
    for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex += 1) {
      const from = numberValue(rows[rowIndex][columnIndex])
      const to = numberValue(rows[rowIndex + 1][columnIndex])
      if (from === null || to === null) continue
      if (!largestChange || Math.abs(to - from) > Math.abs(largestChange.to - largestChange.from)) {
        largestChange = { column: headers[columnIndex], from, to, row: rowIndex + 2 }
      }
    }
  }
  if (largestChange !== null) {
    const change = largestChange
    findings.push({
      id: 'largest-adjacent-change',
      title: 'Largest adjacent-row change',
      detail: `${change.column} changes from ${change.from} to ${change.to} between rows ${change.row} and ${change.row + 1}.`,
      investigation: `Check what differentiates rows ${change.row} and ${change.row + 1} in ${change.column}.`,
    })
  }

  return { rowCount: rows.length, columns, numericStatistics, preview: rows.slice(0, previewLimit), findings }
}
