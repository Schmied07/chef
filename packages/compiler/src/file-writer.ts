/**
 * File writer - Writes rendered files to disk
 */

import type { RenderedFile } from './types';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';

/**
 * Ensures a directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Writes a single file to disk
 */
export async function writeFile(
  outputDir: string,
  file: RenderedFile
): Promise<void> {
  const fullPath = join(outputDir, file.path);
  const dir = dirname(fullPath);

  await ensureDir(dir);
  await fs.writeFile(fullPath, file.content, 'utf-8');
}

/**
 * Writes multiple files to disk
 */
export async function writeFiles(
  outputDir: string,
  files: RenderedFile[]
): Promise<void> {
  await Promise.all(files.map((file) => writeFile(outputDir, file)));
}

/**
 * Generates a README.md file
 */
export function generateReadme(
  projectName: string,
  description: string,
  features: string[]
): RenderedFile {
  const content = `# ${projectName}

${description}

## Features

${features.map((f) => `- ${f}`).join('\n')}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
  ├── components/    # React components
  ├── lib/          # Utility functions
  └── styles/       # CSS styles
\`\`\`

## License

MIT
`;

  return {
    path: 'README.md',
    content,
  };
}

/**
 * Generates a .env.example file
 */
export function generateEnvExample(variables: string[]): RenderedFile {
  const content = variables.map((v) => `${v}=`).join('\n') + '\n';

  return {
    path: '.env.example',
    content,
  };
}

/**
 * Generates a basic GitHub Actions CI file
 */
export function generateCI(): RenderedFile {
  const content = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
`;

  return {
    path: '.github/workflows/ci.yml',
    content,
  };
}
