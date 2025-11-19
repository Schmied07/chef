/**
 * Complexity Analysis Example
 * 
 * This example demonstrates how different projects are analyzed for complexity.
 */

import { ExecutionStrategySelector, ExecutionStrategy } from '../src/index.js';
import type { ProjectFile, ProjectDependencies } from '../src/index.js';

const selector = new ExecutionStrategySelector();

console.log('🧪 Testing Complexity Analysis\n');

// Test 1: Simple HTML/JS Project
console.log('═══════════════════════════════════════════════════');
console.log('Test 1: Simple HTML/JS Project');
console.log('═══════════════════════════════════════════════════');

const simpleProject: ProjectFile[] = [
  { path: 'index.html', content: '<html><body><h1>Hello</h1></body></html>' },
  { path: 'script.js', content: 'console.log("Hello, World!");' },
  { path: 'style.css', content: 'body { margin: 0; }' },
];

const simpleAnalysis = selector.analyzeComplexity(simpleProject);
console.log(`Score: ${simpleAnalysis.score}/100`);
console.log(`Strategy: ${simpleAnalysis.recommendedStrategy}`);
console.log(`Files: ${simpleAnalysis.factors.fileCount}`);
console.log(`Size: ${(simpleAnalysis.factors.totalSize / 1024).toFixed(2)} KB`);
console.log(`Reasoning: ${simpleAnalysis.reasoning}\n`);

// Test 2: React Project with Dependencies
console.log('═══════════════════════════════════════════════════');
console.log('Test 2: React Project with Dependencies');
console.log('═══════════════════════════════════════════════════');

const reactFiles: ProjectFile[] = Array.from({ length: 20 }, (_, i) => ({
  path: `src/components/Component${i}.tsx`,
  content: `import React from 'react';\nexport const Component${i} = () => <div>Component ${i}</div>;`,
}));

reactFiles.push({
  path: 'vite.config.ts',
  content: 'import { defineConfig } from "vite";\nexport default defineConfig({});',
});

const reactDeps: ProjectDependencies = {
  dependencies: {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  },
  devDependencies: {
    vite: '^5.0.0',
    '@types/react': '^18.2.0',
    typescript: '^5.3.0',
  },
};

const reactAnalysis = selector.analyzeComplexity(reactFiles, reactDeps);
console.log(`Score: ${reactAnalysis.score}/100`);
console.log(`Strategy: ${reactAnalysis.recommendedStrategy}`);
console.log(`Files: ${reactAnalysis.factors.fileCount}`);
console.log(`Dependencies: ${reactAnalysis.factors.dependencyCount}`);
console.log(`Heavy Deps: ${reactAnalysis.factors.hasHeavyDependencies ? 'Yes' : 'No'}`);
console.log(`Build Step: ${reactAnalysis.factors.hasBuildStep ? 'Yes' : 'No'}`);
console.log(`Reasoning: ${reactAnalysis.reasoning}\n`);

// Test 3: Complex Project with Heavy Dependencies
console.log('═══════════════════════════════════════════════════');
console.log('Test 3: Complex Project with Heavy Dependencies');
console.log('═══════════════════════════════════════════════════');

const complexFiles: ProjectFile[] = Array.from({ length: 150 }, (_, i) => ({
  path: `src/modules/module${i}/index.ts`,
  content: `export const module${i} = () => ({ id: ${i} });`,
}));

complexFiles.push({
  path: 'webpack.config.js',
  content: 'module.exports = { entry: "./src/index.ts" };',
});

const complexDeps: ProjectDependencies = {
  dependencies: {
    webpack: '^5.89.0',
    prisma: '^5.0.0',
    '@prisma/client': '^5.0.0',
    next: '^14.0.0',
    react: '^18.2.0',
    'node-gyp': '^10.0.0',
  },
  devDependencies: {
    typescript: '^5.3.0',
    '@types/node': '^20.0.0',
  },
};

const complexAnalysis = selector.analyzeComplexity(complexFiles, complexDeps);
console.log(`Score: ${complexAnalysis.score}/100`);
console.log(`Strategy: ${complexAnalysis.recommendedStrategy}`);
console.log(`Files: ${complexAnalysis.factors.fileCount}`);
console.log(`Size: ${(complexAnalysis.factors.totalSize / 1024).toFixed(2)} KB`);
console.log(`Dependencies: ${complexAnalysis.factors.dependencyCount}`);
console.log(`Heavy Deps: ${complexAnalysis.factors.hasHeavyDependencies ? 'Yes' : 'No'}`);
console.log(`Native Deps: ${complexAnalysis.factors.hasNativeDependencies ? 'Yes' : 'No'}`);
console.log(`Build Step: ${complexAnalysis.factors.hasBuildStep ? 'Yes' : 'No'}`);
console.log(`Reasoning: ${complexAnalysis.reasoning}\n`);

// Test 4: Testing Override Mechanism
console.log('═══════════════════════════════════════════════════');
console.log('Test 4: Strategy Override');
console.log('═══════════════════════════════════════════════════');

const decision1 = selector.decideStrategy(simpleProject);
console.log(`Without override: ${decision1.strategy} (score: ${decision1.analysis.score})`);

const decision2 = selector.decideStrategy(simpleProject, undefined, ExecutionStrategy.DOCKER);
console.log(`With DOCKER override: ${decision2.strategy} (score: ${decision2.analysis.score})`);

const decision3 = selector.decideStrategy(simpleProject, undefined, ExecutionStrategy.AUTO);
console.log(`With AUTO override: ${decision3.strategy} (score: ${decision3.analysis.score})`);

console.log('\n✅ All complexity analysis tests completed!');
