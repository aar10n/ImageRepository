import { useEffect } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { loadSavedSecrets } from 'redux/image/actions';

import { Search } from 'views/Search';
import { Upload } from 'views/Upload';
import { Image } from 'views/Image';
import { Toast } from 'views/Toast';
import { NotFound } from 'views/404';
import { Home } from 'views/Home';
import { Navbar } from 'views/Navbar';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
    },
    navbar: {
      width: '100%',
      height: '80px',
      marginBottom: '10px',
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
        <div className={classes.navbar}>
          <Navbar />
        </div>
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

          <Route component={NotFound} />
        </Switch>

        <Toast />
      </Router>
    </div>
  );
};

export default App;
