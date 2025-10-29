#!/usr/bin/env node

/**
 * 簡單的 HTTP 伺服器用於瀏覽器開發模式
 * 使用方式: npm run start:web
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const HOST = 'localhost';

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // 處理根路徑
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🏮 悅來客棧 - 瀏覽器開發模式');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`🌐 伺服器已啟動: http://${HOST}:${PORT}`);
  console.log('');
  console.log('📝 使用說明:');
  console.log(`  1. 在瀏覽器打開: http://${HOST}:${PORT}`);
  console.log('  2. 按 F12 打開開發者工具查看日誌');
  console.log('  3. 修改代碼後重新整理頁面即可看到變更');
  console.log('  4. 按 Ctrl+C 停止伺服器');
  console.log('');
  console.log('💡 優點:');
  console.log('  ✅ 無需 Electron，直接瀏覽器測試');
  console.log('  ✅ 支援熱重載（手動重新整理）');
  console.log('  ✅ 開發者工具完整功能');
  console.log('  ✅ 跨平台（Windows/Mac/Linux）');
  console.log('');
  console.log('⚠️  注意:');
  console.log('  - Electron 特定 API 在瀏覽器中不可用');
  console.log('  - 部分功能（如存檔）需要使用 localStorage');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('\n👋 正在關閉伺服器...');
  server.close(() => {
    console.log('✅ 伺服器已關閉');
    process.exit(0);
  });
});
