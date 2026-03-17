import type { KnowledgeNode } from '@/types'
import styles from './ContentRenderer.module.css'

interface Props {
  node: KnowledgeNode
}

export default function ContentRenderer({ node }: Props) {
  const { contentType, content, processedContent, metadata } = node

  switch (contentType) {
    case 'markdown':
      return (
        <div
          className={styles.markdown}
          dangerouslySetInnerHTML={{ __html: processedContent?.renderHtml || content }}
        />
      )

    case 'code':
      return (
        <div className={styles.codeBlock}>
          {processedContent?.codeAnalysis?.language && (
            <div className={styles.codeLang}>{processedContent.codeAnalysis.language}</div>
          )}
          <div
            className={styles.codeContent}
            dangerouslySetInnerHTML={{ __html: processedContent?.renderHtml || `<pre><code>${content}</code></pre>` }}
          />
        </div>
      )

    case 'link': {
      const analysis = processedContent?.linkAnalysis
      return (
        <div className={styles.linkCard}>
          <a href={content} target="_blank" rel="noopener noreferrer" className={styles.linkAnchor}>
            {content}
          </a>
          {analysis && (
            <div className={styles.linkMeta}>
              {analysis.domain} &middot; {analysis.protocol.replace(':', '')}
            </div>
          )}
        </div>
      )
    }

    case 'image':
      return (
        <div className={styles.imageContainer}>
          <img
            src={content}
            alt={(metadata?.alt as string) || node.title}
            className={styles.image}
          />
          {metadata?.alt != null && <div className={styles.imageAlt}>{String(metadata.alt)}</div>}
        </div>
      )

    case 'audio':
      return (
        <div className={styles.audioContainer}>
          <audio controls src={content} className={styles.audioPlayer}>
            Your browser does not support the audio element.
          </audio>
          {metadata?.transcript != null && (
            <div className={styles.transcript}>
              <strong>Transcript:</strong>
              <p>{String(metadata.transcript)}</p>
            </div>
          )}
        </div>
      )

    default:
      return (
        <div className={styles.plainText}>
          {content.substring(0, 500)}
          {content.length > 500 && '...'}
        </div>
      )
  }
}
