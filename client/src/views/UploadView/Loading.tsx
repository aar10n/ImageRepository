import { useEffect, useState, useRef } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { tuple } from 'core/types';

interface Props {
  numFiles?: number;
  complete?: boolean;
}

const useStyles = makeStyles(() =>
  createStyles({
    progressBar: {
      width: '80%',
      height: '8%',
      borderRadius: '8%/100%',
      backgroundColor: 'black',
      overflow: 'hidden',
    },
    progress: {
      width: '0%',
      height: '100%',
      backgroundColor: '#64b5f6',
    },
  })
);

export const Loading = (props: Props) => {
  const [style, setStyle] = useState<CSSProperties>();
  const classes = useStyles();
  const done = useRef(false);
  const barRef = useRef<HTMLDivElement>(null);

  const { numFiles, complete } = props;
  done.current = complete ?? false;

  const getBarProgress = () => {
    if (!barRef.current || !barRef.current.parentElement) return tuple(0, 0);

    const width = parseFloat(
      window.getComputedStyle(barRef.current).getPropertyValue('width')
    );
    const maxWidth = parseFloat(
      window
        .getComputedStyle(barRef.current.parentElement)
        .getPropertyValue('width')
    );

    return tuple(width, maxWidth);
  };

  useEffect(() => {
    const time = (numFiles ?? 0) * 1.15 * 1000;
    const almostDone = time * 0.8;

    setStyle({
      width: '100%',
      transition: `width ${time}ms linear`,
    });

    const id = setTimeout(() => {
      if (done.current) return;

      const [width] = getBarProgress();
      setStyle({
        width: `${width}px`,
      });
    }, almostDone);

    return () => {
      clearTimeout(id);
    };
  }, [numFiles]);

  useEffect(() => {
    if (!complete) return;
    if (!barRef.current) return;
    if (!barRef.current.parentElement) return;

    const [width, maxWidth] = getBarProgress();
    const completed = width / maxWidth;
    setStyle({
      width: '102%',
      transition: `width ${completed * 1000}ms ease-in`,
    });
  }, [complete]);

  return (
    <div className={classes.progressBar}>
      <div className={classes.progress} style={style} ref={barRef}></div>
    </div>
  );
};
