import * as esbuild from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

async function build() {
  try {
    await esbuild.build({
      entryPoints: [resolve(rootDir, 'server/_core/index.ts')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile: resolve(rootDir, 'dist/server.js'),
      format: 'esm',
      sourcemap: true,
      external: [
        // Node.js built-ins
        'fs', 'path', 'http', 'https', 'net', 'crypto', 'stream', 'url', 'util', 'os', 'events', 'buffer', 'querystring', 'zlib', 'child_process', 'tty', 'assert', 'dns', 'tls', 'module', 'worker_threads', 'perf_hooks', 'async_hooks', 'v8', 'vm', 'inspector',
        // Dependencies that should not be bundled
        'express',
        'dotenv',
        '@trpc/server',
        '@neondatabase/serverless',
        'drizzle-orm',
        'postgres',
        'bcryptjs',
        'jose',
        'cookie',
        'superjson',
        'zod',
        'axios',
        'nanoid',
        'qrcode',
        'openai',
        '@aws-sdk/client-s3',
        '@aws-sdk/s3-request-presigner',
        'vite',
        // Build tools that shouldn't be in server
        'lightningcss',
        '@tailwindcss/oxide',
        '@tailwindcss/oxide-linux-x64-musl',
        '@tailwindcss/oxide-linux-x64-gnu',
        '@babel/core',
        '@babel/preset-typescript',
        'tailwindcss',
        'postcss',
        'autoprefixer',
      ],
      alias: {
        '@shared': resolve(rootDir, 'shared'),
      },
      define: {
        'import.meta.dirname': '__dirname',
      },
      banner: {
        js: `
import { createRequire as __banner_createRequire } from 'module';
import { fileURLToPath as __banner_fileURLToPath } from 'url';
import { dirname as __banner_dirname } from 'path';
const require = __banner_createRequire(import.meta.url);
const __filename = __banner_fileURLToPath(import.meta.url);
const __dirname = __banner_dirname(__filename);
`,
      },
    });
    console.log('✅ Server build completed successfully!');
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

build();
