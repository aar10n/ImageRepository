import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getToastKind, getToastMessage } from 'redux/toast/selectors';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { clearToast } from 'redux/toast/actions';
import classNames from 'classnames';

library.add(faTimes);

interface Props {
  timeout?: number;
}

interface StyleProps {
  main: string;
  dark: string;
  text: string;
  hover: string;
}

const toastTypes = {
  error: {
    main: '#f44336',
    dark: '#d32f2f',
    hover: '#a82424',
    text: '#ffffff',
  },
};

const useStyles = makeStyles(() =>
  createStyles({
    container: (props: StyleProps) => ({
      position: 'absolute',
      width: '300px',
      height: '70px',
      bottom: '5%',
      left: 'calc(50% - 150px)',
      borderRadius: '12px',
      backgroundColor: props.main,
      boxShadow: '0 3px 7px 0 rgba(0, 0, 0, .4)',
      zIndex: 10,
    }),
    inner: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    },
    close: (props: StyleProps) => ({
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      position: 'absolute',
      color: props.text,
      backgroundColor: props.dark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      right: 5,
      top: 5,

      '&:hover': {
        backgroundColor: props.hover,
      },

      '& *': {
        transform: 'translate(-0.03em, 0.04em)',
      },
    }),
    content: {
      fontFamily: 'Helvetica, Arial',
      fontSize: '16px',
      marginLeft: '20px',
    },

    /* animations */

    animateIn: {
      animation: '$pop-in 0.3s ease',
      animationFillMode: 'forwards',
    },
    animateOut: {
      animation: '$pop-out 0.3s ease',
      animationFillMode: 'forwards',
    },

    '@keyframes pop-in': {
      '0%': { transform: 'scale(0)' },
      '80%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' },
    },
    '@keyframes pop-out': {
      '0%': { transform: 'scale(1)' },
      '20%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(0)' },
    },
  })
);

export const Toast = (props: Props) => {
  const [style, setStyle] = useState('');
  const timer = useRef<number | null>(null);
  const kind = useSelector(getToastKind);
  const message = useSelector(getToastMessage);
  const dispatch = useDispatch();
  const classes = useStyles(toastTypes['error']);
  const timeout = props.timeout ?? 5000;

  const handleClose = useCallback(() => {
    setStyle(classes.animateOut);
    setTimeout(() => {
      setStyle(classes.animateIn);
      dispatch(clearToast());
    }, 300);
  }, [classes, dispatch]);

  useEffect(() => {
    if (!kind) return;

    setStyle(classes.animateIn);
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    if (timeout > 0) {
      timer.current = setTimeout(() => {
        handleClose();
      }, timeout) as any;
    }

    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, [kind, classes, timeout, handleClose]);

  return kind && style ? (
    <div className={classNames(classes.container, style)}>
      <div className={classes.inner}>
        <div className={classes.close} onClick={handleClose}>
          <FontAwesomeIcon icon="times" />
        </div>
        <div className={classes.content}>{message}</div>
      </div>
    </div>
  ) : null;
};
