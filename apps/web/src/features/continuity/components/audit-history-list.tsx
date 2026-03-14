import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { LuChevronDown, LuChevronRight, LuLoader, LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { cn } from '@~/lib/utils';

import type { AuditEntry } from '../hooks/queries/use-audit-list';

const ACTION_CONFIG = {
  CREATE: { icon: LuPlus, color: 'bg-green-100 text-green-700', label: 'Created' },
  UPDATE: { icon: LuPencil, color: 'bg-blue-100 text-blue-700', label: 'Updated' },
  DELETE: { icon: LuTrash2, color: 'bg-red-100 text-red-700', label: 'Deleted' },
} as const;

const ENTITY_TYPE_LABELS: Record<string, string> = {
  character: 'Character',
  location: 'Location',
  prop: 'Prop',
  timeline: 'Timeline',
  wildcard: 'Wildcard',
  scene: 'Scene',
  theme: 'Theme',
  'story-arc': 'Story Arc',
};

interface iAuditHistoryListProps {
  items: AuditEntry[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

interface iAuditEntryItemProps {
  entry: AuditEntry;
}

function AuditEntryItem({ entry }: iAuditEntryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = ACTION_CONFIG[entry.action];
  const IconComponent = config.icon;

  const getEntityName = () => {
    if (entry.action === 'DELETE' && entry.before) {
      return (
        (entry.before as { name?: string; title?: string; label?: string }).name ??
        (entry.before as { name?: string; title?: string; label?: string }).title ??
        (entry.before as { name?: string; title?: string; label?: string }).label ??
        entry.entityId
      );
    }
    if (entry.after) {
      return (
        (entry.after as { name?: string; title?: string; label?: string }).name ??
        (entry.after as { name?: string; title?: string; label?: string }).title ??
        (entry.after as { name?: string; title?: string; label?: string }).label ??
        entry.entityId
      );
    }
    return entry.entityId;
  };

  const hasChanges = Boolean(entry.before) || Boolean(entry.after);

  const renderChevron = () => {
    if (!hasChanges) {
      return <div className="h-4 w-4 shrink-0" />;
    }
    if (isExpanded) {
      return <LuChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />;
    }
    return <LuChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />;
  };

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
      >
        {renderChevron()}

        <Badge className={cn('shrink-0', config.color)}>
          <IconComponent className="mr-1 h-3 w-3" />
          {config.label}
        </Badge>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {ENTITY_TYPE_LABELS[entry.entityType] ?? entry.entityType}
            </span>
            <span className="truncate font-medium">{getEntityName()}</span>
          </div>
        </div>

        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
        </span>
      </button>

      {isExpanded && hasChanges ? (
        <div className="border-t bg-muted/30 px-10 py-3">
          {entry.action === 'UPDATE' && entry.before != null && entry.after != null ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">Before</div>
                  <pre className="rounded bg-background p-2 text-[10px] break-all whitespace-pre-wrap">
                    {JSON.stringify(entry.before, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 font-semibold text-muted-foreground">After</div>
                  <pre className="rounded bg-background p-2 text-[10px] break-all whitespace-pre-wrap">
                    {JSON.stringify(entry.after, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : null}

          {entry.action === 'CREATE' && entry.after != null ? (
            <div>
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Created Data</div>
              <pre className="rounded bg-background p-2 text-[10px] break-all whitespace-pre-wrap">
                {JSON.stringify(entry.after, null, 2)}
              </pre>
            </div>
          ) : null}

          {entry.action === 'DELETE' && entry.before != null ? (
            <div>
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Deleted Data</div>
              <pre className="rounded bg-background p-2 text-[10px] break-all whitespace-pre-wrap">
                {JSON.stringify(entry.before, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AuditHistoryList({ items, isLoading, hasMore, onLoadMore }: iAuditHistoryListProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <p className="text-lg font-medium">No audit history</p>
        <p className="text-sm">Changes to entities will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {items.map((entry) => (
            <AuditEntryItem key={entry._id} entry={entry} />
          ))}
        </div>

        {hasMore ? (
          <div className="p-4 text-center">
            <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoading}>
              {isLoading ? <LuLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Load More
            </Button>
          </div>
        ) : null}
      </ScrollArea>
    </div>
  );
}
