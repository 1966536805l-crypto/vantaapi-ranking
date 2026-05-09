#!/usr/bin/env node

/**
 * Lighthouse Performance Check
 *
 * Runs Lighthouse audits on the local or deployed site
 * Usage: node scripts/lighthouse-check.js [--url=http://localhost:3000]
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const urlArg = args.find(arg => arg.startsWith('--url='));
const targetUrl = urlArg ? urlArg.split('=')[1] : 'http://localhost:3000';

console.log('🔍 Lighthouse Performance Check');
console.log(`Target: ${targetUrl}\n`);

// Check if lighthouse is installed
const checkLighthouse = spawn('npx', ['lighthouse', '--version'], { stdio: 'pipe' });

checkLighthouse.on('error', () => {
  console.log('⚠️  Lighthouse not found. Install it with:');
  console.log('   npm install -g lighthouse');
  console.log('\nOr run with npx (will auto-install):');
  console.log(`   npx lighthouse ${targetUrl} --view`);
  process.exit(1);
});

checkLighthouse.on('close', (code) => {
  if (code !== 0) {
    console.log('⚠️  Lighthouse check failed');
    process.exit(1);
  }

  console.log('Running Lighthouse audit...\n');

  const outputDir = path.join(process.cwd(), '.lighthouse');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `report-${Date.now()}.html`);

  const lighthouse = spawn('npx', [
    'lighthouse',
    targetUrl,
    '--output=html',
    '--output-path=' + outputPath,
    '--chrome-flags=--headless',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--preset=desktop'
  ], { stdio: 'inherit' });

  lighthouse.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Lighthouse audit complete!');
      console.log(`📊 Report saved to: ${outputPath}`);
      console.log('\nPerformance targets:');
      console.log('  - Performance: 90+');
      console.log('  - Accessibility: 95+');
      console.log('  - Best Practices: 95+');
      console.log('  - SEO: 90+');
    } else {
      console.log('\n❌ Lighthouse audit failed');
      process.exit(1);
    }
  });
});
