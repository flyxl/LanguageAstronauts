import type { Clock, TimerHandle } from "../../core/clock";

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
  setTimeout(callback: () => void, delayMs: number): TimerHandle {
    return setTimeout(callback, delayMs);
  }
  clearTimeout(handle: TimerHandle): void {
    clearTimeout(handle);
  }
}
