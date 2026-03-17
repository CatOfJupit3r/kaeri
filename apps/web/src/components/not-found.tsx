import { Link } from '@tanstack/react-router';
import { LuHouse, LuSearch } from 'react-icons/lu';

import { Button } from './ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty';

export function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LuSearch aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Page Not Found</EmptyTitle>
          <EmptyDescription>The page you&apos;re looking for doesn&apos;t exist or has been moved.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/">
              <LuHouse className="mr-2 h-4 w-4" aria-hidden="true" />
              Go Home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
