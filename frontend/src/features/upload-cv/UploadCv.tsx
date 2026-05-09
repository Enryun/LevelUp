import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { AlertCircle, CheckCircle2, FileText, Loader2, Upload } from 'lucide-react'
import './UploadCv.css'

const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const maxFileSizeInBytes = 8 * 1024 * 1024

type UploadState = 'idle' | 'selected' | 'analyzing' | 'ready'

function formatFileSize(size: number) {
  const megabytes = size / (1024 * 1024)
  return `${megabytes.toFixed(1)} MB`
}

export function UploadCv() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')

  const validateAndSelectFile = (nextFile?: File) => {
    if (!nextFile) {
      return
    }

    if (!allowedFileTypes.includes(nextFile.type)) {
      setFile(null)
      setUploadState('idle')
      setError('Please upload a PDF, DOC, or DOCX file.')
      return
    }

    if (nextFile.size > maxFileSizeInBytes) {
      setFile(null)
      setUploadState('idle')
      setError('Please upload a CV smaller than 8 MB.')
      return
    }

    setFile(nextFile)
    setError('')
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
    if (!file) {
      setError('Choose a CV before starting analysis.')
      return
    }

    setError('')
    setUploadState('analyzing')

    const formData = new FormData()
    formData.append('cv', file)

    await new Promise((resolve) => {
      window.setTimeout(resolve, 1200)
    })

    setUploadState('ready')
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
          accept=".pdf,.doc,.docx"
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
              : 'PDF, DOC, or DOCX up to 8 MB'}
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
          CV staged. Backend extraction and AI analysis will run from this upload.
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
