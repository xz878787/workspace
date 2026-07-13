const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8899;
const ROOT = __dirname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

http.createServer((req, res) => {
  const filePath = path.join(ROOT, req.url === '/' ? '/hotel1.html' : req.url);
  const ext = path.extname(filePath);
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});