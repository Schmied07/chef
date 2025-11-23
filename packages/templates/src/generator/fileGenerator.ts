/**
 * File Generator - Generate project files from templates
 * Sprint 5.1 & 5.2
 */

import type { TemplateMetadata, TemplateFile, GeneratedProject, TemplateConfig } from '../metadata/types';
import { TemplateEngine } from './templateEngine';

export class FileGenerator {
  private engine: TemplateEngine;
  private config: TemplateConfig;

  constructor(config: TemplateConfig) {
    this.config = config;
    this.engine = new TemplateEngine(config);
  }

  /**
   * Generate complete project from template
   */
  async generateProject(
    templateId: string,
    metadata: TemplateMetadata,
    baseFiles: Record<string, string>
  ): Promise<GeneratedProject> {
    const files: TemplateFile[] = [];

    // Process base files
    for (const [path, content] of Object.entries(baseFiles)) {
      files.push({
        path: this.engine.processTemplate(path),
        content: this.engine.processTemplate(content),
      });
    }

    // Process conditional files
    for (const conditionalFile of metadata.conditionalFiles) {
      if (this.engine.evaluateCondition(conditionalFile.condition)) {
        files.push({
          path: this.engine.processTemplate(conditionalFile.path),
          content: this.engine.processTemplate(conditionalFile.template),
        });
      }
    }

    // Generate package.json
    const packageJson = this.generatePackageJson(metadata);
    files.push({
      path: 'package.json',
      content: JSON.stringify(packageJson, null, 2),
    });

    // Generate README.md
    const readme = this.generateReadme(metadata);

    // Generate .env.example
    const envExample = this.generateEnvExample(metadata);
    files.push({
      path: '.env.example',
      content: envExample,
    });

    return {
      name: this.config.projectName,
      template: templateId,
      files,
      metadata,
      readme,
      envExample,
    };
  }

  /**
   * Generate package.json
   */
  private generatePackageJson(metadata: TemplateMetadata): any {
    const dependencies: Record<string, string> = { ...metadata.dependencies.required };
    
    // Add optional dependencies based on enabled features
    Object.entries(metadata.dependencies.optional).forEach(([pkg, config]) => {
      if (this.engine.evaluateCondition(config.condition)) {
        dependencies[pkg] = config.version;
      }
    });

    return {
      name: this.engine.processTemplate('{{projectName | kebab-case}}'),
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: metadata.scripts,
      dependencies,
      devDependencies: metadata.dependencies.devDependencies,
    };
  }

  /**
   * Generate README.md
   */
  private generateReadme(metadata: TemplateMetadata): string {
    const projectName = this.engine.processTemplate('{{projectName}}');
    const features = metadata.features
      .filter(f => this.config.features.includes(f.id))
      .map(f => `- ${f.name}: ${f.description}`)
      .join('\n');

    return `# ${projectName}

${metadata.description}

## 🚀 Features

${features}

## 📋 Prerequisites

- Node.js 18+
- npm or yarn or pnpm

## 🛠️ Setup

1. **Install dependencies:**

\`\`\`bash
npm install
# or
pnpm install
\`\`\`

2. **Configure environment variables:**

Copy \`.env.example\` to \`.env\` and fill in your values:

\`\`\`bash
cp .env.example .env
\`\`\`

3. **Start development server:**

\`\`\`bash
npm run dev
\`\`\`

## 📝 Available Scripts

${Object.entries(metadata.scripts)
  .map(([cmd, desc]) => `- \`npm run ${cmd}\` - ${desc}`)
  .join('\n')}

## 🏗️ Project Structure

\`\`\`
${this.generateProjectStructure()}
\`\`\`

## 🔧 Configuration

See \`.env.example\` for all available configuration options.

## 📄 License

${metadata.license || 'MIT'}

---

Generated with ❤️ by [Chef](https://chef.convex.dev)
`;
  }

  /**
   * Generate .env.example
   */
  private generateEnvExample(metadata: TemplateMetadata): string {
    const lines: string[] = ['# Environment Variables', ''];

    Object.entries(metadata.variables).forEach(([key, variable]) => {
      lines.push(`# ${variable.description}`);
      if (variable.type === 'select' && variable.options) {
        lines.push(`# Options: ${variable.options.join(', ')}`);
      }
      lines.push(`${key.toUpperCase()}=${variable.default || ''}`);
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Generate project structure tree
   */
  private generateProjectStructure(): string {
    return `.
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── main.tsx
├── public/
├── package.json
├── .env.example
└── README.md`;
  }
}
