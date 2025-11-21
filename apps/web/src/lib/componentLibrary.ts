import { ComponentDefinition } from '../types';

export const componentLibrary: ComponentDefinition[] = [
  // Layout Components
  {
    id: 'container',
    name: 'Container',
    category: 'layout',
    description: 'A flexible container with padding and max-width',
    icon: '📦',
    props: [
      {
        name: 'maxWidth',
        type: 'select',
        defaultValue: 'xl',
        options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
        description: 'Maximum width of the container'
      },
      {
        name: 'padding',
        type: 'select',
        defaultValue: '4',
        options: ['0', '2', '4', '6', '8'],
        description: 'Padding size'
      }
    ],
    code: `<div className="container mx-auto max-w-{maxWidth} p-{padding}">
  {children}
</div>`
  },
  {
    id: 'flex',
    name: 'Flex Container',
    category: 'layout',
    description: 'Flexbox layout container',
    icon: '↔️',
    props: [
      {
        name: 'direction',
        type: 'select',
        defaultValue: 'row',
        options: ['row', 'col'],
        description: 'Flex direction'
      },
      {
        name: 'gap',
        type: 'select',
        defaultValue: '4',
        options: ['0', '2', '4', '6', '8'],
        description: 'Gap between items'
      },
      {
        name: 'justify',
        type: 'select',
        defaultValue: 'start',
        options: ['start', 'center', 'end', 'between', 'around'],
        description: 'Justify content'
      },
      {
        name: 'align',
        type: 'select',
        defaultValue: 'start',
        options: ['start', 'center', 'end', 'stretch'],
        description: 'Align items'
      }
    ],
    code: `<div className="flex flex-{direction} gap-{gap} justify-{justify} items-{align}">
  {children}
</div>`
  },
  {
    id: 'grid',
    name: 'Grid Container',
    category: 'layout',
    description: 'CSS Grid layout',
    icon: '⊞',
    props: [
      {
        name: 'cols',
        type: 'select',
        defaultValue: '3',
        options: ['1', '2', '3', '4', '6', '12'],
        description: 'Number of columns'
      },
      {
        name: 'gap',
        type: 'select',
        defaultValue: '4',
        options: ['0', '2', '4', '6', '8'],
        description: 'Gap between items'
      }
    ],
    code: `<div className="grid grid-cols-{cols} gap-{gap}">
  {children}
</div>`
  },
  
  // UI Components
  {
    id: 'button',
    name: 'Button',
    category: 'ui',
    description: 'Interactive button component',
    icon: '🔘',
    props: [
      {
        name: 'variant',
        type: 'select',
        defaultValue: 'primary',
        options: ['primary', 'secondary', 'outline', 'ghost'],
        description: 'Button style variant'
      },
      {
        name: 'size',
        type: 'select',
        defaultValue: 'md',
        options: ['sm', 'md', 'lg'],
        description: 'Button size'
      },
      {
        name: 'text',
        type: 'string',
        defaultValue: 'Click me',
        description: 'Button text'
      }
    ],
    code: `<button className="btn btn-{variant} btn-{size}">
  {text}
</button>`
  },
  {
    id: 'card',
    name: 'Card',
    category: 'ui',
    description: 'Content card with border and shadow',
    icon: '🃏',
    props: [
      {
        name: 'padding',
        type: 'select',
        defaultValue: '6',
        options: ['4', '6', '8'],
        description: 'Card padding'
      },
      {
        name: 'shadow',
        type: 'select',
        defaultValue: 'md',
        options: ['sm', 'md', 'lg', 'xl'],
        description: 'Shadow size'
      }
    ],
    code: `<div className="rounded-lg border bg-white p-{padding} shadow-{shadow}">
  {children}
</div>`
  },
  {
    id: 'heading',
    name: 'Heading',
    category: 'ui',
    description: 'Text heading',
    icon: 'H',
    props: [
      {
        name: 'level',
        type: 'select',
        defaultValue: '2',
        options: ['1', '2', '3', '4', '5', '6'],
        description: 'Heading level'
      },
      {
        name: 'text',
        type: 'string',
        defaultValue: 'Heading',
        description: 'Heading text'
      }
    ],
    code: `<h{level} className="text-{level}xl font-bold">{text}</h{level}>`
  },
  
  // Form Components
  {
    id: 'input',
    name: 'Text Input',
    category: 'form',
    description: 'Text input field',
    icon: '📝',
    props: [
      {
        name: 'placeholder',
        type: 'string',
        defaultValue: 'Enter text...',
        description: 'Placeholder text'
      },
      {
        name: 'type',
        type: 'select',
        defaultValue: 'text',
        options: ['text', 'email', 'password', 'number'],
        description: 'Input type'
      }
    ],
    code: `<input type="{type}" placeholder="{placeholder}" className="input" />`
  },
  {
    id: 'textarea',
    name: 'Text Area',
    category: 'form',
    description: 'Multi-line text input',
    icon: '📄',
    props: [
      {
        name: 'rows',
        type: 'number',
        defaultValue: 4,
        description: 'Number of rows'
      },
      {
        name: 'placeholder',
        type: 'string',
        defaultValue: 'Enter text...',
        description: 'Placeholder text'
      }
    ],
    code: `<textarea rows={rows} placeholder="{placeholder}" className="textarea" />`
  },
  {
    id: 'select',
    name: 'Select',
    category: 'form',
    description: 'Dropdown select',
    icon: '▼',
    props: [
      {
        name: 'options',
        type: 'array',
        defaultValue: ['Option 1', 'Option 2', 'Option 3'],
        description: 'Select options'
      }
    ],
    code: `<select className="select">
  {options.map(opt => <option key={opt}>{opt}</option>)}
</select>`
  }
];

export function getComponentsByCategory(category: string) {
  return componentLibrary.filter(c => c.category === category);
}

export function getComponentById(id: string) {
  return componentLibrary.find(c => c.id === id);
}
