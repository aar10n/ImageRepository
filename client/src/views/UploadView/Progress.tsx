import { createStyles, makeStyles } from '@material-ui/core/styles';

interface Props {
  percent: number;
}

const useStyles = makeStyles(() =>
  createStyles({
    progress: {
      width: '80%',
      height: '15%',
    },
  })
);

export const Progress = (props: Props) => {
  const classes = useStyles();
  const { percent } = props;

  return (
    <progress className={classes.progress} value={percent} max={100}>
      {percent}%
    </progress>
  );
};
