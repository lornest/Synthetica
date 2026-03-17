/**
 * Multi-Format Content Processor for Synthetica
 * Converted to ES module
 */

class ContentProcessor {
    constructor() {
        this.supportedFormats = ['text', 'markdown', 'code', 'link', 'image', 'audio'];

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

        this.extensionMap = {
            '.js': 'javascript', '.ts': 'typescript', '.py': 'python',
            '.html': 'html', '.css': 'css', '.md': 'markdown',
            '.json': 'json', '.sql': 'sql', '.sh': 'bash'
        };
    }

    processContent(content, contentType, metadata = {}) {
        const processor = this.getProcessor(contentType);
        const result = {
            originalContent: content,
            contentType,
            processedContent: content,
            extractedConcepts: [],
            metadata,
            processedAt: new Date()
        };

        if (processor) {
            Object.assign(result, processor(content, metadata));
        } else {
            result.extractedConcepts = this.extractBasicConcepts(content);
        }
        return result;
    }

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

    processText(content) {
        return {
            processedContent: content,
            extractedConcepts: this.extractBasicConcepts(content),
            renderHtml: this.escapeHtml(content)
        };
    }

    processMarkdown(content) {
        const extractedConcepts = this.extractBasicConcepts(content);
        const headers = content.match(/^#{1,6}\s+(.+)$/gm) || [];
        const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
        const codeBlocks = content.match(/```(\w*)\n([\s\S]*?)```/g) || [];
        const emphasis = content.match(/(\*\*|__)([^*_]+)\1/g) || [];

        extractedConcepts.push(...headers.map(h => h.replace(/^#{1,6}\s+/, '').toLowerCase()));
        extractedConcepts.push(...links.map(l => l.match(/\[([^\]]+)\]/)[1].toLowerCase()));

        return {
            processedContent: content,
            extractedConcepts: [...new Set(extractedConcepts)],
            renderHtml: this.markdownToHtml(content),
            structure: { headers: headers.length, links: links.length, codeBlocks: codeBlocks.length, emphasis: emphasis.length }
        };
    }

    processCode(content, metadata) {
        const language = metadata.language || this.detectLanguage(content, metadata.filename);
        const extractedConcepts = this.extractBasicConcepts(content);

        if (this.codePatterns[language]) {
            const patterns = this.codePatterns[language];
            const foundKeywords = patterns.keywords.filter(keyword => content.toLowerCase().includes(keyword));
            extractedConcepts.push(...foundKeywords);
            extractedConcepts.push(...patterns.concepts);
        }

        const functions = this.extractFunctionNames(content, language);
        const classes = this.extractClassNames(content, language);

        return {
            processedContent: content,
            extractedConcepts: [...new Set(extractedConcepts)],
            renderHtml: this.highlightCode(content, language),
            codeAnalysis: { language, functions, classes, lines: content.split('\n').length }
        };
    }

    processLink(url, metadata) {
        const extractedConcepts = [];
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace('www.', '');
            const path = urlObj.pathname;

            if (domain.includes('github')) extractedConcepts.push('code', 'development', 'collaboration');
            if (domain.includes('arxiv')) extractedConcepts.push('research', 'academic', 'science');
            if (domain.includes('youtube')) extractedConcepts.push('video', 'education', 'media');
            if (domain.includes('medium')) extractedConcepts.push('article', 'blog', 'writing');

            extractedConcepts.push(...path.split('/').filter(segment =>
                segment && segment.length > 2 && !segment.match(/^\d+$/)
            ));

            return {
                processedContent: url,
                extractedConcepts: [...new Set(extractedConcepts)],
                linkAnalysis: { domain, path, protocol: urlObj.protocol }
            };
        } catch {
            return {
                processedContent: url,
                extractedConcepts: ['link', 'reference'],
                error: 'Invalid URL format'
            };
        }
    }

    processImage(imagePath, metadata) {
        const extractedConcepts = ['visual', 'image'];
        if (metadata.filename) {
            const filename = metadata.filename.toLowerCase();
            if (filename.includes('chart')) extractedConcepts.push('data', 'visualization');
            if (filename.includes('diagram')) extractedConcepts.push('structure', 'explanation');
            if (filename.includes('screenshot')) extractedConcepts.push('interface', 'demonstration');
            if (filename.includes('photo')) extractedConcepts.push('photography', 'documentation');
        }
        if (metadata.alt) {
            extractedConcepts.push(...this.extractBasicConcepts(metadata.alt));
        }
        return {
            processedContent: imagePath,
            extractedConcepts: [...new Set(extractedConcepts)],
            imageAnalysis: { filename: metadata.filename, alt: metadata.alt, size: metadata.size }
        };
    }

    processAudio(audioPath, metadata) {
        const extractedConcepts = ['audio', 'voice', 'sound'];
        if (metadata.transcript) {
            extractedConcepts.push(...this.extractBasicConcepts(metadata.transcript));
        }
        if (metadata.type) {
            if (metadata.type.includes('music')) extractedConcepts.push('music', 'creative', 'artistic');
            if (metadata.type.includes('speech')) extractedConcepts.push('speech', 'communication', 'language');
        }
        return {
            processedContent: audioPath,
            extractedConcepts: [...new Set(extractedConcepts)],
            audioAnalysis: { duration: metadata.duration, type: metadata.type, hasTranscript: !!metadata.transcript }
        };
    }

    extractBasicConcepts(text) {
        if (!text || typeof text !== 'string') return [];
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
        ]);
        return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word) && !word.match(/^\d+$/))
            .slice(0, 20);
    }

    detectLanguage(content, filename) {
        if (filename) {
            const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
            if (this.extensionMap[ext]) return this.extensionMap[ext];
        }
        if (content.includes('function') && content.includes('{')) return 'javascript';
        if (content.includes('def ') && content.includes(':')) return 'python';
        if (content.includes('<') && content.includes('>')) return 'html';
        return 'text';
    }

    extractFunctionNames(content, language) {
        const functions = [];
        if (language === 'javascript') {
            (content.match(/function\s+(\w+)/g) || []).forEach(m => functions.push(m.replace('function ', '')));
            (content.match(/const\s+(\w+)\s*=/g) || []).forEach(m => functions.push(m.match(/const\s+(\w+)/)[1]));
        } else if (language === 'python') {
            (content.match(/def\s+(\w+)/g) || []).forEach(m => functions.push(m.replace('def ', '')));
        }
        return functions;
    }

    extractClassNames(content, language) {
        const classes = [];
        if (language === 'javascript' || language === 'python') {
            (content.match(/class\s+(\w+)/g) || []).forEach(m => classes.push(m.replace('class ', '')));
        }
        return classes;
    }

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

    highlightCode(code, language) {
        let highlighted = this.escapeHtml(code);
        if (language === 'javascript') {
            const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'class'];
            keywords.forEach(keyword => {
                highlighted = highlighted.replace(new RegExp(`\\b${keyword}\\b`, 'g'), `<span class="keyword">${keyword}</span>`);
            });
        }
        return `<pre><code class="language-${language}">${highlighted}</code></pre>`;
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

export default ContentProcessor;
