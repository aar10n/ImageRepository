export type AnyFunction = (...args: any[]) => any;

export type Maybe<T> = T | null | undefined;
export type ElementType<T> = T extends (infer E)[] ? E : never;

export type KeyofType<T, O, K extends keyof O> = O[K] extends T ? K : never;

export const tuple = <T extends any[]>(...args: T) => args;

//
// API Types
//

export interface Metadata {
  description?: string;
  private?: boolean;
  tags?: string[];
}

export interface UploadResponse {
  url: string;
  tags: string[];
}
