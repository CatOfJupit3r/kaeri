import { LuCircleAlert, LuRefreshCw } from 'react-icons/lu';

import { Alert, AlertDescription, AlertTitle } from '@~/components/ui/alert';
import { Button } from '@~/components/ui/button';

interface iSeriesErrorProps {
  error: Error;
  onRetry?: () => void;
}

export function SeriesError({ error, onRetry }: iSeriesErrorProps) {
  const isNotFound = error.message.includes('404') || error.message.includes('not found');

  return (
    <div className="flex h-[400px] items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <LuCircleAlert className="size-4" />
        <AlertTitle>{isNotFound ? 'Series Not Found' : 'Error Loading Series'}</AlertTitle>
        <AlertDescription className="mt-2">
          {isNotFound
            ? 'The series you are looking for could not be found. It may have been deleted or you may not have access to it.'
            : `We encountered an error while loading your series: ${error.message}. Please try again.`}
        </AlertDescription>
        {onRetry ? (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
              <LuRefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        ) : null}
      </Alert>
    </div>
  );
}
