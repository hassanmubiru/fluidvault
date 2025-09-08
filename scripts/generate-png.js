#!/usr/bin/env node

/**
 * FluidVault Logo PNG Generator
 * 
 * This script generates PNG versions of the FluidVault logo in various sizes.
 * 
 * Requirements:
 * - Node.js
 * - Puppeteer (install with: npm install puppeteer)
 * 
 * Usage:
 * node scripts/generate-png.js
 */

const fs = require('fs');
const path = require('path');

// SVG content for the main logo
const logoSVG = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="100" cy="100" r="95" fill="url(#gradient1)" stroke="url(#gradient2)" stroke-width="2"/>
  
  <!-- Main Vault Symbol -->
  <g transform="translate(100, 100)">
    <!-- Vault Base -->
    <rect x="-35" y="20" width="70" height="45" rx="8" fill="url(#gradient3)" stroke="url(#gradient4)" stroke-width="2"/>
    
    <!-- Vault Door -->
    <rect x="-25" y="25" width="50" height="35" rx="6" fill="url(#gradient5)"/>
    
    <!-- Vault Handle -->
    <circle cx="15" cy="42" r="4" fill="url(#gradient6)"/>
    <rect x="13" y="40" width="4" height="4" rx="2" fill="url(#gradient7)"/>
    
    <!-- Vault Lock -->
    <rect x="-20" y="35" width="8" height="10" rx="2" fill="url(#gradient8)"/>
    <circle cx="-16" cy="40" r="2" fill="url(#gradient9)"/>
    
    <!-- Fluid Drops -->
    <g opacity="0.8">
      <ellipse cx="-45" cy="-10" rx="6" ry="12" fill="url(#gradient10)" transform="rotate(-15 -45 -10)"/>
      <ellipse cx="45" cy="-15" rx="5" ry="10" fill="url(#gradient11)" transform="rotate(15 45 -15)"/>
      <ellipse cx="-50" cy="15" rx="4" ry="8" fill="url(#gradient12)" transform="rotate(-30 -50 15)"/>
      <ellipse cx="50" cy="10" rx="5" ry="9" fill="url(#gradient13)" transform="rotate(25 50 10)"/>
    </g>
    
    <!-- Money Flow Lines -->
    <g opacity="0.6">
      <path d="M-60 -20 Q-30 -25 0 -20 Q30 -15 60 -20" stroke="url(#gradient14)" stroke-width="2" fill="none"/>
      <path d="M-60 20 Q-30 15 0 20 Q30 25 60 20" stroke="url(#gradient15)" stroke-width="2" fill="none"/>
    </g>
    
    <!-- Coins -->
    <g opacity="0.7">
      <circle cx="-55" cy="-25" r="8" fill="url(#gradient16)"/>
      <circle cx="55" cy="-30" r="6" fill="url(#gradient17)"/>
      <circle cx="-60" cy="25" r="7" fill="url(#gradient18)"/>
      <circle cx="60" cy="20" r="5" fill="url(#gradient19)"/>
    </g>
  </g>
  
  <!-- Text -->
  <text x="100" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="url(#gradient20)">FluidVault</text>
  
  <!-- Gradients -->
  <defs>
    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6b7280;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4b5563;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d97706;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b45309;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient8" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient9" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient10" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:0.8" />
    </linearGradient>
    
    <linearGradient id="gradient11" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:0.8" />
    </linearGradient>
    
    <linearGradient id="gradient12" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#0891b2;stop-opacity:0.8" />
    </linearGradient>
    
    <linearGradient id="gradient13" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:0.8" />
    </linearGradient>
    
    <linearGradient id="gradient14" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:0.6" />
    </linearGradient>
    
    <linearGradient id="gradient15" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:0.6" />
    </linearGradient>
    
    <linearGradient id="gradient16" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:0.7" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:0.7" />
    </linearGradient>
    
    <linearGradient id="gradient17" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:0.7" />
      <stop offset="100%" style="stop-color:#d97706;stop-opacity:0.7" />
    </linearGradient>
    
    <linearGradient id="gradient18" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#eab308;stop-opacity:0.7" />
      <stop offset="100%" style="stop-color:#ca8a04;stop-opacity:0.7" />
    </linearGradient>
    
    <linearGradient id="gradient19" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:0.7" />
      <stop offset="100%" style="stop-color:#eab308;stop-opacity:0.7" />
    </linearGradient>
    
    <linearGradient id="gradient20" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;

// Simplified SVG for smaller sizes
const iconSVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="20" cy="20" r="18" fill="url(#gradient1)" stroke="url(#gradient2)" stroke-width="1"/>
  
  <!-- Main Vault Symbol -->
  <g transform="translate(20, 20)">
    <!-- Vault Base -->
    <rect x="-8" y="4" width="16" height="10" rx="2" fill="url(#gradient3)" stroke="url(#gradient4)" stroke-width="0.5"/>
    
    <!-- Vault Door -->
    <rect x="-6" y="5" width="12" height="8" rx="1.5" fill="url(#gradient5)"/>
    
    <!-- Vault Handle -->
    <circle cx="3" cy="9" r="1" fill="url(#gradient6)"/>
    
    <!-- Vault Lock -->
    <rect x="-5" y="7" width="2" height="2.5" rx="0.5" fill="url(#gradient8)"/>
    <circle cx="-4" cy="8" r="0.5" fill="url(#gradient9)"/>
    
    <!-- Fluid Drops -->
    <g opacity="0.8">
      <ellipse cx="-10" cy="-2" rx="1.5" ry="3" fill="url(#gradient10)" transform="rotate(-15 -10 -2)"/>
      <ellipse cx="10" cy="-3" rx="1.2" ry="2.5" fill="url(#gradient11)" transform="rotate(15 10 -3)"/>
    </g>
    
    <!-- Coins -->
    <g opacity="0.7">
      <circle cx="-11" cy="-5" r="2" fill="url(#gradient16)"/>
      <circle cx="11" cy="-6" r="1.5" fill="url(#gradient17)"/>
    </g>
  </g>
  
  <!-- Gradients -->
  <defs>
    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6b7280;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4b5563;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient8" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient9" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradient10" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:0.8" />
    </linearGradient>
    
    <linearGradient id="gradient11" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:0.8" />
    </linearGradient>
    
    <linearGradient id="gradient16" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:0.7" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:0.7" />
    </linearGradient>
    
    <linearGradient id="gradient17" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:0.7" />
      <stop offset="100%" style="stop-color:#d97706;stop-opacity:0.7" />
    </linearGradient>
  </defs>
</svg>`;

// Logo configurations
const logoConfigs = [
  { size: 200, filename: 'logo-200x200.png', svg: logoSVG },
  { size: 512, filename: 'logo-512x512.png', svg: logoSVG },
  { size: 40, filename: 'logo-icon-40x40.png', svg: iconSVG },
  { size: 32, filename: 'favicon-32x32.png', svg: iconSVG },
  { size: 16, filename: 'favicon-16x16.png', svg: iconSVG },
  { size: 192, filename: 'logo-192x192.png', svg: logoSVG },
  { size: 180, filename: 'apple-touch-icon-180x180.png', svg: logoSVG }
];

async function generatePNGs() {
  try {
    // Check if puppeteer is available
    const puppeteer = require('puppeteer');
    
    console.log('🎨 Starting FluidVault Logo PNG Generation...\n');
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Ensure public directory exists
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    for (const config of logoConfigs) {
      console.log(`📸 Generating ${config.filename} (${config.size}x${config.size})...`);
      
      // Set viewport to the logo size
      await page.setViewport({ width: config.size, height: config.size });
      
      // Create HTML with the SVG
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; }
            svg { width: ${config.size}px; height: ${config.size}px; }
          </style>
        </head>
        <body>
          ${config.svg}
        </body>
        </html>
      `;
      
      await page.setContent(html);
      
      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        omitBackground: false,
        clip: { x: 0, y: 0, width: config.size, height: config.size }
      });
      
      // Save to file
      const filePath = path.join(publicDir, config.filename);
      fs.writeFileSync(filePath, screenshot);
      
      console.log(`✅ Saved: ${config.filename}`);
    }
    
    await browser.close();
    
    console.log('\n🎉 All PNG logos generated successfully!');
    console.log('\n📁 Files saved to /public directory:');
    logoConfigs.forEach(config => {
      console.log(`   - ${config.filename}`);
    });
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('puppeteer')) {
      console.log('❌ Puppeteer not found. Installing...');
      console.log('📦 Please run: npm install puppeteer');
      console.log('🔄 Then run this script again.');
    } else {
      console.error('❌ Error generating PNGs:', error.message);
    }
  }
}

// Run the generator
if (require.main === module) {
  generatePNGs();
}

module.exports = { generatePNGs, logoConfigs };

