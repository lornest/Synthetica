#!/usr/bin/env node
/**
 * Synthetica Development Server
 * ============================
 * 
 * Simple HTTP server to run the Synthetica web interface locally
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

const server = http.createServer((req, res) => {
    // Enable CORS for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    let filePath = '.' + req.url;
    
    // Route handling
    if (filePath === './') {
        filePath = './web/phase2-integrated-canvas.html'; // Default to Phase 2 integrated canvas
    } else if (filePath === './phase1') {
        filePath = './web/insight-canvas.html'; // Phase 1 D3.js canvas
    } else if (filePath === './classic') {
        filePath = './web/index.html'; // Original simple interface
    } else if (filePath === './demo.js' || filePath === './enhanced_demo.js' || filePath === './phase1-demo-simple.js') {
        // Serve demo files from root
        filePath = '.' + req.url;
    } else if (filePath.startsWith('./web/')) {
        // Already has web prefix
    } else if (filePath.startsWith('./src/')) {
        // Serve source files
        filePath = '.' + req.url;
    } else {
        // Add web prefix for other files
        filePath = './web' + req.url;
    }

    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = MIME_TYPES[extname] || 'application/octet-stream';

    serveFile(res, filePath, mimeType);
});

server.listen(PORT, () => {
    console.log('🚀 Synthetica Development Server Started!');
    console.log('=' .repeat(50));
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log('🌐 Available Interfaces:');
    console.log(`   🚀 Phase 2 Integrated: http://localhost:${PORT}/ (default)`);
    console.log(`   🎨 Phase 1 Canvas: http://localhost:${PORT}/phase1`);
    console.log(`   📝 Classic Interface: http://localhost:${PORT}/classic`);
    console.log('');
    console.log('🛠️  Phase 2 Features:');
    console.log('   🌟 Complete Phase 1 integration with visualization');
    console.log('   📝 Multi-format content processing (text, markdown, code, links, images, audio)');
    console.log('   📚 Advanced version control with branching and merging');
    console.log('   🧠 Enhanced AI discovery with cross-domain insights');
    console.log('   🎨 Beautiful D3.js visualization with real-time updates');
    console.log('   🔍 Advanced search across all content types and history');
    console.log('');
    console.log('🌱 Phase 2: Where Foundation Meets Visual Magic!');
    console.log('Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Synthetica server...');
    console.log('Thanks for exploring the Living Knowledge Garden! 🌱');
    server.close(() => {
        process.exit(0);
    });
});