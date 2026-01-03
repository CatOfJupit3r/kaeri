import type { ReactNode } from 'react';

import { Button } from '@~/components/ui/button';

interface iListPendingStateProps {
  children: ReactNode;
}

export function ListPendingState({ children }: iListPendingStateProps) {
  return <div className="space-y-4">{children}</div>;
}

interface iListErrorStateProps {
  message: string;
  onRetry?: () => void | Promise<void>;
}

export function ListErrorState({ message, onRetry }: iListErrorStateProps) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
      <p className="text-destructive">{message}</p>
      {onRetry ? (
        // eslint-disable-next-line no-void
        <Button variant="outline" onClick={() => void onRetry()}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
