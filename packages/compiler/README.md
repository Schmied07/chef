# @chef/compiler

Template Compiler and Renderer for Chef.

## Overview

The compiler package handles template parameterization, rendering, and file generation for Chef projects.

## Features

- Template variable substitution
- Conditional file generation
- Automatic README, CI, and config file generation
- Metadata-driven templates

## Usage

```typescript
import { renderTemplateFiles, generateReadme } from '@chef/compiler';

const files = renderTemplateFiles(metadata, {
  projectName: 'my-app',
  framework: 'react',
});

const readme = generateReadme('my-app', 'A cool app', ['Auth', 'Database']);
```

## Template Format

Templates use simple `${variable}` syntax:

```typescript
const template = `
import { ${framework} } from '${framework}';

export default function App() {
  return <div>${projectName}</div>;
}
`;
```

## Development

```bash
pnpm test
pnpm typecheck
pnpm build
```

## License

MIT
