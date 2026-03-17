import type { Domain } from '@/types'

export const DOMAIN_COLORS: Record<Domain, string> = {
  technology: '#667eea',
  biology: '#48bb78',
  art: '#ed64a6',
  science: '#4299e1',
  philosophy: '#9f7aea',
  mathematics: '#f56500',
  psychology: '#38b2ac',
  economics: '#d69e2e',
  general: '#718096',
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  technology: 'Technology',
  biology: 'Biology',
  art: 'Art',
  science: 'Science',
  philosophy: 'Philosophy',
  mathematics: 'Mathematics',
  psychology: 'Psychology',
  economics: 'Economics',
  general: 'General',
};

export const ALL_DOMAINS: Domain[] = [
  'technology', 'science', 'biology', 'art', 'philosophy',
  'mathematics', 'psychology', 'economics', 'general',
];

export const CONNECTION_COLORS = {
  crossDomain: '#e53e3e',
  metaphorical: '#38a169',
  regular: '#a0aec0',
} as const;

export const CONTENT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  text: { label: 'Text', icon: 'T' },
  markdown: { label: 'Markdown', icon: 'M' },
  code: { label: 'Code', icon: '</>' },
  link: { label: 'Link', icon: '@' },
  image: { label: 'Image', icon: 'IMG' },
  audio: { label: 'Audio', icon: 'AUD' },
};
