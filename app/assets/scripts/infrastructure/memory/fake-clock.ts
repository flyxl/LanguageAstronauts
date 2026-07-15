import type { Clock, TimerHandle } from "../../core/clock";

interface PendingTimer {
  id: number;
  dueAt: number;
  callback: () => void;
}

export class FakeClock implements Clock {
  private time: number;
  private nextId = 1;
  private readonly timers: PendingTimer[] = [];

  constructor(startAt = 0) {
    this.time = startAt;
  }

  now(): number {
    return this.time;
  }

  setTimeout(callback: () => void, delayMs: number): TimerHandle {
    const id = this.nextId++;
    this.timers.push({ id, dueAt: this.time + delayMs, callback });
    return id as unknown as TimerHandle;
  }

  clearTimeout(handle: TimerHandle): void {
    const id = handle as unknown as number;
    const index = this.timers.findIndex((timer) => timer.id === id);
    if (index >= 0) this.timers.splice(index, 1);
  }

  advanceBy(milliseconds: number): void {
    const target = this.time + milliseconds;
    while (true) {
      this.timers.sort((a, b) => a.dueAt - b.dueAt || a.id - b.id);
      const next = this.timers[0];
      if (!next || next.dueAt > target) break;
      this.timers.shift();
      this.time = next.dueAt;
      next.callback();
    }
    this.time = target;
  }
}
