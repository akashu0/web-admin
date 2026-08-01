import { createContext, useContext } from "react";

/**
 * The <main> element is the scroll container, not the window. Lists read this
 * ref as their IntersectionObserver root — a sentinel observed against the
 * window never intersects inside a scrolling <main>.
 */
export const ScrollRootContext = createContext<React.RefObject<HTMLElement | null> | null>(
  null,
);

export function useScrollRoot() {
  return useContext(ScrollRootContext);
}
