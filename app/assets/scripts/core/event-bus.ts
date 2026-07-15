export type EventHandler<T> = (payload: T) => void;

export class EventBus<E extends object> {
  private readonly handlers = new Map<keyof E, Set<EventHandler<never>>>();

  on<K extends keyof E>(type: K, handler: EventHandler<E[K]>): () => void {
    const set = this.handlers.get(type) ?? new Set<EventHandler<never>>();
    set.add(handler as EventHandler<never>);
    this.handlers.set(type, set);
    return () => {
      set.delete(handler as EventHandler<never>);
      if (set.size === 0) this.handlers.delete(type);
    };
  }

  emit<K extends keyof E>(type: K, payload: E[K]): void {
    const snapshot = [...(this.handlers.get(type) ?? [])];
    for (const handler of snapshot) {
      (handler as EventHandler<E[K]>)(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
