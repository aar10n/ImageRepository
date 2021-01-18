import { Color, KeyofType, Orientation } from 'core/types';

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

// color?: string;
// people?: boolean;
// num_people?: number;
// min_height?: number;
// min_width?: number;
// orientation?: Orientation;

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
