import type { CsvAnalysis, CsvFinding, CsvFindingEvidence } from './csvAnalysisEngine'

export interface NovaInsight {
  headline: string
  explanation: string
  evidence: readonly CsvFindingEvidence[]
  investigation: string
  dataQualityNote: string
  traceability: string
  hasStrongPattern: boolean
}

const findingPriority: Record<CsvFinding['kind'], number> = {
  outlier: 0,
  'adjacent-change': 1,
  trend: 2,
  'missing-values': 3,
  'repeated-value': 4,
}

function evidenceValue(finding: CsvFinding, label: string) {
  return finding.evidence.find((item) => item.label === label)?.value ?? ''
}

function evidenceWithPrefix(finding: CsvFinding, prefix: string) {
  return finding.evidence.find((item) => item.label.startsWith(`${prefix} ·`))
}

function getHeadline(finding: CsvFinding) {
  if (finding.kind === 'outlier') {
    const column = evidenceValue(finding, 'Column')
    const value = evidenceValue(finding, 'Observed value')
    const location = evidenceValue(finding, 'Location')
    const direction = finding.title.toLowerCase().includes('high') ? 'high' : 'low'
    return `${column} reached ${value} at ${location}, an unusually ${direction} value.`
  }

  if (finding.kind === 'adjacent-change') {
    const column = evidenceValue(finding, 'Column')
    const previousEvidence = evidenceWithPrefix(finding, 'Previous')
    const nextEvidence = evidenceWithPrefix(finding, 'Next')
    const previous = previousEvidence?.value ?? ''
    const next = nextEvidence?.value ?? ''
    const change = evidenceValue(finding, 'Change')
    const fromRow = previousEvidence?.label.slice('Previous ·'.length).trim() ?? ''
    const toRow = nextEvidence?.label.slice('Next ·'.length).trim() ?? ''
    const movement = Number(change) >= 0 ? 'rose' : 'fell'
    return `${column} ${movement} by ${change.replace(/^[+-]/, '')} from ${fromRow || 'one row'} to ${toRow || 'the next row'} (${previous} to ${next}).`
  }

  if (finding.kind === 'trend') {
    const column = evidenceValue(finding, 'Column')
    const direction = evidenceValue(finding, 'Direction')
    const first = evidenceWithPrefix(finding, 'First')
    const last = evidenceWithPrefix(finding, 'Last')
    const change = evidenceValue(finding, 'Change across rows')
    const firstRow = first?.label.slice('First ·'.length).trim() ?? 'the first row'
    const lastRow = last?.label.slice('Last ·'.length).trim() ?? 'the last row'
    return `${column} moves consistently ${direction} from ${first?.value} at ${firstRow} to ${last?.value} at ${lastRow} in CSV row order (${change} overall).`
  }

  if (finding.kind === 'missing-values') {
    const count = evidenceValue(finding, 'Blank cells')
    const missingColumn = finding.evidence.find((item) => item.label.startsWith('Missing in '))
    const column = missingColumn?.label.slice('Missing in '.length) ?? 'one column'
    return `${count} blank cells were found, with the most in ${column}.`
  }

  const column = evidenceValue(finding, 'Column')
  const value = evidenceValue(finding, 'Repeated value')
  const occurrences = evidenceValue(finding, 'Occurrences')
  return `${value} repeats ${occurrences} times in ${column}.`
}

function dataQualityNote(analysis: CsvAnalysis) {
  const numericColumnCount = analysis.numericStatistics.length
  const missingCellCount = analysis.columns.reduce((sum, column) => sum + column.missingCount, 0)
  const notes = [`Based on ${analysis.rowCount} rows and ${analysis.columns.length} detected columns.`]

  if (analysis.rowCount <= 5) notes.push(`Small sample: only ${analysis.rowCount} data ${analysis.rowCount === 1 ? 'row is' : 'rows are'} available, so findings may not generalize.`)
  if (missingCellCount > 0) {
    const affectedColumns = analysis.columns.filter((column) => column.missingCount > 0).length
    notes.push(`${missingCellCount} missing ${missingCellCount === 1 ? 'value' : 'values'} across ${affectedColumns} ${affectedColumns === 1 ? 'column' : 'columns'}.`)
  }
  if (numericColumnCount === 0) notes.push('No fully numeric columns were detected; numeric trend and outlier checks are unavailable.')

  return notes.join(' ')
}

function countEvidence(analysis: CsvAnalysis): CsvFindingEvidence[] {
  const evidence: CsvFindingEvidence[] = [
    { label: 'Rows analyzed', value: String(analysis.rowCount) },
    { label: 'Columns detected', value: String(analysis.columns.length) },
  ]
  const numericColumnCount = analysis.numericStatistics.length
  if (numericColumnCount > 0) evidence.push({ label: 'Numeric columns', value: String(numericColumnCount) })
  const missingCellCount = analysis.columns.reduce((sum, column) => sum + column.missingCount, 0)
  if (missingCellCount > 0) evidence.push({ label: 'Missing values', value: String(missingCellCount) })
  return evidence.slice(0, 4)
}

export function generateNovaInsight(analysis: CsvAnalysis): NovaInsight {
  const strongFinding = [...analysis.findings]
    .filter((finding) => finding.strength === 'strong')
    .sort((left, right) => findingPriority[left.kind] - findingPriority[right.kind] || right.strengthScore - left.strengthScore)[0]
  const supportingFinding = [...analysis.findings]
    .sort((left, right) => findingPriority[left.kind] - findingPriority[right.kind])[0]
  const selectedFinding = strongFinding ?? supportingFinding
  const hasStrongPattern = strongFinding !== undefined

  if (!selectedFinding) {
    const headline = analysis.numericStatistics.length === 0
      ? 'No numeric pattern can be summarized from this file.'
      : 'No notable pattern stands out in this file.'
    return {
      headline,
      explanation: 'The deterministic checks did not find a qualifying trend, unusual value, large row-to-row change, missing value, or repeated value.',
      evidence: countEvidence(analysis),
      investigation: 'If relevant, add more rows or columns with context and run the analysis again.',
      dataQualityNote: dataQualityNote(analysis),
      traceability: 'No finding rules were triggered by the parsed rows and calculated statistics.',
      hasStrongPattern: false,
    }
  }

  return {
    headline: hasStrongPattern ? getHeadline(selectedFinding) : 'No strong pattern stands out in this file.',
    explanation: hasStrongPattern
      ? selectedFinding.detail
      : `A supporting observation was detected: ${selectedFinding.detail} It did not meet the analyzer’s strong-pattern rule.`,
    evidence: selectedFinding.evidence.filter((item) => item.label !== 'Direction').slice(0, 4),
    investigation: selectedFinding.investigation,
    dataQualityNote: dataQualityNote(analysis),
    traceability: selectedFinding.traceability,
    hasStrongPattern,
  }
}
