import axios from 'axios';
import { AnyFunction, Maybe, KeyofType, tuple } from 'core/types';

export const copy = <T>(obj: T): T => {
  let newObj: T;
  if (obj instanceof Array) {
    newObj = [] as any;
    for (let item of obj) {
      (newObj as any).push(copy(item));
    }
  } else if (typeof obj === 'object') {
    newObj = {} as any;
    for (let key in obj) {
      newObj[key] = copy(obj[key]);
    }
  } else {
    return obj;
  }
  return newObj;
};

export const debounce = <T extends AnyFunction>(fn: T, wait = 100): T => {
  let timeout: number;
  return function (this: any, ...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.call(this, ...args), wait) as any;
  } as T;
};

export const first = <T>(array: Maybe<T[]>): Maybe<T> => {
  if (!array || array.length === 0) {
    return undefined;
  }
  return array[0];
};

export const last = <T>(array: Maybe<T[]>): Maybe<T> => {
  if (!array || array.length === 0) {
    return undefined;
  }
  return array[array.length - 1];
};

export const index = <T>(array: Maybe<T[]>, i: number): Maybe<T> => {
  if (!array || array.length === 0) {
    return undefined;
  }

  if (i < 0) {
    i = array.length + i;
  }

  if (i < 0) return undefined;
  if (i > array.length - 1) return undefined;
  return array[i];
};

export const range = (s: number, e?: number, step?: number): number[] => {
  if (e && e <= s) throw new RangeError();
  if (step && step <= 0) throw new RangeError();

  const start = e === undefined ? 0 : s;
  const end = e === undefined ? s : e;
  const stepSize = step || 1;
  const len = Math.floor((end - start) / stepSize);
  return Array(len)
    .fill(0)
    .map((_, index) => start + index * stepSize);
};

export const reverse = <T>(array: T[]): T[] => [...array].reverse();

export const pickOne = <T>(...args: T[]): T =>
  args[Math.floor(Math.random() * args.length)];

export function sum(arr: number[]): number;
export function sum<T, K extends keyof T>(
  arr: T[],
  key: KeyofType<number, T, K>
): number;
export function sum(arr: any[], key?: string): number {
  if (key) {
    return arr.reduce((acc, obj) => acc + obj[key], 0);
  }
  return arr.reduce((acc, val) => acc + val, 0);
}

export const zip = <A, B>(arr1: A[], arr2: B[]): [A, B][] => {
  const len = Math.min(arr1.length, arr2.length);
  return Array(len)
    .fill(0)
    .map((_, index) => tuple(arr1[index], arr2[index]));
};

//

interface ImagesResponse {
  urls: string[];
  seed: string;
}

export const generateRandomImages = async (count: number, seed?: string) => {
  let url = `http://localhost:1234?count=${count}`;
  if (seed) {
    url += `;seed=${seed}`;
  }

  const result = await axios.get<ImagesResponse>(url);
  const baseURL = result.request.responseURL.split('?')[0];
  console.log(`seed = ${result.data.seed}`);
  return Promise.all(
    result.data.urls.map(url => {
      const image = new Image();
      image.src = `${baseURL}${url}`;
      return new Promise<{ url: string; width: number; height: number }>(
        res => {
          image.onload = () => {
            res({
              url: image.src,
              width: image.width,
              height: image.height,
            });
          };
        }
      );
    })
  );
};
