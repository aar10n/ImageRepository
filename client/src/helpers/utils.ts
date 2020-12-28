import axios from 'axios';
import { AnyFunction, Maybe, tuple } from 'core/types';

export const debounce = (fn: AnyFunction, wait = 100): AnyFunction => {
  let timeout: number;
  return function (this: any, ...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.call(this, ...args), wait) as any;
  };
};

export const first = <T>(array: Maybe<T[]>): Maybe<T> => {
  if (!array || array.length === 0) {
    return null;
  }
  return array[0];
};

export const last = <T>(array: Maybe<T[]>): Maybe<T> => {
  if (!array || array.length === 0) {
    return null;
  }
  return array[array.length - 1];
};

export const range = (s: number, e?: number): number[] => {
  if (e && e <= s) e = undefined;
  const start = e === undefined ? 0 : e;
  const end = e === undefined ? s : e;
  return Array(end - start)
    .fill(0)
    .map((_, index) => index + start);
};

export const zip = <A, B>(arr1: A[], arr2: B[]): [A, B][] => {
  const len = Math.min(arr1.length, arr2.length);
  return Array(len)
    .fill(0)
    .map((_, index) => tuple(arr1[index], arr2[index]));
};

//

export const generateRandomImages = async (count: number) => {
  const url = 'http://localhost:8000';
  const results = await Promise.all(
    Array(count)
      .fill(0)
      .map(_ => axios.get(url))
  );

  // console.log(results);
  return Promise.all(
    results.map(r => {
      const image = new Image();
      image.src = `${r.request.responseURL}${r.data.url}`;
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

export const generateImageUrls = (count: number) => {
  const sizes = [
    tuple(640, 853),
    tuple(1080, 1620),
    tuple(1080, 720),
    tuple(1080, 1349),
    tuple(1080, 1618),
  ];

  return Array(count)
    .fill(0)
    .map(_ => {
      const [width, height] = sizes[Math.floor(Math.random() * sizes.length)];
      return {
        width,
        height,
        url: `https://dummyimage.com/${width}x${height}`,
      };
    });
};
