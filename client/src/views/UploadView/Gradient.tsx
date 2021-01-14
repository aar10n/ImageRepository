import { useState, useRef, useEffect } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import classnames from 'classnames';

interface Props {
  dragDepth: number;
  children?: React.ReactNode;
}

const ANIM_DURATION = 300;

const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      boxShadow: '0 5px 15px 0 rgba(0,0,0,.5)',
      borderRadius: '6px',
    },
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      pointerEvents: 'none',
    },
    backdrop: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      pointerEvents: 'none',
      zIndex: 0,
    },
    background: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: '#ffca41',
      pointerEvents: 'none',
      zIndex: 1,
    },
    foreground: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      background:
        'radial-gradient(755px at 77.71% -37.81%,#441b6f 0,rgba(23,23,66,0) 100%), transparent',
      pointerEvents: 'none',
      zIndex: 2,
    },
    content: {
      justifyContent: 'center',
      position: 'absolute',
      zIndex: 3,
    },

    dragEntry: {
      opacity: 1,
      animation: `$fadeOut ${ANIM_DURATION}ms ease-out`,
      animationFillMode: 'forwards',
    },
    dragExit: {
      opacity: 0,
      animation: `$fadeIn ${ANIM_DURATION}ms ease-in`,
      animationFillMode: 'forwards',
    },

    /* animations */
    '@keyframes fadeIn': {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    },
    '@keyframes fadeOut': {
      '0%': { opacity: 1 },
      '100%': { opacity: 0 },
    },
  })
);

export const Gradient = (props: Props) => {
  const [anim, setAnim] = useState('');
  const lastDepth = useRef(0);
  const classes = useStyles();
  const { dragDepth } = props;

  useEffect(() => {
    if (lastDepth.current === 0 && dragDepth === 1) {
      setAnim(classes.dragEntry);
      lastDepth.current = dragDepth;
    } else if (lastDepth.current > 0 && dragDepth === 0) {
      setAnim(classes.dragExit);
      lastDepth.current = dragDepth;
    }
  }, [dragDepth, classes]);

  return (
    <div className={classes.wrapper}>
      <div className={classes.container}>
        <div className={classes.content}>{props.children}</div>
        <div className={classes.foreground}></div>
        <div className={classnames(classes.background, anim)}></div>
        <div className={classes.backdrop}></div>
      </div>
    </div>
  );
};
