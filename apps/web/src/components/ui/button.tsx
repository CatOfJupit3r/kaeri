import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Slot as SlotPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';

import { cn } from '@~/lib/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 border-2 border-foreground text-sm font-bold tracking-wide whitespace-nowrap uppercase transition-all outline-none hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'brutalist-shadow-sm bg-primary text-primary-foreground hover:shadow-none',
        destructive: 'brutalist-shadow-sm bg-destructive text-white hover:shadow-none',
        outline: 'brutalist-shadow-sm bg-transparent hover:bg-[var(--brutalist-yellow)] hover:shadow-none',
        secondary: 'brutalist-shadow-sm bg-secondary text-secondary-foreground hover:shadow-none',
        ghost: 'border-transparent hover:border-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface iButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tooltip?: string;
}

function Button({ className, variant, size, asChild = false, tooltip, ...props }: iButtonProps) {
  const Comp = asChild ? SlotPrimitive.Slot : 'button';

  if (!tooltip)
    return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export { Button, buttonVariants };
