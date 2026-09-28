export const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });
