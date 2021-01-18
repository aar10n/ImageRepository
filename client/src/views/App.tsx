import { useEffect } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Search } from 'views/Search';
import { Upload } from 'views/Upload';
import { Image } from 'views/Image';
import { Toast } from 'views/Toast';
import { useDispatch } from 'react-redux';
import { loadSavedSecrets } from 'redux/image/actions';
import { Home } from 'views/Home';

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
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    dispatch(loadSavedSecrets());
  }, [dispatch]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>

          <Route path="/upload">
            <Upload />
          </Route>

          <Route path="/search/:query?">
            <Search />
          </Route>

          <Route path="/i/:id">
            <Image />
          </Route>
        </Switch>

        <Toast />
      </Router>
    </div>
  );
};

export default App;
