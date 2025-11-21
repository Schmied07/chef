import { useState } from 'react';
import { componentLibrary } from '../../lib/componentLibrary';
import ComponentItem from './ComponentItem';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

export default function ComponentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'layout', 'ui', 'form', 'data', 'media'];

  const filteredComponents = componentLibrary.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full flex-col bg-bolt-elements-background-depth-2" data-testid="component-library">
      {/* Header */}
      <div className="border-b border-bolt-elements-borderColor p-4">
        <h2 className="mb-4 text-lg font-bold text-bolt-elements-textPrimary">
          Component Library
        </h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bolt-elements-textSecondary" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 py-2 pl-10 pr-4 text-sm text-bolt-elements-textPrimary focus:border-blue-500 focus:outline-none"
            data-testid="component-search"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={classNames(
                'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap',
                {
                  'bg-blue-500 text-white': selectedCategory === category,
                  'bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary': selectedCategory !== category
                }
              )}
              data-testid={`category-${category}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {filteredComponents.length === 0 ? (
            <div className="py-8 text-center text-sm text-bolt-elements-textSecondary">
              No components found
            </div>
          ) : (
            filteredComponents.map((component) => (
              <ComponentItem key={component.id} component={component} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
