import type { RandomSource } from "../../core/random-source";

export class MathRandomSource implements RandomSource {
  next(): number {
    return Math.random();
  }
}
