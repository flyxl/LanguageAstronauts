export const sys = {
  os: "Unknown",
  isNative: false,
};

export const native = {
  reflection: null as { callStaticMethod?: (...args: unknown[]) => unknown } | null,
};
