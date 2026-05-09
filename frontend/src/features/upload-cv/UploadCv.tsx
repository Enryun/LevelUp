import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, FileText, Loader2, Upload } from 'lucide-react'
import { apiUrl } from '../../config'
import './UploadCv.css'

const allowedFileTypes = ['application/pdf']

const maxFileSizeInBytes = 8 * 1024 * 1024

type UploadState = 'idle' | 'selected' | 'analyzing' | 'ready'

export type CvExtractResponse = {
  filename: string
  text: string
  page_count: number
}

type UploadCvProps = {
  onExtract?: (cv: CvExtractResponse) => void
  onClear?: () => void
  onNext?: () => void
}

function formatFileSize(size: number) {
  const megabytes = size / (1024 * 1024)
  return `${megabytes.toFixed(1)} MB`
}

export function UploadCv({ onExtract, onClear, onNext }: UploadCvProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [extractedCv, setExtractedCv] = useState<CvExtractResponse | null>(null)

  const validateAndSelectFile = (nextFile?: File) => {
    if (!nextFile) {
      return
    }

    if (!allowedFileTypes.includes(nextFile.type)) {
      setFile(null)
      setUploadState('idle')
      setExtractedCv(null)
      onClear?.()
      setError('Please upload a PDF file.')
      return
    }

    if (nextFile.size > maxFileSizeInBytes) {
      setFile(null)
      setUploadState('idle')
      setExtractedCv(null)
      onClear?.()
      setError('Please upload a CV smaller than 8 MB.')
      return
    }

    setFile(nextFile)
    setError('')
    setExtractedCv(null)
    onClear?.()
    setUploadState('selected')
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    validateAndSelectFile(event.target.files?.[0])
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    validateAndSelectFile(event.dataTransfer.files[0])
  }

  const handleAnalyze = async () => {
    if (uploadState === 'ready' && onNext) {
      onNext()
      return
    }

    if (!file) {
      setError('Choose a CV before starting analysis.')
      return
    }

    setError('')
    setUploadState('analyzing')
    setExtractedCv(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(apiUrl('/api/cv/extract-text'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.detail ?? 'CV extraction failed.')
      }

      const payload = (await response.json()) as CvExtractResponse

      setExtractedCv(payload)
      onExtract?.(payload)
      setUploadState('ready')
    } catch (error) {
      setUploadState('selected')
      setError(error instanceof Error ? error.message : 'CV extraction failed.')
    }
  }

  return (
    <section className="upload-cv" aria-labelledby="upload-cv-title">
      <div className="upload-cv-header">
        <div>
          <p className="eyebrow">CV intake</p>
          <h2 id="upload-cv-title">Upload your CV for analysis</h2>
        </div>
        <span className={`upload-status ${uploadState}`}>
          {uploadState === 'ready' ? 'Ready for AI' : uploadState}
        </span>
      </div>

      <div
        className={`drop-zone ${file ? 'has-file' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="file-input"
        />

        <div className="drop-icon">
          {file ? <FileText size={26} /> : <Upload size={26} />}
        </div>

        <div className="drop-copy">
          <h3>{file ? file.name : 'Drop your CV here'}</h3>
          <p>
            {file
              ? `${formatFileSize(file.size)} selected`
              : 'PDF up to 8 MB'}
          </p>
        </div>

        <button
          type="button"
          className="browse-button"
          onClick={() => inputRef.current?.click()}
        >
          Browse file
        </button>
      </div>

      {error && (
        <div className="upload-message error" role="alert">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {uploadState === 'ready' && (
        <div className="upload-message success">
          <CheckCircle2 size={18} />
          Extracted {extractedCv?.page_count ?? 0} page
          {extractedCv?.page_count === 1 ? '' : 's'} from {extractedCv?.filename}.
        </div>
      )}

      {extractedCv && (
        <div className="cv-text-preview">
          <h3>Raw CV text</h3>
          <pre>{extractedCv.text || 'No selectable text found in this PDF.'}</pre>
        </div>
      )}

      <div className="upload-actions">
        <button
          type="button"
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={uploadState === 'analyzing'}
        >
          {uploadState === 'analyzing' ? (
            <>
              <Loader2 size={18} className="spin" />
              Analyzing CV
            </>
          ) : uploadState === 'ready' ? (
            <>
              Start micro-interview
              <ArrowRight size={18} />
            </>
          ) : (
            <>
              <Upload size={18} />
              Analyze CV
            </>
          )}
        </button>
      </div>
    </section>
  )
}
