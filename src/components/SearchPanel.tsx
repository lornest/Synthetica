import { useState, useEffect, useRef, useCallback } from 'react'
import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import { DOMAIN_COLORS, DOMAIN_LABELS, ALL_DOMAINS } from '@/constants/domains'
import type { Domain, ContentType } from '@/types'
import styles from './SearchPanel.module.css'

const CONTENT_TYPES: ContentType[] = ['text', 'markdown', 'code', 'link', 'image', 'audio']

export default function SearchPanel() {
  const search = useKnowledgeStore((s) => s.search)
  const searchResults = useKnowledgeStore((s) => s.searchResults)
  const selectNode = useKnowledgeStore((s) => s.selectNode)
  const searchQuery = useKnowledgeStore((s) => s.searchQuery)

  const [inputValue, setInputValue] = useState('')
  const [domainFilters, setDomainFilters] = useState<Set<Domain>>(new Set())
  const [typeFilters, setTypeFilters] = useState<Set<ContentType>>(new Set())
  const [showCount, setShowCount] = useState(10)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const debouncedSearch = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(query), 300)
  }, [search])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleInput = (value: string) => {
    setInputValue(value)
    setShowCount(10)
    debouncedSearch(value)
  }

  const toggleDomain = (d: Domain) => {
    setDomainFilters((prev) => {
      const next = new Set(prev)
      next.has(d) ? next.delete(d) : next.add(d)
      return next
    })
  }

  const toggleType = (t: ContentType) => {
    setTypeFilters((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })
  }

  // Filter results by domain and type
  const filteredResults = searchResults.filter((r) => {
    if (domainFilters.size > 0 && !domainFilters.has(r.node.domain)) return false
    if (typeFilters.size > 0 && !typeFilters.has(r.node.contentType)) return false
    return true
  })

  const visibleResults = filteredResults.slice(0, showCount)
  const hasMore = filteredResults.length > showCount

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  return (
    <div>
      <div className={styles.formGroup}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Search across all content types..."
          className={styles.searchInput}
        />
      </div>

      {/* Domain filter chips */}
      <div className={styles.filterRow}>
        {ALL_DOMAINS.map((d) => (
          <button
            key={d}
            className={`${styles.chip} ${domainFilters.has(d) ? styles.chipActive : ''}`}
            style={domainFilters.has(d) ? { background: DOMAIN_COLORS[d], color: 'white' } : {}}
            onClick={() => toggleDomain(d)}
          >
            {DOMAIN_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Content type chips */}
      <div className={styles.filterRow}>
        {CONTENT_TYPES.map((t) => (
          <button
            key={t}
            className={`${styles.chip} ${typeFilters.has(t) ? styles.chipActive : ''}`}
            onClick={() => toggleType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      {searchQuery && (
        <div className={styles.results}>
          {filteredResults.length === 0 && (
            <p className={styles.noResults}>No matches found</p>
          )}
          {visibleResults.map((result) => (
            <div
              key={result.node.id}
              className={styles.resultItem}
              onClick={() => selectNode(result.node.id)}
              style={{ borderLeftColor: DOMAIN_COLORS[result.node.domain] }}
            >
              <strong
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(result.node.title, searchQuery),
                }}
              />
              <span className={styles.resultType}>{result.node.contentType}</span>
              <div className={styles.resultMatches}>
                {result.matches.map((m, i) => (
                  <span key={i} className={styles.matchSnippet}>
                    {m.field}:{' '}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(m.snippet, searchQuery),
                      }}
                    />
                  </span>
                ))}
              </div>
            </div>
          ))}
          {hasMore && (
            <button className={styles.showMore} onClick={() => setShowCount((c) => c + 10)}>
              Show more ({filteredResults.length - showCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
