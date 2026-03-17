import { useState } from 'react'
import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import { ALL_DOMAINS, DOMAIN_LABELS } from '@/constants/domains'
import type { ContentType, Domain } from '@/types'
import styles from './NodeCreationForm.module.css'

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'code', label: 'Code' },
  { value: 'link', label: 'Link' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
]

export default function NodeCreationForm() {
  const addNode = useKnowledgeStore((s) => s.addNode)
  const [contentType, setContentType] = useState<ContentType>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [domain, setDomain] = useState<Domain>('technology')
  const [tags, setTags] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [linkDescription, setLinkDescription] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [audioTranscript, setAudioTranscript] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const metadata: Record<string, unknown> = {}
    if (contentType === 'code') metadata.language = codeLanguage
    if (contentType === 'link') metadata.description = linkDescription
    if (contentType === 'image') metadata.alt = imageAlt
    if (contentType === 'audio') metadata.transcript = audioTranscript

    setTimeout(() => {
      const node = addNode(title, content, domain, tagList, contentType, metadata)
      // Auto-select the new node
      useKnowledgeStore.getState().selectNode(node.id)
      // Reset form
      setTitle('')
      setContent('')
      setTags('')
      setLinkDescription('')
      setImageAlt('')
      setAudioTranscript('')
      setSubmitting(false)
    }, 300)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="contentType">Content Type</label>
        <select
          id="contentType"
          value={contentType}
          onChange={(e) => setContentType(e.target.value as ContentType)}
        >
          {CONTENT_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic content field */}
      {(contentType === 'text' || contentType === 'markdown') && (
        <div className={styles.formGroup}>
          <label htmlFor="nodeContent">Content</label>
          <textarea
            id="nodeContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Enter your ${contentType} content...`}
          />
        </div>
      )}

      {contentType === 'code' && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="codeLanguage">Language</label>
            <select
              id="codeLanguage"
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="nodeContent">Code</label>
            <textarea
              id="nodeContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your code here..."
              className={styles.codeArea}
            />
          </div>
        </>
      )}

      {contentType === 'link' && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="nodeContent">URL</label>
            <input
              id="nodeContent"
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="linkDescription">Description (optional)</label>
            <textarea
              id="linkDescription"
              value={linkDescription}
              onChange={(e) => setLinkDescription(e.target.value)}
              placeholder="What is this link about?"
            />
          </div>
        </>
      )}

      {contentType === 'image' && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="nodeContent">Image Path or URL</label>
            <input
              id="nodeContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="/path/to/image.jpg or https://..."
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="imageAlt">Alt Text</label>
            <input
              id="imageAlt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Describe the image..."
            />
          </div>
        </>
      )}

      {contentType === 'audio' && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="nodeContent">Audio Path or URL</label>
            <input
              id="nodeContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="/path/to/audio.mp3 or https://..."
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="audioTranscript">Transcript (optional)</label>
            <textarea
              id="audioTranscript"
              value={audioTranscript}
              onChange={(e) => setAudioTranscript(e.target.value)}
              placeholder="Transcript or description..."
            />
          </div>
        </>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="nodeTitle">Title</label>
        <input
          id="nodeTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter concept or idea..."
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="nodeDomain">Domain</label>
        <select
          id="nodeDomain"
          value={domain}
          onChange={(e) => setDomain(e.target.value as Domain)}
        >
          {ALL_DOMAINS.map((d) => (
            <option key={d} value={d}>
              {DOMAIN_LABELS[d]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="nodeTags">Tags (optional)</label>
        <input
          id="nodeTags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="ai, patterns, innovation..."
        />
      </div>

      <button type="submit" className={styles.submitBtn} disabled={submitting || !title.trim() || !content.trim()}>
        {submitting ? 'Processing...' : 'Plant Knowledge Seed'}
      </button>
    </form>
  )
}
