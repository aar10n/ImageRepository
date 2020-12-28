export type AnyFunction = (...args: any[]) => any;

export type Maybe<T> = T | null | undefined;
export type ElementType<T> = T extends (infer E)[] ? E : never;

export const tuple = <T extends any[]>(...args: T) => args;
