import { useEffect, useRef } from "react";
import { useScrollRoot } from "@/components/layout/scroll-root";

/**
 * Attach the returned ref to a sentinel at the bottom of a list. When it
 * scrolls into view (inside the <main> scroll container), `onLoadMore` fires.
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  opts: { hasMore: boolean; loading: boolean },
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const root = useScrollRoot();
  const cb = useRef(onLoadMore);

  useEffect(() => {
    cb.current = onLoadMore;
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !opts.hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !opts.loading) cb.current();
      },
      { root: root?.current ?? null, rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [opts.hasMore, opts.loading, root]);

  return sentinelRef;
}
