import { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { RouterOutputs } from "../utils/trpc";
export function debounce<Params extends number[]>(
  func: (...args: Params) => void,
  timeout: number
): (...args: Params) => void {
  let timer: NodeJS.Timeout;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}
