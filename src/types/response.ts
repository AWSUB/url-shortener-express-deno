export interface AppResponse<T = unknown> {
  message: string;
  data?: T;
}
