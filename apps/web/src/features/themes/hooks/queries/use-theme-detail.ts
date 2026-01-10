import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ThemeDetailQueryReturnType = ORPCOutputs['theme']['getTheme'];

export const themeDetailQueryOptions = (themeId: string) =>
  tanstackRPC.theme.getTheme.queryOptions({
    input: { themeId },
  });

export function useThemeDetail(themeId: string, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...themeDetailQueryOptions(themeId),
    enabled: (params.enabled ?? true) && !!themeId,
  });
}
