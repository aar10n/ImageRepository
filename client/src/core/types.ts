export type AnyFunction = (...args: any[]) => any;

export type Maybe<T> = T | null | undefined;
export type ElementType<T> = T extends (infer E)[] ? E : never;

export type KeyofType<T, O, K extends keyof O> = O[K] extends T ? K : never;

export const tuple = <T extends any[]>(...args: T) => args;

//
// API Types
//

export type Tag = string;

export interface Image {
  id: string;
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  orientation: Orientation;
  title: string | null;
  description: string | null;
  private: boolean;
  url: string;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface CreatedImage extends Image {
  secret: string;
}

export interface ImageInfo {
  title?: string;
  description?: string;
  private?: boolean;
  tags?: string[];
}

export enum Orientation {
  Landscape = 'landscape',
  Portrait = 'portrait',
  Square = 'square',
}
