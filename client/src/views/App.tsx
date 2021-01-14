import { createStyles, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Gallery } from 'views/GalleryView';
import { Filter } from 'views/FilterView';
import { Search } from 'views/Search';
import { UploadView } from 'views/UploadView';

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
            Hello, world!
          </Route>
          <Route path="/upload">
            <UploadView />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
