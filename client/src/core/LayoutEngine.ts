import { copy, reverse, zip } from 'core/utils';
import { tuple } from 'core/types';

export enum Orientation {
  Landscape = 'landscape',
  Portrait = 'portrait',
  Square = 'square',
}

export interface LayoutItem {
  width: number;
  height: number;
}

export interface LayoutConfig {
  portrait: BoxConfig;
  square: BoxConfig;
  landscape: BoxConfig;
  debug?: boolean;
}

interface Box {
  item: LayoutItem;
  width: number;
  shrink: number;
  stretch: number;
  flex: number;
  orientation: Orientation;
}

interface BoxConfig {
  width: number;
  minWidth: number;
  maxWidth: number;
  shrinkPenalty: number;
  stretchPenalty: number;
}

type PenaltyKey = 'shrinkPenalty' | 'stretchPenalty';

type RowMetrics = [
  shrink: number,
  shrinkWidth: number,
  stretch: number,
  stretchWidth: number,
  badness: number
];

type Row = [boxes: Box[], score: number];

export class LayoutEngine {
  private boxes: Box[];
  private config: LayoutConfig;
  private debug: boolean;

  public constructor(items: LayoutItem[], config?: LayoutConfig) {
    this.config = config || {
      portrait: {
        width: 2,
        minWidth: 1,
        maxWidth: 2,
        shrinkPenalty: 0,
        stretchPenalty: 0,
      },
      square: {
        width: 3,
        minWidth: 2,
        maxWidth: 3,
        shrinkPenalty: 0,
        stretchPenalty: 0,
      },
      landscape: {
        width: 4,
        minWidth: 3,
        maxWidth: 5,
        shrinkPenalty: 0,
        stretchPenalty: 0,
      },
    };
    this.debug = config?.debug ?? false;

    this.boxes = items.map(item => {
      const orientation = this.getOrientation(item);
      const config = this.config[orientation];
      return {
        item,
        orientation,
        width: config.width,
        flex: Math.abs(config.maxWidth - config.minWidth),
        shrink: Math.abs(config.minWidth - config.width),
        stretch: Math.abs(config.maxWidth - config.width),
      };
    });
  }

  // find the

  public layout(width: number) {
    const start = performance.now();
    const rows = this.layoutBoxes(copy(this.boxes), width);
    const end = performance.now();
    this.log(`layout finished in ${(end - start).toFixed(3)} ms`);
    this.printRows(rows);
    return rows.flatMap(([r, _]) => r).map(b => b.width);
  }

  //
  // Private
  //

  /**
   * Lays out an array of boxes into rows of the given width. The
   * order of the boxes is preserved.
   *
   * @param boxes - The array of boxes to lay out.
   * @param width - The target width.
   * @returns An array of box rows.
   */
  private layoutBoxes(boxes: Box[], width: number): Row[] {
    let rows: [Box[], number][] = [];
    while (boxes.length > 0) {
      this.log(`ROW = ${rows.length + 1}`);
      const [[row, score], rest] = this.partition(boxes, width);
      boxes = rest;

      this.printRows(rows);
      this.log(this.getRowString([row, score]));
      if (score === width) {
        rows.push([row, score]);
        continue;
      }

      const [
        shrink,
        shrinkWidth,
        stretch,
        stretchWidth,
        badness,
      ] = this.calculate([row, score], width);
      this.log(`shrink: ${shrink} | stretch: ${stretch}`);
      this.log(
        `shrink width: ${shrinkWidth} | stretch width: ${stretchWidth} | badness: ${badness}`
      );

      // badness < 0 => drop last and stretch row
      // badness > 0 => shrink existing to fill row
      if (stretchWidth >= width && badness < 0) {
        // avoid any shrinking by dropping the last box from the row
        // and instead stretching the remaining boxes to fill the width
        this.log('>>> OPTION 1');

        // move the last element back into the boxes array
        const last = row.pop()!;
        boxes.unshift(last);

        const newScore = this.fitRowToWidth([row, score - last.width], width);
        this.log('>>> DONE');
        this.log(this.getRowString([row, newScore]));
        this.log('----------------');
        rows.push([row, newScore]);
      } else if (shrinkWidth <= width && badness > 0) {
        // we will opt to shrink the existing boxes down until they all
        // fit within the width
        this.log('>>> OPTION 2');

        const newScore = this.fitRowToWidth([row, score], width);

        this.log('>>> DONE');
        this.log(this.getRowString([row, newScore]));
        this.log('----------------');
        rows.push([row, newScore]);
      } else if (score < width) {
        // we're on the last row and can't fill it up all the way so we must
        // go back to previous rows and modify them so as to end up with a
        // complete final row
        this.log('>>> OPTION 3');
        this.log('----------------');

        const newRows = this.findWorkingLayout([...rows, [row, score]], width);
        this.log('NEW ROWS');
        this.printRows(newRows);
        this.log('>>> DONE');
        rows = newRows;
      } else if (stretchWidth >= width) {
        // there is flexibility in the row but it goes against the preferred
        // strategy indicated by the `badness` value.
        this.log('>>> OPTION 4');

        // move the last element back into the boxes array
        const last = row.pop()!;
        boxes.unshift(last);

        const newScore = this.fitRowToWidth([row, score - last.width], width);
        this.log('>>> DONE');
        this.log(this.getRowString([row, newScore]));
        this.log('----------------');
        // rows.push([row, newScore]);
        rows.push([row, score]);
      } else if (shrinkWidth <= width) {
        // there is flexibility in the row but it goes against the preferred
        // strategy indicated by the `badness` value.
        this.log('>>> OPTION 5');

        const newScore = this.fitRowToWidth([row, score], width);

        this.log('>>> DONE');
        this.log(this.getRowString([row, newScore]));
        this.log('----------------');
        // rows.push([row, newScore]);
        rows.push([row, score]);
      } else {
        // what do we do here?
        this.log('>>> UH OH <<<<');
        rows.push([row, score]);
      }
    }

    rows = rows.filter(([row, score]) => row.length > 0 && score > 0);
    for (let i = 0; i < rows.length; i++) {
      const [row, score] = rows[i];
      if (score === width) continue;
      const newScore = this.fitRowToWidth([row, score], width, true);
      rows[i] = [row, newScore];
    }

    this.printRows(rows);
    return rows;
  }

  /**
   * Paritions an array of boxes into two sections: the first being a
   * row at least as wide as the given width, the second being the rest
   * of the boxes.
   *
   * @param boxes - The array of boxes to parition.
   * @param width - The target width.
   */
  private partition(boxes: Box[], width: number): [Row, Box[]] {
    let score = 0;
    let i = 0;
    for (; i < boxes.length; i++) {
      score += boxes[i].width;
      if (score >= width) break;
    }
    return tuple(tuple(boxes.slice(0, i + 1), score), boxes.slice(i + 1));
  }

  /**
   * Calculates a number of key metrics for the given row. This includes
   * the maximum shrink, stretch, shrink width and stretch width of the
   * row. The shrink and shrink widths indicate the maximum a row can be
   * shrunk, and the minimum width it can be. The stretch and stretch widths
   * indicate the maximum the row can be stretched to if the last element
   * was excluded. The metrics also include a `badness` value, which is a
   * score that indicates the best way to transform the row. A badness less
   * than 0 means that the row should be stretch, whereas a baddness greater
   * than 0 means the row should be shrunk. A badness of 0 indicates the row
   * the row cannot fit the width at all.
   *
   * @param row - The row to calculate the metrics.
   * @param width - The target width.
   */
  private calculate(row: Row, width: number): RowMetrics {
    const [boxes, score] = row;

    let shrink = 0;
    let stretch = 0;
    let shrinkWidth = 0;
    let stretchWidth = 0;
    let shrinkPenalty = 0;
    let stretchPenalty = 0;

    const weighted = zip(
      this.sortByPenalty(boxes, 'shrinkPenalty'),
      this.sortByPenalty(boxes, 'stretchPenalty')
    );

    for (let i = 0; i < weighted.length; i++) {
      const [shr, str] = weighted[i];
      const shrConfig = this.config[shr.orientation];
      const strConfig = this.config[str.orientation];
      const isLast = i === boxes.length - 1;

      shrink += shr.shrink;
      shrinkWidth += shr.width - shr.shrink;
      if (shrinkWidth > width) {
        shrinkPenalty += shrConfig.shrinkPenalty * (shr.width / width);
      }

      stretch += str.stretch;
      stretchWidth += isLast ? 0 : str.width + str.stretch;
      if (stretchWidth < width) {
        stretchPenalty += isLast
          ? 0
          : strConfig.stretchPenalty * (str.width / width);
      }

      if (isLast && score < width && stretchWidth < width) {
        // badness = 0 indicates the special case of the last line
        // of images cannot be stretched to fill the row, so we should
        // go back and reflow the other images in order to end up with
        // a complete final row.
        return tuple(shrink, shrinkWidth, stretch, stretchWidth, 0);
      }
    }

    const badness =
      stretchPenalty - shrinkPenalty || (boxes.length === 1 ? 1 : -1);
    return tuple(shrink, shrinkWidth, stretch, stretchWidth, badness);
  }

  private calculateMinMax(boxes: Box[]): [number, number] {
    let minWidth = 0;
    let maxWidth = 0;
    for (let box of boxes) {
      minWidth += box.width - box.shrink;
      maxWidth += box.width + box.stretch;
    }
    return [minWidth, maxWidth];
  }

  private findWorkingLayout(rows: Row[], width: number): Row[] {
    if (rows.length <= 1) return rows;
    rows = copy(rows);

    this.printRows(rows);
    let index = rows.length - 1;
    while (true) {
      const [boxes, score] = rows[index];
      const aboveRow = rows[index - 1];
      if (!aboveRow) {
        const newScore = this.fitRowToWidth([boxes, score], width, true);
        rows[0] = [boxes, newScore];
        return rows;
      }

      const [aboveBoxes, aboveScore] = aboveRow;

      this.printRows(rows);
      const [, max] = this.calculateMinMax(boxes);
      const [[min, minScore], [rest, restScore]] = this.getMinimumBoxes(
        [reverse(aboveBoxes), aboveScore],
        width - max
      );

      min.reverse();
      rest.reverse();

      const [, aboveMax] = this.calculateMinMax(rest);

      const currentBoxes = [...min, ...boxes];
      const currentScore = this.fitRowToWidth(
        [currentBoxes, score + minScore],
        width
      );
      rows[index - 1] = [rest, restScore];
      rows[index] = [currentBoxes, currentScore];

      // this.printRows(rows);

      if (aboveMax >= width) {
        const newScore = this.fitRowToWidth(rows[index - 1], width);
        rows[index - 1] = [rows[index - 1][0], newScore];
        break;
      }

      index -= 1;
    }

    for (let i = 0; i < rows.length; i++) {
      const [boxes, score] = rows[i];
      if (score === width) continue;
      this.printRows(rows);
      const newScore = this.fitRowToWidth([boxes, score], width);
      this.printRows(rows);
      rows[i] = [rows[i][0], newScore];
    }

    // this.printRows(rows);
    return rows;
  }

  /**
   * Resizes boxes in the given row in order to best fit the given width.
   *
   * @param row - The row of boxes to fit.
   * @param width - The target width.
   * @param force - Whether or not to force shrink/stretch the boxes.
   * @returns The new width of the row.
   */
  private fitRowToWidth(row: Row, width: number, force = false): number {
    const [boxes, score] = row;

    let sortedBoxes: Box[];
    if (score < width) {
      sortedBoxes = this.sortByPenalty(boxes, 'stretchPenalty');
    } else if (score > width) {
      sortedBoxes = this.sortByPenalty(boxes, 'shrinkPenalty');
    } else {
      return width;
    }

    let count = 0;
    let newScore = score;
    while (true) {
      if (count > 5) break;
      count += 1;

      for (let i = 0; i < sortedBoxes.length; i++) {
        const box = sortedBoxes[i];
        if (newScore < width) {
          let diff = Math.abs(
            Math.min(Math.abs(width - newScore), box.stretch)
          );
          if (diff === 0 && force) {
            diff = 1;
          }

          box.width += diff;
          box.shrink += diff;
          box.stretch -= diff;
          newScore += diff;
        } else if (newScore > width) {
          let diff = Math.abs(Math.min(Math.abs(newScore - width), box.shrink));
          if (diff === 0 && force) {
            diff = 1;
          }

          box.width -= diff;
          box.shrink -= diff;
          box.stretch += diff;
          newScore -= diff;
        } else {
          break;
        }
      }

      if (newScore === width || !force) {
        break;
      }
    }

    return newScore;
  }

  /**
   * Partitions the row of boxes into two, with the first section
   * representing the minimum number of boxes that will fill the
   * given width and the second section representing the remaining
   * boxes in the row.
   *
   * @param row - The row of boxes to partition
   * @param width - The target width to fill
   * @returns A tuple containing two rows; the row with the minimum
   *          number of boxes to fill the width, and the remaining
   *          boxes.
   */
  private getMinimumBoxes(row: Row, width: number): [Row, Row] {
    const [boxes, score] = row;
    let stretchWidth = 0;
    let newScore = 0;
    let i = 0;
    for (; i < boxes.length; i++) {
      if (stretchWidth >= width) break;
      const box = boxes[i];
      stretchWidth += box.width + box.stretch;
      newScore += box.width;
    }

    return tuple(
      tuple(boxes.slice(0, i), newScore),
      tuple(boxes.slice(i), score - newScore)
    );
  }

  /**
   * Determines the orientation of a box with a given width and height.
   * If the difference between the width and the height is less than 10%
   * the image is considered square.
   *
   * @param item - The abstract box to use.
   * @returns The orientation of the given box.
   */
  private getOrientation(item: LayoutItem): Orientation {
    const { width, height } = item;
    const diff = width / height - height / width;
    if (Math.abs(diff) <= 0.1) {
      return Orientation.Square;
    }
    return diff < 0 ? Orientation.Portrait : Orientation.Landscape;
  }

  /**
   * Sorts an array of boxes by the specified penalty in ascending order.
   *
   * @param boxes - The array of boxes to sort.
   * @param key - The key to use while sorting.
   * @returns A new array sorted by the given penalty.
   */
  private sortByPenalty(boxes: Box[], key: PenaltyKey): Box[] {
    return [...boxes].sort(
      (a, b) => this.getConfig(a)[key] - this.getConfig(b)[key]
    );
  }

  /**
   * Returns the configuration object for a given box.
   */
  private getConfig(box: Box): BoxConfig {
    return this.config[box.orientation];
  }

  /**
   * Returns a string representing the given row.
   * Useful for debugging.
   */
  private getRowString(row: Row): string {
    const [boxes, score] = row;
    const scores = boxes.map(b => {
      const minus = b.shrink ? `-${b.shrink}` : 0;
      const plus = b.stretch ? `+${b.stretch}` : 0;
      return `${b.width}(${minus}, ${plus})`;
    });
    return `${scores.join(' | ')} | [${score}]`;
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  private printRows(rows: Row[]) {
    if (this.debug) {
      console.log('----------------');
      for (let r of rows) {
        console.log(this.getRowString(r));
      }
      console.log('----------------');
    }
  }
}
