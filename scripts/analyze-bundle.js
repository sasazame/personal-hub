/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stat.size;
      }
    }
  } catch {
    // Ignore errors
  }
  
  return totalSize;
}

console.log('Personal Hub Bundle Size Analysis\n');
console.log('=================================\n');

// Analyze static directory
const staticDir = '.next/static';
if (fs.existsSync(staticDir)) {
  const chunksDir = path.join(staticDir, 'chunks');
  const cssDir = path.join(staticDir, 'css');
  const mediaDir = path.join(staticDir, 'media');
  
  console.log('Static Assets:');
  console.log(`- JavaScript chunks: ${formatBytes(getDirectorySize(chunksDir))}`);
  console.log(`- CSS files: ${formatBytes(getDirectorySize(cssDir))}`);
  console.log(`- Media files: ${formatBytes(getDirectorySize(mediaDir))}`);
  console.log(`- Total static: ${formatBytes(getDirectorySize(staticDir))}\n`);
}

// Analyze server directory
const serverDir = '.next/server';
if (fs.existsSync(serverDir)) {
  const appDir = path.join(serverDir, 'app');
  const chunksDir = path.join(serverDir, 'chunks');
  
  console.log('Server Assets:');
  console.log(`- App pages: ${formatBytes(getDirectorySize(appDir))}`);
  console.log(`- Server chunks: ${formatBytes(getDirectorySize(chunksDir))}`);
  console.log(`- Total server: ${formatBytes(getDirectorySize(serverDir))}\n`);
}

// Total build size
console.log(`Total build size: ${formatBytes(getDirectorySize('.next'))}\n`);

// Check for large chunks
const chunksPath = '.next/static/chunks';
if (fs.existsSync(chunksPath)) {
  const chunks = fs.readdirSync(chunksPath)
    .filter(f => f.endsWith('.js'))
    .map(f => ({
      name: f,
      size: fs.statSync(path.join(chunksPath, f)).size
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  
  console.log('Top 10 Largest JavaScript Chunks:');
  chunks.forEach(chunk => {
    console.log(`- ${chunk.name}: ${formatBytes(chunk.size)}`);
  });
}

console.log('\nBundle Optimization Recommendations:');
console.log('- Consider dynamic imports for large features');
console.log('- Review dependencies for tree-shaking opportunities');
console.log('- Enable image optimization for media assets');
console.log('- Use code splitting for route-based chunks');