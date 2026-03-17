/**
 * Phase 1 Integration for Interactive Insight Canvas
 * ================================================
 * 
 * Integrates the complete Phase 1 foundation (multi-format content,
 * versioning, advanced AI) with the D3.js visualization system.
 */

class Phase1IntegratedCanvas {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        
        // Initialize Phase 1 systems
        this.kg = new Phase1KnowledgeGraph();
        this.setupEventListeners();
        
        // Visualization components  
        this.visualization = new InteractiveInsightCanvas(containerId, this.kg);
        
        // UI state
        this.selectedNode = null;
        this.currentBranch = 'main';
        this.showVersionHistory = false;
        
        this.initializeInterface();
    }
    
    initializeInterface() {
        // Add Phase 1 specific UI elements
        this.addMultiFormatControls();
        this.addVersioningControls(); 
        this.addAdvancedSearch();
        this.addContentTypeFilters();
    }
    
    addMultiFormatControls() {
        const controlPanel = document.querySelector('.control-panel');
        
        // Enhanced node creation with content type selection
        const multiFormatSection = document.createElement('div');
        multiFormatSection.className = 'panel-section';
        multiFormatSection.innerHTML = `
            <h3>🌱 Add Multi-Format Knowledge</h3>
            
            <div class="form-group">
                <label for="contentType">Content Type</label>
                <select id="contentType" onchange="updateContentInterface()">
                    <option value="text">📝 Text</option>
                    <option value="markdown">📖 Markdown</option>
                    <option value="code">💻 Code</option>
                    <option value="link">🔗 Link</option>
                    <option value="image">🖼️ Image</option>
                    <option value="audio">🎵 Audio</option>
                </select>
            </div>
            
            <div id="dynamicContentInterface">
                <!-- Populated based on content type -->
            </div>
            
            <div class="form-group">
                <label for="nodeTitle">Title</label>
                <input type="text" id="nodeTitle" placeholder="Enter concept or idea...">
            </div>
            
            <div class="form-group">
                <label for="nodeDomain">Domain</label>
                <select id="nodeDomain">
                    <option value="technology">Technology</option>
                    <option value="science">Science</option>
                    <option value="biology">Biology</option>
                    <option value="art">Art</option>
                    <option value="philosophy">Philosophy</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="psychology">Psychology</option>
                    <option value="economics">Economics</option>
                    <option value="general">General</option>
                </select>
            </div>
            
            <button class="btn" onclick="addEnhancedNode()">
                ✨ Plant Knowledge Seed
            </button>
        `;
        
        controlPanel.insertBefore(multiFormatSection, controlPanel.firstChild);
    }
    
    addVersioningControls() {
        const detailsPanel = document.querySelector('.details-panel');
        
        const versioningSection = document.createElement('div');
        versioningSection.className = 'panel-section';
        versioningSection.innerHTML = `
            <h3>🌿 Version Evolution</h3>
            <div id="versioningControls" style="display: none;">
                <div class="version-actions">
                    <button class="btn-small" onclick="createNodeBranch()">
                        🌱 Create Branch
                    </button>
                    <button class="btn-small" onclick="showVersionHistory()">
                        📚 View History
                    </button>
                    <button class="btn-small" onclick="compareVersions()">
                        🔍 Compare Versions
                    </button>
                </div>
                
                <div id="branchSelector" style="display: none;">
                    <select id="branchSelect" onchange="switchBranch()">
                        <option value="main">main</option>
                    </select>
                </div>
                
                <div id="versionTimeline" style="display: none;">
                    <!-- Timeline visualization will go here -->
                </div>
            </div>
        `;
        
        detailsPanel.appendChild(versioningSection);
    }
    
    addAdvancedSearch() {
        const controlPanel = document.querySelector('.control-panel');
        
        const searchSection = document.createElement('div');
        searchSection.className = 'panel-section';
        searchSection.innerHTML = `
            <h3>🔍 Enhanced Search</h3>
            <div class="form-group">
                <input type="text" id="advancedSearch" placeholder="Search across all content types..." 
                       oninput="performAdvancedSearch(this.value)">
            </div>
            
            <div class="search-filters">
                <label>
                    <input type="checkbox" id="searchInContent" checked> Content
                </label>
                <label>
                    <input type="checkbox" id="searchInConcepts" checked> Concepts
                </label>
                <label>
                    <input type="checkbox" id="searchInCode" checked> Code
                </label>
                <label>
                    <input type="checkbox" id="searchInHistory" checked> History
                </label>
            </div>
            
            <div id="searchResults"></div>
        `;
        
        controlPanel.appendChild(searchSection);
    }
    
    addContentTypeFilters() {
        const canvasContainer = document.querySelector('.canvas-container');
        
        // Add content type filter buttons to canvas controls
        const contentFilters = document.createElement('div');
        contentFilters.className = 'content-filters';
        contentFilters.style.cssText = `
            position: absolute;
            top: 60px;
            right: 20px;
            display: flex;
            gap: 5px;
            z-index: 100;
        `;
        
        const filterButtons = [
            { type: 'text', icon: '📝', label: 'Text' },
            { type: 'markdown', icon: '📖', label: 'Markdown' },
            { type: 'code', icon: '💻', label: 'Code' },
            { type: 'link', icon: '🔗', label: 'Links' },
            { type: 'image', icon: '🖼️', label: 'Images' },
            { type: 'audio', icon: '🎵', label: 'Audio' }
        ];
        
        filterButtons.forEach(filter => {
            const button = document.createElement('button');
            button.className = 'canvas-btn content-filter-btn active';
            button.innerHTML = filter.icon;
            button.title = filter.label;
            button.dataset.contentType = filter.type;
            button.onclick = () => this.toggleContentTypeFilter(filter.type, button);
            contentFilters.appendChild(button);
        });
        
        canvasContainer.appendChild(contentFilters);
    }
    
    setupEventListeners() {
        // Listen for Phase 1 knowledge graph events
        this.kg.on('nodeAdded', (data) => {
            this.visualization.update();
            this.updateStats();
            this.showProcessingFeedback(data.node);
        });
        
        this.kg.on('nodeUpdated', (data) => {
            this.visualization.update();
            this.updateVersionControls(data.nodeId);
            this.showUpdateFeedback(data);
        });
        
        this.kg.on('branchCreated', (data) => {
            this.updateBranchSelector(data.nodeId);
        });
        
        this.kg.on('branchMerged', (data) => {
            this.visualization.update();
            this.showMergeFeedback(data);
        });
    }
    
    updateStats() {
        const stats = this.kg.getStats();
        
        document.getElementById('nodeCount').textContent = stats.total_nodes;
        document.getElementById('connectionCount').textContent = stats.total_connections;
        document.getElementById('crossDomainCount').textContent = stats.cross_domain_connections;
        
        // Add Phase 1 specific stats
        if (!document.getElementById('versionCount')) {
            const statsBar = document.querySelector('.stats-bar');
            const versionStat = document.createElement('div');
            versionStat.className = 'stat-item';
            versionStat.innerHTML = `
                <span>Versions:</span>
                <span class="stat-number" id="versionCount">${stats.total_versions || 0}</span>
            `;
            statsBar.appendChild(versionStat);
        } else {
            document.getElementById('versionCount').textContent = stats.total_versions || 0;
        }
    }
    
    showProcessingFeedback(node) {
        const feedback = document.createElement('div');
        feedback.className = 'processing-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            z-index: 1000;
            max-width: 300px;
        `;
        
        feedback.innerHTML = `
            <h4>🧠 AI Processing Complete!</h4>
            <p><strong>${node.title}</strong></p>
            <p>📁 Type: ${node.contentType}</p>
            <p>🏷️ Extracted: ${node.processedContent.extractedConcepts.slice(0, 3).join(', ')}...</p>
            <p>🔗 Found ${this.kg.getNodeConnections(node.id).length} connections</p>
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(feedback), 300);
        }, 4000);
    }
    
    showUpdateFeedback(data) {
        const changedFields = Object.keys(data.changes).join(', ');
        this.showNotification(`🔄 "${data.node.title}" updated: ${changedFields}`, 'info');
    }
    
    showMergeFeedback(data) {
        this.showNotification(`🌿 Merged branch "${data.branchName}" into main`, 'success');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : type === 'info' ? '#4299e1' : '#ed64a6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
    
    toggleContentTypeFilter(contentType, button) {
        button.classList.toggle('active');
        
        const isActive = button.classList.contains('active');
        this.visualization.filterByContentType(contentType, isActive);
    }
    
    updateVersionControls(nodeId) {
        const versioningControls = document.getElementById('versioningControls');
        if (this.selectedNode && this.selectedNode.id === nodeId) {
            versioningControls.style.display = 'block';
            
            // Update branch selector
            this.updateBranchSelector(nodeId);
        }
    }
    
    updateBranchSelector(nodeId) {
        const branches = this.kg.versioning.branches.get(nodeId);
        if (!branches) return;
        
        const branchSelect = document.getElementById('branchSelect');
        branchSelect.innerHTML = '';
        
        Object.keys(branches).forEach(branchName => {
            const option = document.createElement('option');
            option.value = branchName;
            option.textContent = branchName;
            if (branchName === this.currentBranch) option.selected = true;
            branchSelect.appendChild(option);
        });
        
        document.getElementById('branchSelector').style.display = 'block';
    }
}

// Global functions for UI interaction
window.updateContentInterface = function() {
    const contentType = document.getElementById('contentType').value;
    const dynamicInterface = document.getElementById('dynamicContentInterface');
    
    let interfaceHTML = '';
    
    switch (contentType) {
        case 'text':
        case 'markdown':
            interfaceHTML = `
                <div class="form-group">
                    <label for="nodeContent">Content</label>
                    <textarea id="nodeContent" placeholder="Enter your ${contentType} content..."></textarea>
                </div>
            `;
            break;
            
        case 'code':
            interfaceHTML = `
                <div class="form-group">
                    <label for="codeLanguage">Programming Language</label>
                    <select id="codeLanguage">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="sql">SQL</option>
                        <option value="bash">Bash</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="nodeContent">Code</label>
                    <textarea id="nodeContent" placeholder="Paste your code here..." style="font-family: 'Courier New', monospace;"></textarea>
                </div>
            `;
            break;
            
        case 'link':
            interfaceHTML = `
                <div class="form-group">
                    <label for="nodeContent">URL</label>
                    <input type="url" id="nodeContent" placeholder="https://example.com">
                </div>
                <div class="form-group">
                    <label for="linkDescription">Description (optional)</label>
                    <textarea id="linkDescription" placeholder="What is this link about?"></textarea>
                </div>
            `;
            break;
            
        case 'image':
            interfaceHTML = `
                <div class="form-group">
                    <label for="nodeContent">Image Path or URL</label>
                    <input type="text" id="nodeContent" placeholder="/path/to/image.jpg or https://...">
                </div>
                <div class="form-group">
                    <label for="imageAlt">Alt Text</label>
                    <input type="text" id="imageAlt" placeholder="Describe the image...">
                </div>
            `;
            break;
            
        case 'audio':
            interfaceHTML = `
                <div class="form-group">
                    <label for="nodeContent">Audio Path or URL</label>
                    <input type="text" id="nodeContent" placeholder="/path/to/audio.mp3 or https://...">
                </div>
                <div class="form-group">
                    <label for="audioTranscript">Transcript (optional)</label>
                    <textarea id="audioTranscript" placeholder="Transcript or description..."></textarea>
                </div>
            `;
            break;
    }
    
    dynamicInterface.innerHTML = interfaceHTML;
};

window.addEnhancedNode = function() {
    const contentType = document.getElementById('contentType').value;
    const title = document.getElementById('nodeTitle').value.trim();
    const content = document.getElementById('nodeContent').value.trim();
    const domain = document.getElementById('nodeDomain').value;
    
    if (!title || !content) {
        alert('Please fill in both title and content!');
        return;
    }
    
    // Build metadata based on content type
    const metadata = {};
    
    if (contentType === 'code') {
        metadata.language = document.getElementById('codeLanguage').value;
    } else if (contentType === 'link') {
        metadata.description = document.getElementById('linkDescription')?.value || '';
    } else if (contentType === 'image') {
        metadata.alt = document.getElementById('imageAlt')?.value || '';
    } else if (contentType === 'audio') {
        metadata.transcript = document.getElementById('audioTranscript')?.value || '';
    }
    
    // Show processing state
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '🧠 Processing...';
    button.disabled = true;
    
    // Add the node with Phase 1 processing
    setTimeout(() => {
        window.integratedCanvas.kg.addNode(title, content, domain, [], contentType, metadata);
        
        // Clear form
        document.getElementById('nodeTitle').value = '';
        document.getElementById('nodeContent').value = '';
        document.getElementById('dynamicContentInterface').innerHTML = '';
        
        // Reset button
        button.textContent = originalText;
        button.disabled = false;
        
    }, 800);
};

window.performAdvancedSearch = function(query) {
    if (!query.trim()) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }
    
    const results = window.integratedCanvas.kg.searchNodes(query, { limit: 5 });
    const resultsContainer = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="color: #718096; font-size: 0.875rem;">No matches found</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(result => `
        <div class="search-result" onclick="focusNode('${result.node.id}')" style="
            background: rgba(255, 255, 255, 0.8);
            padding: 0.5rem;
            margin: 0.5rem 0;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
        ">
            <strong>${result.node.title}</strong> (${result.node.contentType})
            <div style="color: #718096;">
                ${result.matches.map(m => `${m.field}: "${m.snippet}"`).join('; ')}
            </div>
        </div>
    `).join('');
};

window.focusNode = function(nodeId) {
    window.integratedCanvas.visualization.focusNode(nodeId);
};

// Export for use
if (typeof window !== 'undefined') {
    window.Phase1IntegratedCanvas = Phase1IntegratedCanvas;
}