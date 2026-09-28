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

export type CsvFindingKind = 'missing-values' | 'repeated-value' | 'trend' | 'outlier' | 'adjacent-change'
export type CsvFindingStrength = 'strong' | 'supporting'

export interface CsvFindingEvidence {
  label: string
  value: string
}

export interface CsvFinding {
  id: string
  kind: CsvFindingKind
  strength: CsvFindingStrength
  strengthScore: number
  title: string
  detail: string
  investigation: string
  evidence: readonly CsvFindingEvidence[]
  traceability: string
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

function rowLabel(rowIndex: number, headers: readonly string[], columns: readonly CsvColumnSummary[], valuesByColumn: readonly (readonly string[])[]) {
  const descriptorIndex = columns.findIndex((column) => column.type === 'date' || column.type === 'text')
  const descriptorValue = descriptorIndex >= 0 ? valuesByColumn[descriptorIndex][rowIndex]?.trim() : ''
  return descriptorValue ? `${headers[descriptorIndex]}: ${displayValue(descriptorValue)}` : `Row ${rowIndex + 2}`
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
      kind: 'missing-values',
      strength: 'supporting',
      strengthScore: 0,
      title: 'Missing values',
      detail: `${missingTotal} blank cells across ${missing.length} column${missing.length === 1 ? '' : 's'}. ${missing[0].name} has the most (${missing[0].missingCount}).`,
      investigation: `Check whether blanks in ${missing[0].name} represent unknown values or a consistent exclusion.`,
      evidence: [
        { label: 'Blank cells', value: String(missingTotal) },
        { label: 'Affected columns', value: String(missing.length) },
        { label: `Missing in ${missing[0].name}`, value: String(missing[0].missingCount) },
      ],
      traceability: `Counted empty cells in each parsed column. ${missing[0].name} has the highest missing-value count.`,
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
    kind: 'repeated-value',
    strength: 'supporting',
    strengthScore: 0,
    title: 'Repeated values',
    detail: `${JSON.stringify(displayValue(item.value))} appears ${item.count} times in ${item.column}.`,
    investigation: `Review repeated ${item.column} entries to confirm they are expected and not duplicate records.`,
    evidence: [
      { label: 'Column', value: item.column },
      { label: 'Repeated value', value: JSON.stringify(displayValue(item.value)) },
      { label: 'Occurrences', value: String(item.count) },
    ],
    traceability: `Counted trimmed, non-empty values in ${item.column}; this value occurs ${item.count} times.`,
  }))

  const numericIndices = columns.flatMap((column, index) => column.type === 'number' ? [index] : [])
  const trends = numericIndices.flatMap((index) => {
    const values = valuesByColumn[index].map(numberValue)
    if (values.some((value) => value === null) || values.length < 3) return []
    const sequence = values as number[]
    const increasing = sequence.every((value, position) => position === 0 || value >= sequence[position - 1]) && sequence.at(-1)! > sequence[0]
    const decreasing = sequence.every((value, position) => position === 0 || value <= sequence[position - 1]) && sequence.at(-1)! < sequence[0]
    if (!increasing && !decreasing) return []
    const first = sequence[0]
    const last = sequence.at(-1)!
    const changePercent = first === 0 ? (last === 0 ? 0 : Infinity) : Math.abs((last - first) / Math.abs(first)) * 100
    const strengthScore = Number.isFinite(changePercent) ? changePercent : 100
    return [{ column: columns[index].name, direction: increasing ? 'increases' : 'decreases', first, last, changePercent, strengthScore, firstRow: rowLabel(0, headers, columns, valuesByColumn), lastRow: rowLabel(sequence.length - 1, headers, columns, valuesByColumn) }]
  }).slice(0, 2)
  trends.forEach((trend, index) => findings.push({
    id: `trend-${index}`,
    kind: 'trend',
    strength: trend.changePercent >= 20 ? 'strong' : 'supporting',
    strengthScore: trend.strengthScore,
    title: 'Consistent row-order trend',
    detail: `${trend.column} ${trend.direction} from ${trend.first} to ${trend.last} in file row order.`,
    investigation: `Check whether the row order for ${trend.column} represents a meaningful sequence before interpreting this trend.`,
    evidence: [
      { label: 'Column', value: trend.column },
      { label: 'Direction', value: trend.direction },
      { label: `First · ${trend.firstRow}`, value: String(trend.first) },
      { label: `Last · ${trend.lastRow}`, value: String(trend.last) },
      { label: 'Change across rows', value: Number.isFinite(trend.changePercent) ? `${trend.changePercent.toFixed(1)}%` : 'From zero' },
    ],
    traceability: `Detected at least three numeric values that never reverse direction in CSV row order. The change from first to last is ${Number.isFinite(trend.changePercent) ? `${trend.changePercent.toFixed(1)}%` : 'from zero'}.`,
  }))

  const outliers = numericIndices.flatMap((columnIndex) => {
    const values = valuesByColumn[columnIndex].map(numberValue)
    if (values.some((value) => value === null) || values.length < 5) return []
    const numbers = values as number[]
    const sorted = [...numbers].sort((left, right) => left - right)
    const spread = quartile(sorted, 0.75) - quartile(sorted, 0.25)
    const lower = quartile(sorted, 0.25) - 1.5 * spread
    const upper = quartile(sorted, 0.75) + 1.5 * spread
    return numbers.flatMap((value, rowIndex) => {
      if (value >= lower && value <= upper) return []
      const bound = value < lower ? lower : upper
      const strengthScore = spread === 0 ? 10 : Math.min(10, Math.abs(value - bound) / spread)
      return [{ column: headers[columnIndex], value, row: rowIndex + 2, rowLabel: rowLabel(rowIndex, headers, columns, valuesByColumn), direction: value < lower ? 'low' : 'high', bound, strengthScore }]
    })
  }).slice(0, 3)
  outliers.forEach((item, index) => findings.push({
    id: `outlier-${index}`,
    kind: 'outlier',
    strength: 'strong',
    strengthScore: item.strengthScore,
    title: `Unusually ${item.direction} value`,
    detail: `${item.column} is ${item.value} at data row ${item.row}, outside the 1.5× IQR range.`,
    investigation: `Verify the ${item.column} value at data row ${item.row} against its source before treating it as an exception.`,
    evidence: [
      { label: 'Column', value: item.column },
      { label: 'Observed value', value: String(item.value) },
      { label: 'Location', value: `${item.rowLabel} · CSV row ${item.row}` },
      { label: `${item.direction === 'high' ? 'Upper' : 'Lower'} IQR fence`, value: item.bound.toFixed(2) },
    ],
    traceability: `Flagged because ${item.value} falls ${item.direction} of the 1.5× IQR fence (${item.bound.toFixed(2)}) calculated from ${item.column}.`,
  }))

  let largestChange: { column: string; from: number; to: number; row: number } | null = null
  const adjacentDifferences: number[] = []
  for (const columnIndex of numericIndices) {
    for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex += 1) {
      const from = numberValue(rows[rowIndex][columnIndex])
      const to = numberValue(rows[rowIndex + 1][columnIndex])
      if (from === null || to === null) continue
      adjacentDifferences.push(Math.abs(to - from))
      if (!largestChange || Math.abs(to - from) > Math.abs(largestChange.to - largestChange.from)) {
        largestChange = { column: headers[columnIndex], from, to, row: rowIndex + 2 }
      }
    }
  }
  if (largestChange !== null) {
    const change = largestChange
    const difference = change.to - change.from
    const relativeChange = change.from === 0 ? (difference === 0 ? 0 : Infinity) : Math.abs(difference / Math.abs(change.from)) * 100
    const orderedDifferences = [...adjacentDifferences].sort((left, right) => left - right)
    const middle = Math.floor(orderedDifferences.length / 2)
    const medianDifference = orderedDifferences.length % 2 === 0
      ? (orderedDifferences[middle - 1] + orderedDifferences[middle]) / 2
      : orderedDifferences[middle]
    const isStrong = Number.isFinite(relativeChange) && relativeChange >= 25
      || !Number.isFinite(relativeChange) && difference !== 0
      || Math.abs(difference) > medianDifference * 2
    const fromRow = rowLabel(change.row - 2, headers, columns, valuesByColumn)
    const toRow = rowLabel(change.row - 1, headers, columns, valuesByColumn)
    findings.push({
      id: 'largest-adjacent-change',
      kind: 'adjacent-change',
      strength: isStrong ? 'strong' : 'supporting',
      strengthScore: Number.isFinite(relativeChange) ? relativeChange : 100,
      title: 'Largest adjacent-row change',
      detail: `${change.column} changes from ${change.from} to ${change.to} between ${fromRow} and ${toRow}.`,
      investigation: `Check what differentiates ${fromRow} and ${toRow} in ${change.column} before interpreting this change.`,
      evidence: [
        { label: 'Column', value: change.column },
        { label: `Previous · ${fromRow}`, value: String(change.from) },
        { label: `Next · ${toRow}`, value: String(change.to) },
        { label: 'Change', value: `${difference > 0 ? '+' : ''}${difference}` },
      ],
      traceability: `Compared adjacent numeric rows across all fully numeric columns. This is the largest absolute adjacent-row difference in ${change.column}: ${change.from} to ${change.to}${Number.isFinite(relativeChange) ? ` (${relativeChange.toFixed(1)}% of the previous value)` : ' from a zero baseline'}.`,
    })
  }

  return { rowCount: rows.length, columns, numericStatistics, preview: rows.slice(0, previewLimit), findings }
}
