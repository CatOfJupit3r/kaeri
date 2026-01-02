import { LuPlus, LuFileText } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';

interface iSeriesEmptyStateProps {
  onCreateClick: () => void;
}

export function SeriesEmptyState({ onCreateClick }: iSeriesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-muted">
        <LuFileText className="size-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Get started by creating your first series. Bring your screenplay ideas to life!
      </p>
      <Button onClick={onCreateClick} className="mt-6 gap-2">
        <LuPlus className="size-4" />
        Create Your First Project
      </Button>
    </div>
  );
}
