/**
 * Multi-Format Content Processor for Synthetica
 * ============================================= 
 * 
 * Handles different types of content (markdown, code, images, audio, links)
 * and extracts meaningful concepts from each format for AI analysis.
 */

class ContentProcessor {
    constructor() {
        this.supportedFormats = ['text', 'markdown', 'code', 'link', 'image', 'audio'];
        
        // Language-specific keywords for code analysis
        this.codePatterns = {
            'javascript': {
                keywords: ['function', 'class', 'async', 'await', 'promise', 'callback', 'event'],
                concepts: ['asynchronous', 'functional', 'object-oriented', 'reactive', 'state']
            },
            'python': {
                keywords: ['def', 'class', 'import', 'lambda', 'decorator', 'generator'],
                concepts: ['object-oriented', 'functional', 'data-science', 'machine-learning', 'automation']
            },
            'html': {
                keywords: ['div', 'span', 'component', 'element', 'attribute'],
                concepts: ['structure', 'semantic', 'accessibility', 'responsive', 'user-interface']
            },
            'css': {
                keywords: ['selector', 'property', 'responsive', 'animation', 'grid', 'flexbox'],
                concepts: ['visual-design', 'layout', 'responsive', 'animation', 'user-experience']
            }
        };
        
        // Common file extensions to language mapping
        this.extensionMap = {
            '.js': 'javascript',
            '.ts': 'typescript', 
            '.py': 'python',
            '.html': 'html',
            '.css': 'css',
            '.md': 'markdown',
            '.json': 'json',
            '.sql': 'sql',
            '.sh': 'bash'
        };
    }
    
    /**
     * Process content based on its type and extract concepts
     */
    processContent(content, contentType, metadata = {}) {
        const processor = this.getProcessor(contentType);
        
        const result = {
            originalContent: content,
            contentType: contentType,
            processedContent: content,
            extractedConcepts: [],
            metadata: metadata,
            processedAt: new Date()
        };
        
        if (processor) {
            const processed = processor(content, metadata);
            Object.assign(result, processed);
        } else {
            // Fallback to basic text processing
            result.extractedConcepts = this.extractBasicConcepts(content);
        }
        
        return result;
    }
    
    /**
     * Get appropriate processor for content type
     */
    getProcessor(contentType) {
        const processors = {
            'text': this.processText.bind(this),
            'markdown': this.processMarkdown.bind(this),
            'code': this.processCode.bind(this),
            'link': this.processLink.bind(this),
            'image': this.processImage.bind(this),
            'audio': this.processAudio.bind(this)
        };
        
        return processors[contentType];
    }
    
    /**
     * Process plain text content
     */
    processText(content, metadata) {
        return {
            processedContent: content,
            extractedConcepts: this.extractBasicConcepts(content),
            renderHtml: this.escapeHtml(content)
        };
    }
    
    /**
     * Process markdown content
     */
    processMarkdown(content, metadata) {
        const extractedConcepts = this.extractBasicConcepts(content);
        
        // Extract markdown-specific elements
        const headers = content.match(/^#{1,6}\s+(.+)$/gm) || [];
        const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
        const codeBlocks = content.match(/```(\w*)\n([\s\S]*?)```/g) || [];
        const emphasis = content.match(/(\*\*|__)([^*_]+)\1/g) || [];
        
        // Add markdown-specific concepts
        extractedConcepts.push(...headers.map(h => h.replace(/^#{1,6}\s+/, '').toLowerCase()));
        extractedConcepts.push(...links.map(l => l.match(/\[([^\]]+)\]/)[1].toLowerCase()));
        
        return {
            processedContent: content,
            extractedConcepts: [...new Set(extractedConcepts)], // Remove duplicates
            renderHtml: this.markdownToHtml(content),
            structure: {
                headers: headers.length,
                links: links.length,
                codeBlocks: codeBlocks.length,
                emphasis: emphasis.length
            }
        };
    }
    
    /**
     * Process code content
     */
    processCode(content, metadata) {
        const language = metadata.language || this.detectLanguage(content, metadata.filename);
        const extractedConcepts = this.extractBasicConcepts(content);
        
        // Add language-specific concepts
        if (this.codePatterns[language]) {
            const patterns = this.codePatterns[language];
            
            // Extract keywords present in code
            const foundKeywords = patterns.keywords.filter(keyword => 
                content.toLowerCase().includes(keyword)
            );
            
            extractedConcepts.push(...foundKeywords);
            extractedConcepts.push(...patterns.concepts);
        }
        
        // Extract function/class names
        const functions = this.extractFunctionNames(content, language);
        const classes = this.extractClassNames(content, language);
        
        return {
            processedContent: content,
            extractedConcepts: [...new Set(extractedConcepts)],
            renderHtml: this.highlightCode(content, language),
            codeAnalysis: {
                language: language,
                functions: functions,
                classes: classes,
                lines: content.split('\n').length
            }
        };
    }
    
    /**
     * Process link content
     */
    processLink(url, metadata) {
        // For now, extract domain and basic analysis
        // In a full implementation, we'd fetch and analyze the page
        
        const extractedConcepts = [];
        
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace('www.', '');
            const path = urlObj.pathname;
            
            // Extract concepts from domain
            if (domain.includes('github')) extractedConcepts.push('code', 'development', 'collaboration');
            if (domain.includes('arxiv')) extractedConcepts.push('research', 'academic', 'science');
            if (domain.includes('youtube')) extractedConcepts.push('video', 'education', 'media');
            if (domain.includes('medium')) extractedConcepts.push('article', 'blog', 'writing');
            
            // Extract concepts from path
            extractedConcepts.push(...path.split('/').filter(segment => 
                segment && segment.length > 2 && !segment.match(/^\d+$/)
            ));
            
            return {
                processedContent: url,
                extractedConcepts: [...new Set(extractedConcepts)],
                renderHtml: `<a href="${url}" target="_blank" rel="noopener">${url}</a>`,
                linkAnalysis: {
                    domain: domain,
                    path: path,
                    protocol: urlObj.protocol
                }
            };
            
        } catch (error) {
            return {
                processedContent: url,
                extractedConcepts: ['link', 'reference'],
                renderHtml: `<span class="invalid-link">${url}</span>`,
                error: 'Invalid URL format'
            };
        }
    }
    
    /**
     * Process image content
     */
    processImage(imagePath, metadata) {
        // For now, basic analysis based on filename and metadata
        // In full implementation, we'd use image recognition AI
        
        const extractedConcepts = ['visual', 'image'];
        
        // Extract concepts from filename
        if (metadata.filename) {
            const filename = metadata.filename.toLowerCase();
            if (filename.includes('chart')) extractedConcepts.push('data', 'visualization');
            if (filename.includes('diagram')) extractedConcepts.push('structure', 'explanation');
            if (filename.includes('screenshot')) extractedConcepts.push('interface', 'demonstration');
            if (filename.includes('photo')) extractedConcepts.push('photography', 'documentation');
        }
        
        // Extract concepts from alt text or description
        if (metadata.alt) {
            extractedConcepts.push(...this.extractBasicConcepts(metadata.alt));
        }
        
        return {
            processedContent: imagePath,
            extractedConcepts: [...new Set(extractedConcepts)],
            renderHtml: `<img src="${imagePath}" alt="${metadata.alt || 'Image'}" style="max-width: 100%; height: auto;">`,
            imageAnalysis: {
                filename: metadata.filename,
                alt: metadata.alt,
                size: metadata.size
            }
        };
    }
    
    /**
     * Process audio content
     */
    processAudio(audioPath, metadata) {
        // For now, basic analysis based on metadata
        // In full implementation, we'd use speech-to-text
        
        const extractedConcepts = ['audio', 'voice', 'sound'];
        
        // If we have a transcript, process it
        if (metadata.transcript) {
            const textConcepts = this.extractBasicConcepts(metadata.transcript);
            extractedConcepts.push(...textConcepts);
        }
        
        // Analyze audio type
        if (metadata.type) {
            if (metadata.type.includes('music')) extractedConcepts.push('music', 'creative', 'artistic');
            if (metadata.type.includes('speech')) extractedConcepts.push('speech', 'communication', 'language');
            if (metadata.type.includes('interview')) extractedConcepts.push('conversation', 'knowledge', 'insights');
        }
        
        return {
            processedContent: audioPath,
            extractedConcepts: [...new Set(extractedConcepts)],
            renderHtml: `<audio controls><source src="${audioPath}" type="${metadata.mimeType || 'audio/mpeg'}">Audio not supported</audio>`,
            audioAnalysis: {
                duration: metadata.duration,
                type: metadata.type,
                hasTranscript: !!metadata.transcript
            }
        };
    }
    
    /**
     * Extract basic concepts from any text
     */
    extractBasicConcepts(text) {
        if (!text || typeof text !== 'string') return [];
        
        // Common stop words to filter out
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
        ]);
        
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => 
                word.length > 2 && 
                !stopWords.has(word) && 
                !word.match(/^\d+$/)
            )
            .slice(0, 20); // Limit to top 20 concepts
    }
    
    /**
     * Detect programming language from content or filename
     */
    detectLanguage(content, filename) {
        if (filename) {
            const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
            if (this.extensionMap[ext]) {
                return this.extensionMap[ext];
            }
        }
        
        // Basic heuristics for language detection
        if (content.includes('function') && content.includes('{')) return 'javascript';
        if (content.includes('def ') && content.includes(':')) return 'python';
        if (content.includes('<') && content.includes('>')) return 'html';
        if (content.includes('SELECT') || content.includes('select')) return 'sql';
        
        return 'text';
    }
    
    /**
     * Extract function names from code
     */
    extractFunctionNames(content, language) {
        const functions = [];
        
        switch (language) {
            case 'javascript':
                const jsMatches = content.match(/function\s+(\w+)/g) || [];
                functions.push(...jsMatches.map(m => m.replace('function ', '')));
                
                const arrowMatches = content.match(/const\s+(\w+)\s*=/g) || [];
                functions.push(...arrowMatches.map(m => m.match(/const\s+(\w+)/)[1]));
                break;
                
            case 'python':
                const pyMatches = content.match(/def\s+(\w+)/g) || [];
                functions.push(...pyMatches.map(m => m.replace('def ', '')));
                break;
        }
        
        return functions;
    }
    
    /**
     * Extract class names from code
     */
    extractClassNames(content, language) {
        const classes = [];
        
        switch (language) {
            case 'javascript':
            case 'python':
                const matches = content.match(/class\s+(\w+)/g) || [];
                classes.push(...matches.map(m => m.replace('class ', '')));
                break;
        }
        
        return classes;
    }
    
    /**
     * Simple markdown to HTML conversion
     */
    markdownToHtml(markdown) {
        return markdown
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    /**
     * Basic code syntax highlighting
     */
    highlightCode(code, language) {
        // This is a basic implementation
        // In production, you'd use a proper syntax highlighter like Prism.js
        
        let highlighted = this.escapeHtml(code);
        
        // Basic keyword highlighting for JavaScript
        if (language === 'javascript') {
            const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'class'];
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
            });
        }
        
        return `<pre><code class="language-${language}">${highlighted}</code></pre>`;
    }
    
    /**
     * Escape HTML characters
     */
    escapeHtml(text) {
        // Node.js compatible HTML escaping
        if (typeof document === 'undefined') {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        } else {
            // Browser environment
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = ContentProcessor;
}

// For browser environments
if (typeof window !== 'undefined') {
    window.ContentProcessor = ContentProcessor;
}