import { useState } from 'react'
import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import { DOMAIN_COLORS, DOMAIN_LABELS, ALL_DOMAINS } from '@/constants/domains'
import ContentRenderer from './ContentRenderer'
import type { KnowledgeNode, Domain } from '@/types'
import styles from './NodeDetails.module.css'

interface Props {
  node: KnowledgeNode
}

export default function NodeDetails({ node }: Props) {
  const updateNode = useKnowledgeStore((s) => s.updateNode)
  const deleteNode = useKnowledgeStore((s) => s.deleteNode)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState(node.title)
  const [editContent, setEditContent] = useState(node.content)
  const [editDomain, setEditDomain] = useState<Domain>(node.domain)
  const [editTags, setEditTags] = useState(node.tags.join(', '))

  const handleStartEdit = () => {
    setEditTitle(node.title)
    setEditContent(node.content)
    setEditDomain(node.domain)
    setEditTags(node.tags.join(', '))
    setEditing(true)
    setConfirmDelete(false)
  }

  const handleSave = () => {
    const tags = editTags.split(',').map((t) => t.trim()).filter(Boolean)
    updateNode(
      node.id,
      { title: editTitle, content: editContent, domain: editDomain, tags } as Partial<KnowledgeNode>,
      `Updated: ${editTitle}`
    )
    setEditing(false)
  }

  const handleDelete = () => {
    deleteNode(node.id)
    setConfirmDelete(false)
  }

  if (editing) {
    return (
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <label>Title</label>
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label>Content</label>
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label>Domain</label>
          <select value={editDomain} onChange={(e) => setEditDomain(e.target.value as Domain)}>
            {ALL_DOMAINS.map((d) => (
              <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Tags</label>
          <input value={editTags} onChange={(e) => setEditTags(e.target.value)} />
        </div>
        <div className={styles.actions}>
          <button className={styles.btnSave} onClick={handleSave}>Save</button>
          <button className={styles.btnCancel} onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.title}>{node.title}</div>
      <div className={styles.badges}>
        <span className={styles.typeBadge}>{node.contentType}</span>
        <span className={styles.domainBadge} style={{ background: DOMAIN_COLORS[node.domain] }}>
          {DOMAIN_LABELS[node.domain]}
        </span>
      </div>

      <div className={styles.contentPreview}>
        <ContentRenderer node={node} />
      </div>

      <div className={styles.conceptSection}>
        <strong>Extracted Concepts:</strong>
        <div className={styles.conceptTags}>
          {(node.processedContent?.extractedConcepts || []).slice(0, 8).map((concept, i) => (
            <span key={i} className={styles.conceptTag}>{concept}</span>
          ))}
        </div>
      </div>

      <div className={styles.meta}>
        <div>Created: {new Date(node.created_at).toLocaleDateString()}</div>
        {node.updated_at && (
          <div>Updated: {new Date(node.updated_at).toLocaleDateString()}</div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.btnEdit} onClick={handleStartEdit}>Edit</button>
        {!confirmDelete ? (
          <button className={styles.btnDelete} onClick={() => setConfirmDelete(true)}>Delete</button>
        ) : (
          <div className={styles.confirmRow}>
            <span className={styles.confirmText}>Are you sure?</span>
            <button className={styles.btnConfirmDelete} onClick={handleDelete}>Yes, delete</button>
            <button className={styles.btnCancel} onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
