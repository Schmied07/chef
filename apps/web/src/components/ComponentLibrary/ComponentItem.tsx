import { useDrag } from 'react-dnd';
import { ComponentDefinition } from '../../types';
import classNames from 'classnames';

interface ComponentItemProps {
  component: ComponentDefinition;
}

export default function ComponentItem({ component }: ComponentItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: {
      type: 'component',
      componentId: component.id,
      defaultProps: component.props.reduce((acc, prop) => {
        acc[prop.name] = prop.defaultValue;
        return acc;
      }, {} as Record<string, any>)
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={classNames(
        'cursor-move rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-3 transition-all hover:border-blue-500 hover:shadow-md',
        {
          'opacity-50': isDragging
        }
      )}
      data-testid={`component-item-${component.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{component.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-bolt-elements-textPrimary">
            {component.name}
          </h3>
          <p className="mt-1 text-xs text-bolt-elements-textSecondary line-clamp-2">
            {component.description}
          </p>
        </div>
      </div>
    </div>
  );
}
