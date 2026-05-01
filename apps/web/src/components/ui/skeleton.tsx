import type { ComponentProps } from 'react';

import { cn } from '@~/lib/utils';

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      data-testid="skeleton"
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  );
}

export { Skeleton };
