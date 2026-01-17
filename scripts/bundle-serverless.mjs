/**
 * Bundle serverless functions for Vercel deployment
 * This eliminates module resolution issues by bundling all dependencies
 *
 * Usage: node scripts/bundle-serverless.mjs
 */

import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

const isDev = process.env.NODE_ENV === 'development';

console.log('🔨 Bundling serverless functions...');

try {
  // Bundle the tRPC handler
  await esbuild.build({
    entryPoints: ['api/trpc/[...trpc].ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs', // CommonJS for compatibility
    outdir: 'dist/api/trpc',
    outExtension: { '.js': '.js' },

    // External modules (don't bundle these)
    external: [
      '@neondatabase/serverless',
      'pg-native',
      'encoding',
    ],

    // Source maps for debugging
    sourcemap: isDev,
    minify: !isDev,

    // Keep names for better error messages
    keepNames: true,

    // Tree shaking
    treeShaking: true,

    // Define environment (tells bundler this is Node.js)
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },

    // Log details
    logLevel: 'info',

    // Resolve extensions
    resolveExtensions: ['.ts', '.js', '.json'],

    // Handle .node files
    loader: {
      '.node': 'file',
    },

    // Banner to add to output
    banner: {
      js: '// Bundled by esbuild for Vercel deployment\n',
    },
  });

  // Bundle the health check endpoint
  await esbuild.build({
    entryPoints: ['api/health.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outdir: 'dist/api',
    outExtension: { '.js': '.js' },
    sourcemap: isDev,
    minify: !isDev,
    keepNames: true,
    logLevel: 'info',
  });

  console.log('✅ Bundling complete!');
  console.log('📦 Output:');
  console.log('   - dist/api/trpc/[...trpc].js');
  console.log('   - dist/api/health.js');
  console.log('');
  console.log('💡 Next step: Update vercel.json to use bundled files');

} catch (error) {
  console.error('❌ Bundling failed:', error);
  process.exit(1);
}
