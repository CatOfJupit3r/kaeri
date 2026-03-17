import { LuEye, LuUsers } from 'react-icons/lu';

import { Avatar, AvatarFallback, AvatarImage } from '@~/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@~/components/ui/tooltip';
import { usePresence, usePresenceHeartbeat } from '@~/hooks/use-presence';
import type { PresenceEntry } from '@~/hooks/use-presence';

// Presence target types match the contract enum
type PresenceTargetType = 'series' | 'script' | 'scene';

interface iPresenceIndicatorProps {
  targetType: PresenceTargetType;
  targetId: string;
  /** Optional context to show what the current user is doing (e.g., "editing", "viewing") */
  context?: string;
  /** Maximum number of avatars to show before collapsing */
  maxDisplay?: number;
  /** Whether to show the viewing icon when no other users are present */
  showEmpty?: boolean;
  /** Whether to send heartbeats (disable if just viewing others) */
  sendHeartbeat?: boolean;
}

export function PresenceIndicator({
  targetType,
  targetId,
  context,
  maxDisplay = 3,
  showEmpty = false,
  sendHeartbeat = true,
}: iPresenceIndicatorProps) {
  // Track presence heartbeat
  usePresenceHeartbeat({
    targetType,
    targetId,
    context,
    enabled: sendHeartbeat,
  });

  // Query current presence
  const { data: presence, isPending } = usePresence(targetType, targetId);

  // Don't show anything while loading
  if (isPending) {
    return null;
  }

  const users = presence?.users ?? [];
  const otherUsers = users.filter((u) => u.userId !== undefined); // Filter out invalid entries

  // Show empty state if configured
  if (otherUsers.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <LuEye className="h-3.5 w-3.5" />
        <span className="text-xs">Only you</span>
      </div>
    );
  }

  const displayUsers = otherUsers.slice(0, maxDisplay);
  const remainingCount = otherUsers.length - maxDisplay;

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex -space-x-2">
            {displayUsers.map((user) => (
              <PresenceAvatar key={user.userId} user={user} />
            ))}
            {remainingCount > 0 ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                +{remainingCount}
              </div>
            ) : null}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <LuUsers className="h-3 w-3" />
              <span>
                {otherUsers.length} user{otherUsers.length !== 1 ? 's' : ''} viewing
              </span>
            </div>
            <ul className="text-xs">
              {otherUsers.map((user) => (
                <li key={user.userId} className="text-muted-foreground">
                  {user.user?.name ?? 'Unknown user'}
                  {user.context ? <span className="ml-1">({user.context})</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function PresenceAvatar({ user }: { user: PresenceEntry }) {
  const initials = user.user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar className="h-6 w-6 border-2 border-background">
          <AvatarImage src={user.user?.image} alt={user.user?.name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{user.user?.name ?? 'Unknown user'}</p>
        {user.context ? <p className="text-xs text-muted-foreground">{user.context}</p> : null}
      </TooltipContent>
    </Tooltip>
  );
}

// Export a simpler version just for displaying presence without sending heartbeats
export function PresenceAvatars({
  targetType,
  targetId,
  maxDisplay = 3,
}: {
  targetType: PresenceTargetType;
  targetId: string;
  maxDisplay?: number;
}) {
  return (
    <PresenceIndicator
      targetType={targetType}
      targetId={targetId}
      maxDisplay={maxDisplay}
      sendHeartbeat={false}
      showEmpty={false}
    />
  );
}
