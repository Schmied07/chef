/**
 * Basic Usage Example for @chef/engine
 * 
 * This example demonstrates how to use the BuildEngine to create and manage builds.
 */

import { BuildEngine, ExecutionStrategy } from '../src/index.js';

// Example project files
const exampleFiles = [
  {
    path: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chef Example</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>`,
  },
  {
    path: 'src/main.ts',
    content: `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');`,
  },
  {
    path: 'src/App.vue',
    content: `<template>
  <div>
    <h1>Hello from Chef!</h1>
  </div>
</template>

<script setup lang="ts">
console.log('App mounted');
</script>`,
  },
  {
    path: 'package.json',
    content: JSON.stringify({
      name: 'chef-example',
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
      },
      dependencies: {
        vue: '^3.4.0',
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^5.0.0',
        vite: '^5.0.0',
        typescript: '^5.3.0',
      },
    }, null, 2),
  },
  {
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});`,
  },
];

async function main() {
  console.log('🚀 Starting BuildEngine Example\n');

  // Initialize the engine
  const engine = new BuildEngine({
    workersApiUrl: process.env.WORKERS_API_URL || 'http://localhost:3001',
    logger: {
      level: 'info',
      pretty: true,
    },
    maxRetries: 3,
    retryDelay: 1000,
  });

  try {
    // Step 1: Check workers service health
    console.log('📡 Checking workers service health...');
    const isHealthy = await engine.checkHealth();
    if (!isHealthy) {
      console.error('❌ Workers service is not available');
      console.log('Please start the workers service first:');
      console.log('  cd /app/workers && docker-compose up -d');
      process.exit(1);
    }
    console.log('✅ Workers service is healthy\n');

    // Step 2: Estimate complexity without building
    console.log('🔍 Estimating build complexity...');
    const complexity = engine.estimateBuildComplexity(exampleFiles);
    console.log(`  Score: ${complexity.score}/100`);
    console.log(`  Strategy: ${complexity.recommendedStrategy}`);
    console.log(`  Reasoning: ${complexity.reasoning}\n`);

    // Step 3: Create a build
    console.log('🏗️  Creating build...');
    const buildResult = await engine.createBuild({
      chatId: 'example-chat-' + Date.now(),
      files: exampleFiles,
      // strategy: ExecutionStrategy.AUTO, // Let engine decide
      priority: 5,
    });

    console.log(`✅ Build created!`);
    console.log(`  Build ID: ${buildResult.buildId}`);
    console.log(`  Status: ${buildResult.status}`);
    console.log(`  Strategy: ${buildResult.strategy}`);
    console.log(`  Complexity: ${buildResult.complexity.score}/100\n`);

    // Step 4: Wait for build completion
    console.log('⏳ Waiting for build to complete...');
    console.log('   (This may take a few minutes)\n');

    let lastProgress = 0;
    const finalResult = await engine.waitForBuild(buildResult.buildId, {
      timeout: 300000, // 5 minutes
      onProgress: (progress) => {
        if (progress !== lastProgress) {
          console.log(`   Progress: ${progress}%`);
          lastProgress = progress;
        }
      },
    });

    console.log(`\n✅ Build ${finalResult.status}!`);
    console.log(`  Build ID: ${finalResult.buildId}`);
    console.log(`  Status: ${finalResult.status}`);
    console.log(`  Progress: ${finalResult.progress}%`);
    console.log(`  Started: ${finalResult.createdAt}`);
    if (finalResult.finishedAt) {
      const duration = finalResult.finishedAt.getTime() - finalResult.createdAt.getTime();
      console.log(`  Duration: ${(duration / 1000).toFixed(2)}s`);
    }

    // Step 5: Get queue statistics
    console.log('\n📊 Queue statistics:');
    const stats = await engine.getStats();
    console.log(JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the example
main().catch(console.error);
