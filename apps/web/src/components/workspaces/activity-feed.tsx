import { formatDistanceToNow } from 'date-fns';
import { LuFileText, LuFolder, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';

import { Card, CardContent, CardHeader, CardTitle } from '@~/components/ui/card';
import { useWorkspaceActivity } from '@~/hooks/queries/use-workspace-activity';
import type { ActivityEntry } from '@~/hooks/queries/use-workspace-activity';

interface iActivityFeedProps {
  workspaceId: string;
}

const actionIcons: Record<ActivityEntry['action'], typeof LuPlus> = {
  CREATE: LuPlus,
  UPDATE: LuPencil,
  DELETE: LuTrash2,
};

const actionColors: Record<ActivityEntry['action'], string> = {
  CREATE: 'text-green-600 bg-green-100',
  UPDATE: 'text-blue-600 bg-blue-100',
  DELETE: 'text-red-600 bg-red-100',
};

const entityIcons: Record<string, typeof LuFileText> = {
  series: LuFolder,
  script: LuFileText,
  character: LuFileText,
  location: LuFileText,
};

export function ActivityFeed({ workspaceId }: iActivityFeedProps) {
  const { data, isPending, error } = useWorkspaceActivity(workspaceId);

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* eslint-disable react/no-array-index-key */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
            {/* eslint-enable react/no-array-index-key */}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load activity: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const entries = data?.entries ?? [];

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity in this workspace.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <ActivityItem key={entry._id} entry={entry} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const ActionIcon = actionIcons[entry.action];
  const EntityIcon = entityIcons[entry.entityType.toLowerCase()] ?? LuFileText;
  const iconColorClass = actionColors[entry.action];

  const actionText = {
    CREATE: 'created',
    UPDATE: 'updated',
    DELETE: 'deleted',
  }[entry.action];

  return (
    <div className="flex items-start gap-3">
      <div className={`rounded-full p-2 ${iconColorClass}`}>
        <ActionIcon className="h-4 w-4" />
      </div>

      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{entry.actorName ?? 'Unknown user'}</span> {actionText}{' '}
          <span className="font-medium">{entry.entityName ?? entry.entityType}</span>
          {entry.seriesTitle ? (
            <span className="text-muted-foreground">
              {' '}
              in <span className="font-medium">{entry.seriesTitle}</span>
            </span>
          ) : null}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
        </p>
      </div>

      <EntityIcon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
