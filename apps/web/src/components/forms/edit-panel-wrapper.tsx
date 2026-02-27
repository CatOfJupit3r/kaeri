import type { ReactNode } from 'react';
import { LuArrowLeft } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { Separator } from '@~/components/ui/separator';

interface iEditPanelWrapperProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Optional action buttons to render in header */
  headerActions?: ReactNode;
}

/**
 * Wrapper component for edit panel forms.
 * Provides consistent header with back button and scrollable content area.
 */
export function EditPanelWrapper({ title, onClose, children, headerActions }: iEditPanelWrapperProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b-2 border-foreground bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <LuArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">{children}</ScrollArea>
    </div>
  );
}

interface iPanelLoadingProps {
  message?: string;
}

/**
 * Loading state for panels.
 */
export function PanelLoading({ message = 'Loading...' }: iPanelLoadingProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

interface iPanelErrorProps {
  error?: Error | null;
  message?: string;
  onClose: () => void;
}

/**
 * Error state for panels with a back button.
 */
export function PanelError({ error, message, onClose }: iPanelErrorProps) {
  const errorMessage = message ?? (error ? `Error: ${error.message}` : 'Something went wrong');

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-destructive">{errorMessage}</p>
      <Button variant="outline" onClick={onClose}>
        Go Back
      </Button>
    </div>
  );
}
