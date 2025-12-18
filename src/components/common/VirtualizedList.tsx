/**
 * Virtualized List Component
 * 
 * Wrapper for react-window to provide virtualized rendering of large lists.
 */

import React from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscanCount?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight = 400,
  renderItem,
  className = '',
  overscanCount = 5,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: VirtualizedListProps<T>) {
  const Row = ({ index, style }: ListChildComponentProps) => (
    <div style={style} role="listitem">
      {renderItem(items[index], index)}
    </div>
  );

  return (
    <div
      className={className}
      role="list"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <FixedSizeList
        height={containerHeight}
        itemCount={items.length}
        itemSize={itemHeight}
        width="100%"
        overscanCount={overscanCount}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}

