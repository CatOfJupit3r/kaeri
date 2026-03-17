import { useCallback, useRef, useState } from 'react';

interface iUseIntersectionObserverOptions {
  /** Threshold at which to trigger (0 to 1) */
  threshold?: number;
  /** Root margin for the observer */
  rootMargin?: string;
  /** Whether the observer is enabled */
  enabled?: boolean;
}

interface iUseIntersectionObserverResult {
  /** Ref callback to attach to the sentinel element */
  ref: (node: HTMLElement | null) => void;
  /** Whether the element is intersecting */
  isIntersecting: boolean;
}

/**
 * Hook for observing when an element enters the viewport.
 * Useful for infinite scroll / load more patterns.
 *
 * @example
 * ```tsx
 * function InfiniteList() {
 *   const { ref, isIntersecting } = useIntersectionObserver({
 *     threshold: 0.1,
 *     enabled: hasMore,
 *   });
 *
 *   useEffect(() => {
 *     if (isIntersecting && hasMore) {
 *       loadMore();
 *     }
 *   }, [isIntersecting, hasMore, loadMore]);
 *
 *   return (
 *     <div>
 *       {items.map(item => <Item key={item.id} />)}
 *       <div ref={ref} /> // sentinel element
 *     </div>
 *   );
 * }
 * ```
 */
export function useIntersectionObserver(options: iUseIntersectionObserverOptions = {}): iUseIntersectionObserverResult {
  const { threshold = 0.1, rootMargin = '100px', enabled: isEnabled = true } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Don't observe if disabled or no node
      if (!isEnabled || !node) {
        setIsIntersecting(false);
        return;
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            setIsIntersecting(entry.isIntersecting);
          }
        },
        {
          threshold,
          rootMargin,
        },
      );

      observerRef.current.observe(node);
    },
    [isEnabled, threshold, rootMargin],
  );

  return { ref, isIntersecting };
}
