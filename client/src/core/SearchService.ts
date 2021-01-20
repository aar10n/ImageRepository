import { Color, Orientation } from 'core/types';

export interface SearchOptions {
  color?: Color;
  people?: boolean;
  num_people?: number;
  min_height?: number;
  min_width?: number;
  orientation?: Orientation;
}

const NUMBER = new RegExp('^[0-9]+$');
const COLORS = Object.values(Color);
const ORIENTATIONS = Object.values(Orientation);

export default class SearchService {
  private constructor() {}

  public static validateOptions(query: string): SearchOptions {
    const params = new URLSearchParams(query);
    let options: SearchOptions = {};
    for (let [key, value] of params) {
      switch (key) {
        case 'color':
          this.validateString(options, key, value, COLORS);
          break;
        case 'people':
          this.validateBoolean(options, key, value);
          break;
        case 'num_people':
        case 'min_height':
        case 'min_width':
          this.validateNumber(options, key, value);
          break;
        case 'orientation':
          this.validateString(options, key, value, ORIENTATIONS);
          break;
      }
    }
    return options;
  }

  //

  public static updatePath(path: string, query: string, arg: string): string {
    const re = /(?<=\/search)(\/.*)$/;
    const escaped = encodeURI(arg.replace(' ', '+'));
    const updated = `${path.replace(re, '')}${escaped ? `/${escaped}` : ''}`;
    return `${updated}${query}`;
  }

  public static getSearchPath(path: string): string {
    const re = /(?<=\/search\/)(.*)$/;
    const part = path.match(re)?.[0]?.split('?')?.[0];
    if (!part) return '';
    return decodeURI(part).replace('+', ' ');
  }

  public static updateParam(url: string, param: string, value: any): string {
    const escaped = String(value).replace(' ', '+');
    const parts = url.split('?');
    if (parts[1]?.includes(param)) {
      return url.replace(
        new RegExp(`(?<=&|\\?)${param}=[^&]+`),
        `${param}=${escaped}`
      );
    }

    const sep = parts[1] !== undefined ? '&' : '?';
    return `${url}${sep}${param}=${escaped}`;
  }

  public static removeParam(url: string, param: string): string {
    return url.replace(
      new RegExp(`((&|\\?)${param}=[^&]+$|${param}=[^&]+&?)`),
      ''
    );
  }

  //

  private static validateString(
    options: SearchOptions,
    key: string,
    value: string,
    values: string[]
  ) {
    if (values.includes(value)) {
      (options as any)[key] = value;
    }
  }

  private static validateBoolean(
    options: SearchOptions,
    key: string,
    value: string
  ) {
    if (value === 'true') {
      (options as any)[key] = true;
    } else if (value === 'false') {
      (options as any)[key] = false;
    }
  }

  private static validateNumber(
    options: SearchOptions,
    key: string,
    value: string
  ) {
    if (NUMBER.test(value)) {
      (options as any)[key] = parseInt(value);
    }
  }
}
