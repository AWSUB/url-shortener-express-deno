export const withCapturedLogs = async <T>(
  fn: () => T,
): Promise<[Awaited<T>, unknown[]]> => {
  const logged: unknown[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => void logged.push(...args);
  try {
    return [await fn(), logged];
  } finally {
    console.error = original;
  }
};
