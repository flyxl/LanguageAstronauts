import type { RandomSource } from "../../core/random-source";

export class SequenceRandomSource implements RandomSource {
  private index = 0;
  constructor(private readonly values: readonly number[]) {}

  next(): number {
    if (this.index >= this.values.length) throw new Error("Random sequence exhausted");
    const value = this.values[this.index++];
    if (value < 0 || value >= 1) throw new Error(`Random value out of range: ${value}`);
    return value;
  }
}
