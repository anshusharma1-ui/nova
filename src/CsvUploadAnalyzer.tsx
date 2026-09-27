import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { FileSpreadsheet, Trash2, Upload } from 'lucide-react'
import { analyzeCsvText, CsvAnalysisError, type CsvAnalysis, type CsvDataType } from './csvAnalysisEngine'

const MAX_CSV_FILE_SIZE = 5 * 1024 * 1024
const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const typeLabels: Record<CsvDataType, string> = {
  number: 'Number',
  boolean: 'Boolean',
  date: 'Date',
  text: 'Text',
  mixed: 'Mixed',
  empty: 'Empty',
}

interface SelectedCsvFile {
  name: string
  size: number
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function CsvAnalyzer() {
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null)
  const [selectedFile, setSelectedFile] = useState<SelectedCsvFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const analysisRunRef = useRef(0)

  async function analyzeFile(file: File | undefined) {
    if (!file) return

    const runId = analysisRunRef.current + 1
    analysisRunRef.current = runId
    setSelectedFile({ name: file.name, size: file.size })
    setAnalysis(null)
    setError(null)
    setIsAnalyzing(false)

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Choose a file with the .csv extension.')
      return
    }
    if (file.size > MAX_CSV_FILE_SIZE) {
      setError('This file is larger than 5 MB. Choose a smaller CSV to analyze in your browser.')
      return
    }
    if (file.size === 0) {
      setError('This file is empty. Choose a CSV that includes a header row and data.')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = analyzeCsvText(await file.text())
      if (analysisRunRef.current === runId) setAnalysis(result)
    } catch (caughtError) {
      if (analysisRunRef.current !== runId) return
      setError(caughtError instanceof CsvAnalysisError
        ? caughtError.message
        : 'The file could not be read. Check that it is a valid CSV and try again.')
    } finally {
      if (analysisRunRef.current === runId) setIsAnalyzing(false)
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    void analyzeFile(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    void analyzeFile(event.dataTransfer.files[0])
  }

  function clearAnalysis() {
    analysisRunRef.current += 1
    setAnalysis(null)
    setSelectedFile(null)
    setError(null)
    setIsAnalyzing(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="csv-analyzer section-shell" id="csv-analyzer" aria-labelledby="csv-analyzer-title" aria-busy={isAnalyzing}>
      <div className="section-kicker"><span>CSV</span><span>Private, in-browser analysis</span></div>
      <div className="csv-analyzer-heading">
        <h2 id="csv-analyzer-title">Analyze your <em>data.</em></h2>
        <p>Inspect columns, summary statistics, and deterministic patterns. Your file stays in this browser and is never uploaded.</p>
      </div>

      <div
        className={`csv-dropzone${isDragging ? ' is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false)
        }}
        onDrop={handleDrop}
        aria-describedby="csv-drop-hint"
      >
        <div className="csv-dropzone-copy">
          <span className="csv-upload-icon" aria-hidden="true"><Upload size={20} /></span>
          <div>
            <strong>Drop a CSV file to begin</strong>
            <span id="csv-drop-hint">CSV files only · Up to 5 MB · Processed locally</span>
          </div>
        </div>
        <button className="csv-choose-button" type="button" onClick={() => inputRef.current?.click()} disabled={isAnalyzing}>
          Choose CSV
        </button>
        <input
          ref={inputRef}
          className="csv-file-input"
          type="file"
          accept=".csv,text/csv"
          aria-label="Choose a CSV file"
          tabIndex={-1}
          onChange={handleFileInput}
        />
      </div>

      {selectedFile && (
        <div className="csv-file-meta">
          <FileSpreadsheet size={18} aria-hidden="true" />
          <span className="csv-file-name">{selectedFile.name}</span>
          <span className="csv-file-size">{formatFileSize(selectedFile.size)}</span>
          <button className="csv-clear-button" type="button" onClick={clearAnalysis}>
            <Trash2 size={15} aria-hidden="true" /> Remove data
          </button>
        </div>
      )}

      {isAnalyzing && <p className="csv-status" role="status" aria-live="polite">Analyzing this file in your browser…</p>}
      {error && (
        <div className="csv-error" role="alert" aria-live="assertive">
          <strong>We couldn’t analyze this file.</strong>
          <p>{error}</p>
        </div>
      )}

      {analysis && (
        <div className="csv-results">
          <div className="csv-results-heading">
            <div>
              <p>ANALYSIS GENERATED FROM YOUR UPLOADED DATA</p>
              <h3>What’s in the file</h3>
            </div>
            <span>{analysis.rowCount} rows · {analysis.columns.length} columns</span>
          </div>

          <div className="csv-results-grid">
            <section className="csv-result-section" aria-labelledby="csv-pattern-title">
              <h4 id="csv-pattern-title">Patterns detected</h4>
              {analysis.findings.length > 0 ? (
                <ul className="csv-findings">
                  {analysis.findings.map((finding) => (
                    <li key={finding.id}>
                      <strong>{finding.title}</strong>
                      <p>{finding.detail}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="csv-empty-note">No notable missing values, repeats, trends, outliers, or adjacent-row changes were detected by these checks.</p>
              )}
              <div className="csv-investigation">
                <h5>Suggested Investigation</h5>
                {analysis.findings.length > 0 ? (
                  <ul>{analysis.findings.map((finding) => <li key={finding.id}>{finding.investigation}</li>)}</ul>
                ) : (
                  <p>No follow-up is suggested from the patterns detected in this file.</p>
                )}
              </div>
            </section>

            <section className="csv-result-section" aria-labelledby="csv-columns-title">
              <h4 id="csv-columns-title">Columns and data types</h4>
              <div className="csv-table-wrap" role="region" aria-label="Column types and missing values" tabIndex={0}>
                <table className="csv-table">
                  <thead><tr><th scope="col">Column</th><th scope="col">Type</th><th scope="col">Missing</th><th scope="col">Unique</th></tr></thead>
                  <tbody>
                    {analysis.columns.map((column) => (
                      <tr key={column.name}>
                        <th scope="row">{column.name}</th>
                        <td>{typeLabels[column.type]}</td>
                        <td>{column.missingCount}</td>
                        <td>{column.distinctCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h4 className="csv-statistics-title">Numeric statistics</h4>
              {analysis.numericStatistics.length > 0 ? (
                <div className="csv-table-wrap" role="region" aria-label="Numeric column statistics" tabIndex={0}>
                  <table className="csv-table csv-statistics-table">
                    <thead><tr><th scope="col">Column</th><th scope="col">Count</th><th scope="col">Minimum</th><th scope="col">Maximum</th><th scope="col">Average</th><th scope="col">Median</th><th scope="col">Total</th></tr></thead>
                    <tbody>
                      {analysis.numericStatistics.map((statistic) => (
                        <tr key={statistic.column}>
                          <th scope="row">{statistic.column}</th>
                          <td>{statistic.count}</td>
                          <td>{numberFormatter.format(statistic.minimum)}</td>
                          <td>{numberFormatter.format(statistic.maximum)}</td>
                          <td>{numberFormatter.format(statistic.average)}</td>
                          <td>{numberFormatter.format(statistic.median)}</td>
                          <td>{numberFormatter.format(statistic.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="csv-empty-note">No fully numeric columns were found. Column types and the data preview are still available.</p>
              )}
            </section>
          </div>

          <section className="csv-result-section csv-preview-section" aria-labelledby="csv-preview-title">
            <div className="csv-preview-heading">
              <h4 id="csv-preview-title">Data preview</h4>
              <span>First {analysis.preview.length} of {analysis.rowCount} rows</span>
            </div>
            <div className="csv-table-wrap csv-preview-wrap" role="region" aria-label="CSV preview; scroll horizontally to see additional columns" tabIndex={0}>
              <table className="csv-table csv-preview-table">
                <caption>Preview of the first rows in the uploaded CSV</caption>
                <thead><tr><th scope="col">Row</th>{analysis.columns.map((column) => <th scope="col" key={column.name}>{column.name}</th>)}</tr></thead>
                <tbody>
                  {analysis.preview.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <th scope="row">{rowIndex + 2}</th>
                      {row.map((value, columnIndex) => <td key={`${analysis.columns[columnIndex].name}-${columnIndex}`}>{value || <span className="csv-missing-value">Missing</span>}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <p className="csv-analysis-disclaimer">Analysis generated from your uploaded data. Calculations are deterministic and run in this browser; no data is uploaded or stored.</p>
        </div>
      )}
    </section>
  )
}

export default CsvAnalyzer