import { createStyles, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { Gallery } from 'views/Gallery';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
    },
    gallery: {
      width: '80%',
      float: 'right',
    },
  })
);

const App = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CssBaseline />
      <div className={classes.gallery}>
        <Gallery />
      </div>
    </div>
  );
};

export default App;
