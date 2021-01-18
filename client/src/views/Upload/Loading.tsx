import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',

      '& span': {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        margin: '3px',
        transform: 'scale(0)',
        animation: '$bounce 1s infinite ease-in-out both',
      },
    },
    green: {
      backgroundColor: '#4caf50',
      animationDelay: '0s !important',
    },
    red: {
      backgroundColor: '#f44336',
      animationDelay: '0.2s !important',
    },
    orange: {
      backgroundColor: '#ff9800',
      animationDelay: '0.3s !important',
    },
    blue: {
      backgroundColor: '#2196f3',
      animationDelay: '0.35s !important',
    },

    /* animations */

    '@keyframes bounce': {
      '0%': { transform: 'scale(0)' },
      '50%': { transform: 'scale(1)' },
      '100%': { transform: 'scale(0)' },
    },
  })
);

export const Loading = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <span className={classes.green} />
      <span className={classes.red} />
      <span className={classes.orange} />
      <span className={classes.blue} />
    </div>
  );
};
