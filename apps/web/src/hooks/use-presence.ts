import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

// Presence target types match the contract enum
type PresenceTargetType = 'series' | 'script' | 'scene';

// --- Types ---

export type PresenceAggregateReturnType = ORPCOutputs['presence']['getPresence'];
export type PresenceEntry = PresenceAggregateReturnType['users'][number];

// --- Query Options ---

export const presenceQueryOptions = (targetType: PresenceTargetType, targetId: string) =>
  tanstackRPC.presence.getPresence.queryOptions({
    input: { targetType, targetId },
  });

// --- Hooks ---

export function usePresence(targetType: PresenceTargetType, targetId: string) {
  return useQuery({
    ...presenceQueryOptions(targetType, targetId),
    // Refetch frequently to stay updated with presence changes
    refetchInterval: 15000, // 15 seconds
    staleTime: 10000, // 10 seconds
  });
}

// --- Heartbeat Hook ---

const HEARTBEAT_INTERVAL = 30000; // 30 seconds as per spec

interface iUsePresenceHeartbeatOptions {
  targetType: PresenceTargetType;
  targetId: string;
  context?: string;
  enabled?: boolean;
}

export function usePresenceHeartbeat({ targetType, targetId, context, enabled = true }: iUsePresenceHeartbeatOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutate: sendHeartbeat } = useMutation(
    tanstackRPC.presence.heartbeat.mutationOptions({
      // Silent - no toast on success or error for heartbeats
    }),
  );

  const heartbeat = useCallback(() => {
    if (!enabled) return;
    sendHeartbeat({ targetType, targetId, context });
  }, [enabled, sendHeartbeat, targetType, targetId, context]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    // Send initial heartbeat immediately
    heartbeat();

    // Set up interval for ongoing heartbeats
    intervalRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, heartbeat]);

  return { heartbeat };
}
