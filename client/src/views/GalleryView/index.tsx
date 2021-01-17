import { useEffect, useState, useRef } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { debounce, range } from 'core/utils';
import { LayoutEngine } from 'core/LayoutEngine';
import { tuple, Thumbnail } from 'core/types';

interface Props {
  images: Thumbnail[];
}

interface StylesProps {
  numColumns: number;
  rowHeight: number;
  gridGap: number;
}

const useStyles = makeStyles<Theme, StylesProps>(theme =>
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
      boxShadow: theme.shadows[10],
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

const getStyles = (span: number): React.CSSProperties => ({
  gridColumn: `span ${span}`,
});

export const Gallery = (props: Props) => {
  const [columns, setColumns] = useState<number>(0);
  const [spans, setSpans] = useState<number[]>([]);
  const galleryRef = useRef<HTMLDivElement>(null);
  const layoutEngine = useRef<LayoutEngine>();
  const { images } = props;

  const classes = useStyles({
    numColumns: columns,
    rowHeight: 300,
    gridGap: 8,
  });

  useEffect(() => {
    if (images.length === 0) return;

    const engine = new LayoutEngine(images, {
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

    layoutEngine.current = engine;
  }, [images]);

  // runs once on render
  useEffect(() => {
    setColumns(getNumColumns());
    const resizeListener = debounce(() => setColumns(getNumColumns()), 200);
    window.addEventListener('resize', resizeListener);

    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  // runs whenever the number of grid columns changes
  useEffect(() => {
    if (columns === 0 || !layoutEngine.current) return;
    const widths = layoutEngine.current.layout(columns);
    setSpans(widths);
  }, [columns]);

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
