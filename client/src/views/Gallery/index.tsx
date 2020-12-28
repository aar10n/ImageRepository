import { useEffect, useState, useRef } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
// import GridList from '@material-ui/core/GridList';
// import GridListTile from '@material-ui/core/GridListTile';
import classnames from 'classnames';

import { debounce, generateRandomImages } from 'helpers/utils';

enum Orientation {
  Landscape,
  Portrait,
  Square,
}

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

const ROW_HEIGHT = 300;

const useStyles = makeStyles(() =>
  createStyles({
    grid: {
      display: 'grid',
      gridTemplateRows: `repeat(auto-fill, minmax(${ROW_HEIGHT}px, 1fr))`,
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      justifyContent: 'center',
      alignContent: 'start',
      gridAutoRows: '300px',
      // gridAutoFlow: 'row',
      height: ROW_HEIGHT,
      minHeight: ROW_HEIGHT,
      maxHeight: ROW_HEIGHT,
      gap: '8px',
    },
    item: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderRadius: '10px',
      boxShadow: '2px 2px 2px 0px rgba(100, 100, 100, 0.5)',

      '& img': {
        flexShrink: 0,
        minWidth: '100%',
        minHeight: '100%',
        transform: 'scale(0.5)',
      },

      '&.portrait-sm': {
        gridColumn: 'span 1',
      },

      '&.portrait-md': {
        gridColumn: 'span 1',
      },

      '&.landscape-sm': {
        gridColumn: 'span 1',
      },

      '&.landscape-md': {
        gridColumn: 'span 2',
      },

      '&.landscape-lg': {
        gridColumn: 'span 3',
      },
    },
  })
);

const getBadness = (orientation: Orientation) => {
  switch (orientation) {
    case Orientation.Landscape:
      return 2;
    case Orientation.Portrait:
    case Orientation.Square:
      return 1;
  }
};

const getOrientationStr = (orientation: Orientation) => {
  switch (orientation) {
    case Orientation.Landscape:
      return 'landscape';
    case Orientation.Portrait:
      return 'portrait';
    case Orientation.Square:
      return 'square';
  }
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

const reflowImages = (images: GalleryImage[], columns: number) => {
  if (columns === 0) {
    return [];
  }

  console.log('reflowing images');
  let badness = 0;
  let line: string[] = [];
  let classNames: string[] = [];
  for (let image of images) {
    const { orientation } = image;

    badness += getBadness(orientation);
    // console.log(`baddness: ${badness}`);

    let className: string;
    if (orientation === Orientation.Landscape) {
      if (badness > columns) {
        className = 'landscape-sm';
      } else {
        className = 'landscape-md';
      }
    } else {
      className = 'portrait';
    }

    line.push(className);
    if (badness >= columns) {
      console.log(line.join(' | '));
      classNames = [...classNames, ...line];

      badness = 0;
      line = [];
    }
  }

  return classNames;
};

export const Gallery = () => {
  const [columns, setColumns] = useState<number>(0);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [imageClasses, setImageClasses] = useState<string[]>([]);
  const galleryRef = useRef<HTMLDivElement>(null);
  const classes = useStyles();

  // runs once on render
  useEffect(() => {
    const getColumns = () => {
      console.log('getting columns');
      if (galleryRef.current !== null) {
        return window
          .getComputedStyle(galleryRef.current, null)
          .getPropertyValue('grid-template-columns')
          .split(' ').length;
      }
      return 0;
    };

    const fetchImages = async () => {
      const images = makeGalleryImages(await generateRandomImages(9));
      setImages(images);

      for (let image of images) {
        const { width, height, orientation } = image;
        console.log(
          `image: ${width}x${height} | ${getOrientationStr(orientation)}`
        );
      }

      // this must be done after the images have been loaded
      setColumns(getColumns());
    };

    const resizeListener = debounce(() => setColumns(getColumns), 150);
    window.addEventListener('resize', resizeListener);
    fetchImages();

    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  // runs whenever the number of grid columns change
  useEffect(() => {
    console.log(`grid columns: ${columns}`);
    setImageClasses(reflowImages(images, columns));
  }, [columns, images]);

  return (
    <div ref={galleryRef} className={classes.grid}>
      {images.map((image, index) => (
        <div
          className={classnames(classes.item, imageClasses[index])}
          key={index}
        >
          <img src={image.url} alt="" />
        </div>
      ))}
    </div>
  );
};
