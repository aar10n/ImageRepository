import { createStyles, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import { Gallery } from 'views/GalleryView';
import { Filter } from 'views/FilterView';
import { Search } from 'views/Search';
import { UploadView } from 'views/UploadView';
import { ImageView } from 'views/ImageView';
import { Toast } from 'views/Toast';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
    },
    filter: {
      width: '30%',
      float: 'left',
    },
    gallery: {
      width: '70%',
      float: 'right',
    },
  })
);

const App = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Router>
        <Switch>
          <Route exact path="/">
            <Link to="upload" style={{ color: 'white' }}>
              Upload
            </Link>
          </Route>

          <Route path="/upload">
            <UploadView />
          </Route>

          <Route path="/i/:id">
            <ImageView />
          </Route>
        </Switch>

        <Toast timeout={-1} />
      </Router>
    </div>
  );
};

export default App;
