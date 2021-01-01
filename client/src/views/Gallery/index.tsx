import { useEffect, useState, useRef } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { debounce, generateRandomImages, range } from 'core/utils';
import { LayoutEngine, Orientation } from 'core/LayoutEngine';
import { tuple } from 'core/types';
interface ServerImage {
  url: string;
  width: number;
  height: number;
}

interface GalleryImage {
  url: string;
  width: number;
  height: number;
  orientation: Orientation;
}

interface StylesProps {
  numColumns: number;
  rowHeight: number;
  gridGap: number;
}

const useStyles = makeStyles<Theme, StylesProps>(() =>
  createStyles({
    grid: props => ({
      display: 'grid',
      gridTemplateRows: `repeat(auto-fill, ${props.rowHeight}px)`,
      gridTemplateColumns: `repeat(${props.numColumns}, 1fr)`,
      justifyContent: 'center',
      alignContent: 'start',
      gridAutoRows: props.rowHeight,
      height: props.rowHeight,
      minHeight: props.rowHeight,
      maxHeight: props.rowHeight,
      gap: props.gridGap,
    }),
    item: {
      boxShadow: '2px 2px 2px 0px rgba(100, 100, 100, 0.5)',
      overflow: 'hidden',
      borderRadius: '10px',
      width: '100%',
      height: '100%',
      '& img': {
        cursor: 'zoom-in',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
    },
  })
);

const breakpoints = Object.fromEntries(
  range(0, 5100, 100).map(value => {
    if (value <= 400) return tuple(value, 1);
    return tuple(value, (value - 400) / 100 + 1);
  })
);

const getNumColumns = () => {
  let width = window.innerWidth;
  if (width % 100 !== 0) {
    width = Math.round(width / 100) * 100;
  }
  return breakpoints[width];
};

const makeGalleryImages = (images: ServerImage[]) =>
  images.map(image => {
    const { width, height } = image;
    const diff = width / height - height / width;
    const isSquare = Math.abs(diff) <= 0.1; // 10%
    const orientation = isSquare
      ? Orientation.Square
      : diff < 0
      ? Orientation.Portrait
      : Orientation.Landscape;

    return { ...image, orientation };
  });

const getStyles = (span: number): React.CSSProperties => ({
  gridColumn: `span ${span}`,
});

export const Gallery = () => {
  const [columns, setColumns] = useState<number>(0);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [engine, setEngine] = useState<LayoutEngine>();
  const [spans, setSpans] = useState<number[]>([]);
  const galleryRef = useRef<HTMLDivElement>(null);
  const classes = useStyles({
    numColumns: columns,
    rowHeight: 300,
    gridGap: 8,
  });

  // runs once on render
  useEffect(() => {
    const fetchImages = async () => {
      const images = makeGalleryImages(await generateRandomImages(20));
      const layoutEngine = new LayoutEngine(images, {
        portrait: {
          width: 2,
          minWidth: 2,
          maxWidth: 3,
          shrinkPenalty: 1000,
          stretchPenalty: 300,
        },
        square: {
          width: 3,
          minWidth: 3,
          maxWidth: 4,
          shrinkPenalty: 500,
          stretchPenalty: 500,
        },
        landscape: {
          width: 4,
          minWidth: 3,
          maxWidth: 6,
          shrinkPenalty: 200,
          stretchPenalty: 0,
        },
      });

      // @ts-ignore
      window.engine = layoutEngine;

      setImages(images);
      setEngine(layoutEngine);
      setColumns(getNumColumns());
    };

    const resizeListener = debounce(() => setColumns(getNumColumns()), 200);
    window.addEventListener('resize', resizeListener);
    fetchImages();

    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  // runs whenever the number of grid columns changes
  useEffect(() => {
    if (columns === 0 || !engine) {
      return;
    }

    const widths = engine.layout(columns);
    setSpans(widths);
  }, [columns, images, engine]);

  return (
    <div id="gallery" ref={galleryRef} className={classes.grid}>
      {columns > 0 &&
        images.map((image, index) => (
          <div
            className={classes.item}
            style={getStyles(spans[index])}
            key={index}
          >
            <img className={classes.image} src={image.url} alt="" />
          </div>
        ))}
    </div>
  );
};
