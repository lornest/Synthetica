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
    
    // Default to index.html
    if (filePath === './') {
        filePath = './web/index.html';
    } else if (filePath === './demo.js') {
        filePath = './demo.js';
    } else if (filePath.startsWith('./web/')) {
        // Already has web prefix
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
    console.log('🌐 Open your browser and start exploring the Living Knowledge Garden!');
    console.log('');
    console.log('🛠️  Development Features:');
    console.log('   • Interactive web interface');
    console.log('   • Real-time knowledge graph updates');  
    console.log('   • AI-powered connection discovery');
    console.log('   • Cross-domain insight visualization');
    console.log('');
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