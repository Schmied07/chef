/**
 * Example Usage of Template System
 * Sprint 5 - Complete example
 */

import { 
  TEMPLATES, 
  getAllTemplates,
  getTemplate,
  FileGenerator, 
  TemplateEngine,
  AutoGenerator,
  type TemplateConfig,
  type GeneratedProject 
} from './index';

// Import template metadata and files
import reactConvexMetadata from './react-convex/metadata.json';
import { reactConvexFiles } from './react-convex/files';

/**
 * Example 1: List all available templates
 */
export function exampleListTemplates() {
  console.log('Available Templates:');
  const templates = getAllTemplates();
  templates.forEach(template => {
    console.log(`- ${template.name} (${template.id})`);
    console.log(`  Category: ${template.category}`);
    console.log(`  Tech: ${template.techStack.join(', ')}`);
  });
}

/**
 * Example 2: Generate a React + Convex project
 */
export async function exampleGenerateReactConvex(): Promise<GeneratedProject> {
  // 1. Configure the project
  const config: TemplateConfig = {
    projectName: 'my-awesome-app',
    variables: {
      projectName: 'my-awesome-app',
      auth: true,
      database: 'convex',
      styling: 'tailwind',
      port: 5173,
    },
    features: ['auth', 'realtime', 'file-storage'],
  };

  // 2. Create file generator
  const generator = new FileGenerator(config);

  // 3. Generate complete project
  const project = await generator.generateProject(
    'react-convex',
    reactConvexMetadata as any,
    reactConvexFiles
  );

  console.log(`Generated project: ${project.name}`);
  console.log(`Files: ${project.files.length}`);
  console.log('README preview:', project.readme.substring(0, 200));

  return project;
}

/**
 * Example 3: Template Engine - Variable replacement
 */
export function exampleTemplateEngine() {
  const config: TemplateConfig = {
    projectName: 'MyAwesomeApp',
    variables: {
      projectName: 'MyAwesomeApp',
      auth: true,
      port: 3000,
    },
    features: [],
  };

  const engine = new TemplateEngine(config);

  // Test variable replacement
  const template1 = 'Project: {{projectName}}';
  console.log(engine.processTemplate(template1));
  // Output: "Project: MyAwesomeApp"

  // Test filters
  const template2 = '{{projectName | kebab-case}}';
  console.log(engine.processTemplate(template2));
  // Output: "my-awesome-app"

  const template3 = '{{projectName | lowercase}}';
  console.log(engine.processTemplate(template3));
  // Output: "myawesomeapp"

  // Test conditionals
  const condition = '{{auth}} === true && {{port}} > 1000';
  console.log(engine.evaluateCondition(condition));
  // Output: true
}

/**
 * Example 4: Auto-generation utilities
 */
export function exampleAutoGeneration() {
  const config: TemplateConfig = {
    projectName: 'my-api',
    variables: {
      projectName: 'my-api',
      database: 'mongodb',
    },
    features: ['auth', 'api'],
  };

  const autoGen = new AutoGenerator(config);

  // Generate CI/CD workflow
  const ciWorkflow = autoGen.generateCIWorkflow(reactConvexMetadata as any);
  console.log('CI Workflow generated');

  // Generate docker-compose
  const dockerCompose = autoGen.generateDockerCompose(reactConvexMetadata as any);
  console.log('Docker Compose generated');

  // Generate API docs
  const apiDocs = autoGen.generateAPIDocumentation(reactConvexMetadata as any);
  console.log('API Documentation generated');
}

/**
 * Example 5: Conditional file generation
 */
export async function exampleConditionalFiles() {
  // Config with auth enabled
  const configWithAuth: TemplateConfig = {
    projectName: 'secure-app',
    variables: {
      projectName: 'secure-app',
      auth: true,
    },
    features: ['auth'],
  };

  const generator1 = new FileGenerator(configWithAuth);
  const project1 = await generator1.generateProject(
    'react-convex',
    reactConvexMetadata as any,
    reactConvexFiles
  );

  console.log('With auth - Files:', project1.files.length);
  // Will include auth.config.ts and auth.tsx

  // Config with auth disabled
  const configWithoutAuth: TemplateConfig = {
    projectName: 'simple-app',
    variables: {
      projectName: 'simple-app',
      auth: false,
    },
    features: [],
  };

  const generator2 = new FileGenerator(configWithoutAuth);
  const project2 = await generator2.generateProject(
    'react-convex',
    reactConvexMetadata as any,
    reactConvexFiles
  );

  console.log('Without auth - Files:', project2.files.length);
  // Will NOT include auth.config.ts and auth.tsx
}

/**
 * Example 6: Get specific template
 */
export function exampleGetTemplate() {
  const template = getTemplate('react-node');
  
  if (template) {
    console.log(`Template: ${template.name}`);
    console.log(`Backend: ${template.metadata.backend}`);
    console.log(`Database: ${template.metadata.database}`);
    console.log(`Features: ${template.features.join(', ')}`);
  }
}

/**
 * Example 7: Validate configuration
 */
export function exampleValidateConfig() {
  const variables = {
    projectName: 'my-app',
    auth: 'yes', // Wrong type! Should be boolean
    port: 99999, // Out of range!
  };

  const schema = reactConvexMetadata.variables;
  const result = TemplateEngine.validateVariables(variables as any, schema as any);

  if (result.valid) {
    console.log('Configuration is valid!');
  } else {
    console.log('Validation errors:');
    result.errors.forEach(error => console.log(`- ${error}`));
  }
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== Template System Examples ===\n');
  
  console.log('1. List Templates');
  exampleListTemplates();
  
  console.log('\n2. Generate Project');
  exampleGenerateReactConvex();
  
  console.log('\n3. Template Engine');
  exampleTemplateEngine();
  
  console.log('\n4. Auto Generation');
  exampleAutoGeneration();
  
  console.log('\n5. Conditional Files');
  exampleConditionalFiles();
  
  console.log('\n6. Get Template');
  exampleGetTemplate();
  
  console.log('\n7. Validate Config');
  exampleValidateConfig();
}
